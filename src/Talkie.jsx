import './Talkie.css';

import { useRef, useState, useCallback } from 'react';
import { audioHandler } from './AudioHandlerSetup';
import CategoryData from './CategoryData';

import SoundJsWrapper from './SoundJsWrapper';
import SoundButton from './components/SoundButton';
import { PlayIcon, BackspaceIcon, Icon } from './components/Icon';
import { VoiceLabeler, CategoryLabeler } from './Labels';


let defaultSequence = [];

export default function Talkie() {
  let [status, setStatus] = useState('');
  let [recording, setRecording] = useState(false);
  let [sequence, setSequence] = useState(defaultSequence);
  let [sequenceIndex, setSequenceIndex] = useState(-1);
  let sequenceInterrupted = useRef(false);
  let fx = useRef(new SoundJsWrapper());
  window.fx = fx;
  let firstRender = useRef(true);
  let [selectedTab, setSelectedTab] = useState('julia');

  let GROUPED_SOUNDS = audioHandler.getSoundsByVoiceByCategory();

  let isPlayingSequence = sequenceIndex >= 0;
  let voices = Array.from(GROUPED_SOUNDS.keys());
  let categoryAliases = CategoryData.getSortedCategories();

  console.log({
    ALL_SOUNDS: audioHandler.getAllSounds(),
    GROUPED_SOUNDS,
    categoryAliases,
  });


  let isPlayingSequenceIndex = (index) => sequenceIndex === index;
  let disableAll = isPlayingSequence;

  const playSequence = useCallback(() => {
    if (disableAll) {
      return;
    }
    let chain = Promise.resolve();
    let index = 0;
    sequence.forEach((soundAlias, i) => {
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
        sequenceInterrupted.current = false;
      })
      .catch(e => {
        console.error(e);
      });
    ;
  }, [sequenceIndex, sequence]);

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
  const handlePressClose = useCallback(() => {
    setRecording(false);
    setSequence([]);
  }, []);

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
      <h1>Talkie</h1>
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
             disabled={disableAll}
             onClick={() => handlePressClose()}>
             <Icon type="x-circle" className="exit-button" /> Close
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
           </div>
         </div>
       :  <div className="begin-record-wrapper item">
            <button className="begin-recording-button" onClick={() => pressRecord()}>
              <Icon type="chat-left-fill" className="begin-recording-button" /> Begin Recording
            </button>
         </div>
      }
      <div className="tab-wrapper">
        <ul className="nav nav-tabs">
          {voices.map(voiceAlias =>
            <li
              key={voiceAlias}
              className={"noselect nav-item "+ (voiceAlias === selectedTab ? 'active' : null)}
              onClick={() => setSelectedTab(voiceAlias)}
            >
              <a className="nav-link" aria-current="page" href="#">{VoiceLabeler.get(voiceAlias)}</a>
            </li>
          )}
        </ul>
        <div className="tab-body-wrapper">
          {voices.map(voiceAlias => voiceAlias === selectedTab &&
                      <div className="" key={voiceAlias}>
                        {categoryAliases.map(categoryAlias => GROUPED_SOUNDS.get(voiceAlias).get(categoryAlias) && GROUPED_SOUNDS.get(voiceAlias).get(categoryAlias).length > 0 &&
                          <div key={categoryAlias}>
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
        </div>
      </div>
      <div className="debug-controls">
        <button onClick={() => registerSounds()}>Register Sounds</button>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    </div>
  );
}
