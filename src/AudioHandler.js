import { CategoryLabeler, WordLabeler } from './Labels';
import AssetMapper from './AssetMapper';
import CategoryData from './CategoryData';

class AudioHandler {

  constructor(assetMapper, updaters) {
    this.ALL_SOUNDS = assetMapper.buildSounds();
    updaters.forEach(updater =>
      this.ALL_SOUNDS = this.ALL_SOUNDS.map(updater)
    );
  }

  getAllSounds() {
    return this.ALL_SOUNDS
  }

  getSound(alias) {
    return this.ALL_SOUNDS.find(s => s.alias === alias);
  }

  getSoundsByVoiceByCategory() {
    // TODO: move this out
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

    // TODO: use grouopBy here
    let GROUPED_SOUNDS = new Map();
    // add all voices, map voice -> [sound]
    this.ALL_SOUNDS.forEach(sound => {
      if(!GROUPED_SOUNDS.has(sound.voice)) {
        GROUPED_SOUNDS.set(sound.voice, []);
      }
      GROUPED_SOUNDS.get(sound.voice).push(sound);
    });

    // {voice -> [sound]}
    // to
    // {voice -> {category -> [sound]}}
    for (let [voice, sounds] of GROUPED_SOUNDS.entries()) {
      GROUPED_SOUNDS.set(voice, groupBy(sounds, sound => sound.category));
    }
    return GROUPED_SOUNDS;
  }
}

export default AudioHandler;
