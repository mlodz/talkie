import './Talkie.css';

import { useRef, useState, useCallback } from 'react';
import { sortCategories, categoryDisplay, getSound, getVoice, ALL_SOUNDS, GROUPED_SOUNDS, JULIA_SOUNDS, STEVE_SOUNDS, BY_CATEGORY } from './SoundData';
import SoundJsWrapper from './SoundJsWrapper';
import SoundButton from './components/SoundButton';
import { PlayIcon, BackspaceIcon, Icon } from './components/Icon';

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

  let isPlayingSequence = sequenceIndex >= 0;
  let voices = Array.from(GROUPED_SOUNDS.keys()).map(getVoice);
  let isPlayingSequenceIndex = (index) => sequenceIndex === index;
  let disableAll = isPlayingSequence;

  const playSequence = useCallback(() => {
    if (disableAll) {
      return;
    }
    let chain = Promise.resolve();
    let sounds = sequence.map(alias =>
      ALL_SOUNDS.find(s => s.alias == alias)
    );
    let index = 0;
    sounds.forEach((sound, i) => {
      chain = chain.then(() => {
        setSequenceIndex(i);
        if (sequenceInterrupted.current) {
          return Promise.resolve();
        }
        return fx.current.play(sound.alias);
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
    fx.current.registerSoundList(ALL_SOUNDS);
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
                 sound={getSound(alias)}
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
          {voices.map(voice =>
            <li
              key={voice.alias}
              className={"noselect nav-item "+ (voice.alias === selectedTab ? 'active' : null)}
              onClick={() => setSelectedTab(voice.alias)}
            >
              <a className="nav-link" aria-current="page" href="#">{voice.name}</a>
            </li>
          )}
        </ul>
        <div className="tab-body-wrapper">
          {voices.map(voice => voice.alias === selectedTab &&
                      <div className="" key={voice.alias}>
                        {sortCategories([...GROUPED_SOUNDS.get(voice.alias).keys()]).map(categoryAlias =>
                          <div key={categoryAlias}>
                            <h3 className="category">{categoryDisplay(categoryAlias)}</h3>
                            {GROUPED_SOUNDS.get(voice.alias).get(categoryAlias).map(sound =>
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
