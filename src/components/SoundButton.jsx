import { useRef, useState, useCallback, memo } from 'react';


const SoundButton = memo(function({sound, isPlaying, onClick, disabled}) {
  let klasses = ['SoundButton', 'noselect', sound.voice];
  if (isPlaying) {
    klasses.push('sound-is-playing');
  }
  if (!sound) {
    return <div>OH NO!</div>;
  }

  console.log('render button', sound.alias);
  return (
    <button
      disabled={disabled}
      className={klasses.join(' ')}
      onClick={() => onClick(sound.alias)}>
      {sound.name}
    </button>);
});


export default SoundButton;
