// dependency: Must include the sound.js in index.html

class SoundJsWrapper {
  constructor() {
    this.SoundJs = window.createjs.SoundJs;

	  //createjs.Sound.on("fileload", this.loadHandler, this);

    /*
    this.registerSound(meow, 'my-meow', meow);
    this.registerSound(pig, 'my-pig', pig);
    this.registerSound(monkeyLaugh, 'my-monkey');
    */
  }


  registerSoundList(sounds) {
    sounds.forEach(({audio, alias}) => {
      this.registerSound(audio, alias);
    });
  }

  registerSound(path, name) {
    window.createjs.Sound.registerSound(path, name);
  }

  play(name) {
    let promise = new Promise((res, rej) => {
      let instance = window.createjs.Sound.play(name);
      console.log('playState', instance.playState);

      instance.on("complete", () => {
        console.log('instance complete', name);
        res();
      }, true);
      if (instance.playState === '') {
        rej(`Failed to play sound "${name}", playState="${instance.playState}"`);
      }
    });
    return promise;

  }
}
export default SoundJsWrapper;
