
let assetMapper = new AssetMapper();
let ALL_SOUNDS = assetMapper.buildSounds();
updateWithWordData(ALL_SOUNDS); // add display words
updateWithCategoryData(ALL_SOUNDS); // add category stuff

let handler = new AudioHandler(
  new AssetMapper(),
  [
    WordData.addWordDisplay,
    CategoryData.updater
  ]
);


class AudioHandler {
  constructor(assetMapper, updaters) {
    let assetMapper = new AssetMapper();
    let ALL_SOUNDS = assetMapper.buildSounds();
    updaters.forEach(updater => updater(ALL_SOUNDS));
  }
}

class CategoryData {
  constructor() {
  }
}

class WordData {

  static addWordDisplay(soundList) {
    soundList.forEach(sound =>
      sound.wordDisplay = WordData.wordToDisplay(sound.word)
    )
  }

  static wordToDisplay(word) {
    switch(word) {
    case 'thankyou': return 'Thank You';
    default: return word;
    }
  }
};


class AssetMapper {
  constructor() {
    let context = importAll(
      require.context(
        './assets/audio',
        false,
        /\.(png|jpe?g|m4a)$/
      )
    );

    let pathToAsset = {};
    context.keys()
      .map((item, index) => {
        pathToAsset[item.replace('./', '')] = context(item);
      });

    // this is a map, like:
    // julia_says_a.m4a
    //    -> /static/media/julia_says_a.6efe9d2bfced9dfd8c46.m4a
    this.pathToAsset = pathToAsset;
  }

  buildSounds() {
    let ALL_SOUNDS = [];
    let pathRegex = /(\w+)_says_(\w+)/;
    let paths = Object.keys(pathToAsset);
    paths.forEach(path => {
      let {voice, word} = this._parsePath(path);
      if (voice && word) {
        ALL_SOUNDS.push({
          voice: voice,
          name: word,
          //nameDisplay: wordDisplay(word), // TODO
          alias: `${voice}-says-${word}`,
          audio: pathToAsset[path],
          category: word,
          //categoryDisplay: wordToCategory(word), TODO
        });
      }
    });
    return ALL_SOUNDS
  }

  // ['steve_says_hello', 'steve', 'hello', index: 0, input: 'steve_says_hello.mp3', groups: undefined]
  _parsePath(path) {
    let pathRegex = /(\w+)_says_(\w+)/;
    let matches = path.match(pathRegex);
    if (matches) {
      return {voice: matches[1], word: matches[2]};
    } else {
      return {voice: null, word: null};
    }
  }
}

/*

 */
