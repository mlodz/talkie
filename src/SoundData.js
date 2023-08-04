// return a map of all audio file paths
function importAll(r) {
  console.log('importAll', r);
  let sounds = {};
  r.keys().map((item, index) => { sounds[item.replace('./', '')] = r(item); });
  return sounds;
}
const allSoundPaths = importAll(require.context('./assets/audio', false, /\.(png|jpe?g|m4a)$/));

const DEFAULT_CATEGORY_ALIAS = 'default';
const CATEGORIES = new Map();

CATEGORIES.set(
  'names',
  new Set(['julia', 'stella', 'lea', 'newton', 'mommy', 'daddy', 'minimo', 'busybee', 'mario', 'yoshi', 'blippi'])
);
CATEGORIES.set(
  'adj',
  new Set(['silly', 'hungry', 'adventurous', 'athletic', 'cranky', 'curious', 'delicious', 'happy', 'mean', 'nice', 'poopy', 'sad', 'tasty', 'wonderful', 'yummy'])
);
CATEGORIES.set(
  'colors',
  new Set(['blue', 'green', 'orange', 'pink', 'red', 'yellow'])
);
CATEGORIES.set(
  'verbs',
  new Set(['is', 'are', 'can', 'eat', 'have', 'play', 'take', 'with', 'hide'])
);

const CATEGORY_ORDER = {
  'names': 10,
  'verbs': 20,
  'default' : 25,
  'adj': 30,
  'colors': 40,
}

const sortCategories = function(catAliases) {
  return catAliases.sort((a, b) => {
    return CATEGORY_ORDER[a] < CATEGORY_ORDER[b] ? -1 : 1;
  });
}

CATEGORIES.set(
  DEFAULT_CATEGORY_ALIAS,
  new Set()
);

const categoryDisplay = catAlias => {
  switch(catAlias) {
  case 'default': return 'Other';
  case 'adj': return 'Adjectives';
  default: return catAlias;
  }
}
const wordDisplay = word => {
  switch(word) {
  case 'thankyou': return 'Thank You';
  default: return word;
  }
};

// allSoundPaths, object of
// file name -> web accessible asset path
// ex.
// steve_says_hungry.m4a -> public/assets/12341324.steve_says.m4a

const path = function(voice, word) {
  let key = `${voice}_says_${word}.m4a`;
  return allSoundPaths[key];
}

let words = new Set([]);
let voices = new Set([]);
let ALL_SOUNDS = [];

let pathRegex = /(\w+)_says_(\w+)/;
Object.keys(allSoundPaths).forEach(path => {
  let matches = path.match(pathRegex);
  // ['steve_says_hello', 'steve', 'hello', index: 0, input: 'steve_says_hello.mp3', groups: undefined]
  if (matches) {
    let voice = matches[1];
    let word = matches[2];
    words.add(voice);
    voices.add(word);
    ALL_SOUNDS.push({
      voice: voice,
      name: wordDisplay(word),
      alias: `${voice}-says-${word}`,
      audio: allSoundPaths[path],
      category: wordToCategory(word),
    });
  }
});

console.log({words, voices});
const groupBy = function(items, grouper) {
  let result = new Map();
  items.forEach(item => {
    let key = grouper(item);
    if (!result.has(key)) {
      result.set(key, []);
    }
    result.get(key).push(item);
  });
  return result;
}

let GROUPED_SOUNDS = new Map();
ALL_SOUNDS.forEach(sound => {
  if(!GROUPED_SOUNDS.has(sound.voice)) {
    GROUPED_SOUNDS.set(sound.voice, []);
  }
  GROUPED_SOUNDS.get(sound.voice).push(sound);
});

for (let [voice, sounds] of GROUPED_SOUNDS.entries()) {
  GROUPED_SOUNDS.set(voice, groupBy(sounds, sound => sound.category));
}



/*
const groupByVoice = function(allSounds) {
  return groupBy(allSounds, sound => sound.voice);
}
*/
//let SOUNDS_BY_VOICE = groupByVoice(ALL_SOUNDS);

function wordToCategory(word) {
  for (let [catAlias, wordSet] of CATEGORIES.entries()) {
    if(wordSet.has(word)) {
      return catAlias;
    }
  }
  return DEFAULT_CATEGORY_ALIAS;
}



const getSound = function(alias) {
  return ALL_SOUNDS.find(s => s.alias === alias);
}
const getVoice = function(alias) {
  return VOICES[alias]
}

const getVoiceDisplay = function(voice) {
}

const VOICES = {
  steve: {name: 'Daddy', alias: 'steve'},
  julia: {name: 'Julia', alias: 'julia',},
  stella: {name: 'Stella', alias: 'stella'},
}


const JULIA_SOUNDS = ALL_SOUNDS.filter(s => s.voice === 'julia');
const STEVE_SOUNDS = ALL_SOUNDS.filter(s => s.voice === 'steve');


export {
  ALL_SOUNDS,
  GROUPED_SOUNDS,
  STEVE_SOUNDS,
  JULIA_SOUNDS,
  getSound,
  getVoice,
  categoryDisplay,
  sortCategories,
}
