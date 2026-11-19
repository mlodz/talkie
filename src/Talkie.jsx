import './Talkie.css';

import { useRef, useState, useCallback } from 'react';
import { audioHandler } from './AudioHandlerSetup';
import CategoryData from './CategoryData';

import SoundJsWrapper from './SoundJsWrapper';
import SoundButton from './components/SoundButton';
import StarredList from './components/StarredList';
import { PlayIcon, BackspaceIcon, Icon } from './components/Icon';
import { VoiceLabeler, CategoryLabeler, sortVoices } from './Labels';
import {
  browserStorage,
  isStarred,
  loadStarred,
  removeStarred,
  saveStarred,
  sentenceKey,
  toggleStarred,
} from './StarredSentences';
import { ReactComponent as Logo } from './assets/talkie-logo.svg';


let defaultSequence = [];
const STARRED_TAB = 'starred';

export default function Talkie() {
  let [status, setStatus] = useState('');
  let [recording, setRecording] = useState(false);
  let [sequence, setSequence] = useState(defaultSequence);
  let [sequenceIndex, setSequenceIndex] = useState(-1);
  let [playingStarredKey, setPlayingStarredKey] = useState(null);
  let [logoBounceCount, setLogoBounceCount] = useState(0);
  let sequenceInterrupted = useRef(false);
  let fx = useRef(new SoundJsWrapper());
  window.fx = fx;
  let firstRender = useRef(true);
  let [selectedTab, setSelectedTab] = useState('julia');
  let [starred, setStarred] = useState(() =>
    loadStarred(browserStorage(), alias => Boolean(audioHandler.getSound(alias)))
  );

  let GROUPED_SOUNDS = audioHandler.getSoundsByVoiceByCategory();

  let isPlayingSequence = sequenceIndex >= 0;
  let voices = sortVoices(Array.from(GROUPED_SOUNDS.keys()));
  let categoryAliases = CategoryData.getSortedCategories();

  console.log({
    ALL_SOUNDS: audioHandler.getAllSounds(),
    GROUPED_SOUNDS,
    categoryAliases,
  });


  let isPlayingSequenceIndex = (index) => playingStarredKey === null && sequenceIndex === index;
  let disableAll = isPlayingSequence;
  let currentSentenceIsStarred = isStarred(starred, sequence);

  const playAliases = useCallback((aliases) => {
    if (disableAll) {
      return;
    }
    let chain = Promise.resolve();
    let index = 0;
    aliases.forEach((soundAlias, i) => {
      chain = chain.then(() => {
        setSequenceIndex(i);
        if (sequenceInterrupted.current) {
          return Promise.resolve();
        }
        return fx.current.play(soundAlias);
      });
    });
    chain
      .then(() => {
        setSequenceIndex(-1);
        setPlayingStarredKey(null);
        sequenceInterrupted.current = false;
      })
      .catch(e => {
        console.error(e);
      });
    ;
  }, [sequenceIndex]);

  const playSequence = useCallback(() => {
    playAliases(sequence);
  }, [playAliases, sequence]);

  const stopSequence = useCallback(() => {
    sequenceInterrupted.current = true;
  });

  const handleBackspace = useCallback(() => {
    setSequence(s => {
      let newSequence = [...s];
      newSequence.pop();
      return newSequence;
    });
  }, [sequence]);
  const handleClearSentence = useCallback(() => {
    setSequence([]);
  }, []);

  const handlePressClose = useCallback(() => {
    setRecording(false);
    setSequence([]);
  }, []);

  const changeStarred = (nextStarred) => {
    setStarred(nextStarred);
    saveStarred(browserStorage(), nextStarred);
  };

  const handleToggleStar = () => {
    changeStarred(toggleStarred(starred, sequence));
  };

  const handleRemoveStarred = (aliases) => {
    changeStarred(removeStarred(starred, aliases));
  };

  const handlePlayStarred = (aliases) => {
    if (disableAll) {
      return;
    }
    setPlayingStarredKey(sentenceKey(aliases));
    playAliases(aliases);
  };

  // Lands on the last word's voice tab so the kid can keep adding words in that voice.
  const handleEditStarred = (aliases) => {
    if (disableAll) {
      return;
    }
    let lastWord = audioHandler.getSound(aliases[aliases.length - 1]);
    setRecording(true);
    setSequence([...aliases]);
    setSelectedTab(lastWord ? lastWord.voice : voices[0]);
    window.scrollTo(0, 0);
  };

  const handleClickLogo = () => {
    setLogoBounceCount(count => count + 1);
    if (isPlayingSequence) {
      return;
    }
    let sounds = audioHandler.getAllSounds();
    let randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    fx.current.play(randomSound.alias);
  };

  const pressRecord = function() {
    setRecording(r => !r);
  };
  const addToSequence = function(alias) {
    if (recording) {
      setSequence(s => [...s, alias]);
    }
  };

  const handleClickSound = useCallback(function(alias) {
    addToSequence(alias);
    fx.current.play(alias);
  }, [recording]);

  const handleClickSequenceSound = useCallback(function(alias) {
    fx.current.play(alias);
  }, []);


  const registerSounds = function() {
    fx.current.registerSoundList(audioHandler.getAllSounds());
  };

  if (firstRender.current) {
    registerSounds();
    firstRender.current = false;
  }

  return (
    <div className="Talkie">
      <h1 className="logo">
        <button className="logo-button" aria-label="Talkie, say a random word" onClick={handleClickLogo}>
          <span key={logoBounceCount} className={logoBounceCount > 0 ? 'logo-bounce' : ''}>
            <Logo role="img" aria-hidden="true" />
          </span>
        </button>
      </h1>
      {recording
       ? <div className="recording-wrapper">
           <div className="recording">
             {sequence.map((alias, i) =>
               <SoundButton
                 disabled={isPlayingSequence}
                 isPlaying={isPlayingSequenceIndex(i)}
                 key={`${alias}-${i}`}
                 sound={audioHandler.getSound(alias)}
                 onClick={handleClickSequenceSound}
               />
             )}
             {sequence.length > 0
              ? <button
                className="backspace"
                  disabled={disableAll}
                onClick={() => handleBackspace()}>
                <BackspaceIcon className="backspace-button" />
                </button>
              : <div>Press words below to build a sentence.</div>
             }
           </div>
           <div className="recording-buttons">
           <button
             className="exit"
             aria-label="Close"
             disabled={disableAll}
             onClick={() => handlePressClose()}>
             <Icon type="x-circle" className="exit-button" /> <span className="button-label">Close</span>
           </button>
           <button
             className="clear-sentence"
             aria-label="Clear"
             disabled={disableAll || sequence.length === 0}
             onClick={() => handleClearSentence()}>
             <Icon type="trash" className="clear-sentence-button" /> <span className="button-label">Clear</span>
           </button>

           {sequence.length > 0 &&
            (
              !isPlayingSequence
                ? <button className="play" onClick={() => playSequence()}>
                  <PlayIcon className="play-button"/> Play
                </button>
              : <button className="stop" onClick={() => stopSequence()}>
            <Icon type="sign-stop-fill" className="stop-button"/> Stop
          </button>
            )
           }
           {sequence.length > 0 &&
            <button
              className="star-sentence"
              aria-label={currentSentenceIsStarred ? 'Remove star from sentence' : 'Star sentence'}
              aria-pressed={currentSentenceIsStarred}
              disabled={disableAll}
              onClick={() => handleToggleStar()}>
              <Icon type={currentSentenceIsStarred ? 'star-fill' : 'star'} className="star-sentence-icon" />
            </button>
           }
           </div>
         </div>
       :  <div className="begin-record-wrapper item">
            <button className="begin-recording-button" onClick={() => pressRecord()}>
              <Icon type="chat-left-fill" className="begin-recording-button" /> Begin Sentence
            </button>
         </div>
      }
      <div className="tab-wrapper">
        <ul className="voice-tabs">
          {voices.map(voiceAlias =>
            <li
              key={voiceAlias}
              className={`noselect voice-tab ${voiceAlias}${voiceAlias === selectedTab ? ' active' : ''}`}
              onClick={() => setSelectedTab(voiceAlias)}
            >
              <a aria-current="page" href="#">{VoiceLabeler.get(voiceAlias)}</a>
            </li>
          )}
          <li
            className={`noselect voice-tab ${STARRED_TAB}${selectedTab === STARRED_TAB ? ' active' : ''}`}
            onClick={() => setSelectedTab(STARRED_TAB)}
          >
            <a aria-label="Starred sentences" href="#"><Icon type="star-fill" /></a>
          </li>
        </ul>
        <div className={`tab-body-wrapper ${selectedTab}`}>
          {voices.map(voiceAlias => voiceAlias === selectedTab &&
                      <div className="" key={voiceAlias}>
                        {categoryAliases.map(categoryAlias => GROUPED_SOUNDS.get(voiceAlias).get(categoryAlias) && GROUPED_SOUNDS.get(voiceAlias).get(categoryAlias).length > 0 &&
                          <div className="category-group" key={categoryAlias}>
                            <h3 className="category">{CategoryLabeler.get(categoryAlias)}</h3>
                            {GROUPED_SOUNDS.get(voiceAlias).get(categoryAlias).map(sound =>
                              <SoundButton
                                disabled={isPlayingSequence}
                                isPlaying={false}
                                key={sound.alias}
                                sound={sound}
                                onClick={handleClickSound}
                              />
                            )}
                          </div>
                        )}
                      </div>
                     )}
          {selectedTab === STARRED_TAB &&
           <StarredList
             starred={starred}
             getSound={audioHandler.getSound.bind(audioHandler)}
             disabled={isPlayingSequence}
             playingKey={playingStarredKey}
             playingIndex={sequenceIndex}
             onPlay={handlePlayStarred}
             onStop={stopSequence}
             onEdit={handleEditStarred}
             onPlayWord={handleClickSequenceSound}
             onRemove={handleRemoveStarred}
           />
          }
        </div>
      </div>
    </div>
  );
}
