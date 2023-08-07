import AudioHandler from './AudioHandler';
import AssetMapper from './AssetMapper';
import { CategoryLabeler, WordLabeler } from './Labels';
import CategoryData from './CategoryData';

let audioHandler = new AudioHandler(
  new AssetMapper(),
  [
    function(sound) {
      return {
        ...sound,
        wordDisplay: WordLabeler.get(sound.name),
      }
    },
    function(sound) {
      let category = CategoryData.wordToCategory(sound.name);
      return {
        ...sound,
        category: category,
        categoryDisplay: CategoryLabeler.get(category),
      }
    },
  ]
);


export {
  audioHandler,
}
