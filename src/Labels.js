
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
  },
  categoryAlias => categoryAlias
);
const WordLabeler = LabelFactory(
  {
    'thankyou': 'Thank You',
  },
  word => word
);

const VoiceLabeler = LabelFactory(
  {
    'steve': 'Daddy',
    'julia': 'Julia',
    'stella': 'Stella',
  },
  voice => voice
);


export {
  CategoryLabeler,
  WordLabeler,
  VoiceLabeler,
}
