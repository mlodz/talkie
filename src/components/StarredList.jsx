import { useEffect, useState } from 'react';
import SoundButton from './SoundButton';
import { PlayIcon, Icon } from './Icon';
import { sentenceKey } from '../StarredSentences';

const CONFIRM_REMOVE_MS = 3000;

export default function StarredList({
  starred, getSound, disabled, playingKey, playingIndex, onPlay, onStop, onEdit, onPlayWord, onRemove,
}) {
  let [confirmingKey, setConfirmingKey] = useState(null);

  // Safari doesn't focus buttons on tap, so a blur handler can't cancel the confirmation.
  useEffect(() => {
    if (!confirmingKey) {
      return undefined;
    }
    let timer = setTimeout(() => setConfirmingKey(null), CONFIRM_REMOVE_MS);
    return () => clearTimeout(timer);
  }, [confirmingKey]);

  const handleRemove = (aliases) => {
    let key = sentenceKey(aliases);
    if (confirmingKey === key) {
      setConfirmingKey(null);
      onRemove(aliases);
    } else {
      setConfirmingKey(key);
    }
  };

  if (starred.length === 0) {
    return (
      <p className="starred-empty">
        Tap the <Icon type="star" /> on a sentence to save it here.
      </p>
    );
  }

  return (
    <ul className="starred-list">
      {starred.map(({aliases}) => {
        let key = sentenceKey(aliases);
        let isConfirming = confirmingKey === key;
        let isPlayingRow = playingKey === key;
        return (
          <li className="starred-row" key={key}>
            <div className="starred-words">
              {aliases.map((alias, i) =>
                <SoundButton
                  disabled={disabled}
                  isPlaying={isPlayingRow && playingIndex === i}
                  key={`${alias}-${i}`}
                  sound={getSound(alias)}
                  onClick={onPlayWord}
                />
              )}
            </div>
            <div className="starred-actions">
              {isPlayingRow
                ? <button className="starred-stop" onClick={() => onStop()}>
                    <Icon type="sign-stop-fill" /> Stop
                  </button>
                : <button
                    className="starred-play"
                    disabled={disabled}
                    onClick={() => onPlay(aliases)}>
                    <PlayIcon className="starred-play-icon" /> Play
                  </button>
              }
              <button
                className="starred-edit"
                aria-label="Edit sentence"
                disabled={disabled}
                onClick={() => onEdit(aliases)}>
                <Icon type="pencil-fill" />
              </button>
              <button
                className={`starred-remove${isConfirming ? ' confirming' : ''}`}
                aria-label="Remove starred sentence"
                disabled={disabled}
                onClick={() => handleRemove(aliases)}>
                <Icon type="trash" /> {isConfirming && 'Remove?'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
