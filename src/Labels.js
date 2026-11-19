
function LabelFactory (labels, defaultFunction) {
  let get = function(alias) {
    let label = labels[alias];
    return label || defaultFunction(alias);
  }
  return {get};
}

const CategoryLabeler = LabelFactory(
  {
    'default': 'Other',
    'adj': 'Adjectives',
    'little': 'Little words',
  },
  categoryAlias => categoryAlias
);
const WordLabeler = LabelFactory(
  {
    'thankyou': 'Thank You',
    'fourthofjuly': '4th of July',
    'busybee': 'Busy Bee',
    'horseyday': 'Horsey Day',
  },
  word => word.charAt(0).toUpperCase() + word.slice(1)
);

const VoiceLabeler = LabelFactory(
  {
    'steve': 'Daddy',
    'julia': 'Julia',
    'stella': 'Stella',
    'lea': 'Lea',
  },
  voice => voice
);

const VOICE_DISPLAY_ORDER = ['julia', 'stella', 'lea', 'steve'];

function sortVoices(voices) {
  const rankOf = voice => {
    const index = VOICE_DISPLAY_ORDER.indexOf(voice);
    return index === -1 ? VOICE_DISPLAY_ORDER.length : index;
  };
  return [...voices].sort((a, b) => rankOf(a) - rankOf(b));
}


export {
  CategoryLabeler,
  WordLabeler,
  VoiceLabeler,
  sortVoices,
}
