import { useRef, useState, useCallback } from 'react';

export default function SoundButton({sound, isPlaying, onClick, disabled}) {
  let klasses = ['SoundButton', 'noselect', sound.voice];
  if (isPlaying) {
    klasses.push('sound-is-playing');
  }
  if (!sound) {
    return <div>OH NO!</div>
  }

  return (
    <button
      disabled={disabled}
      className={klasses.join(' ')}
      onClick={() => onClick(sound.alias)}>
      {sound.name}
    </button>);
};
