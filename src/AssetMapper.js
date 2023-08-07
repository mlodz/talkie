
class AssetMapper {
  constructor() {
    this._importFiles();
  }

  _importFiles() {
    let context = require.context(
      './assets/audio',
      false,
      /\.(png|jpe?g|m4a)$/
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
    let paths = Object.keys(this.pathToAsset);
    paths.forEach(path => {
      let {voice, word} = this._parsePath(path);
      if (voice && word) {
        ALL_SOUNDS.push({
          voice: voice,
          name: word,
          //nameDisplay: wordDisplay(word), // TODO
          alias: `${voice}-says-${word}`,
          audio: this.pathToAsset[path],
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

export default AssetMapper;
