// dependency: Must include the sound.js in index.html

let audioContextIsStale = false;

// Old iPadOS leaves the AudioContext silently dead after the app is backgrounded, and resume()
// doesn't reliably revive it. Building a fresh one inside a real tap is the only recovery that holds.
function replaceAudioContext() {
  const {Sound, WebAudioPlugin} = window.createjs;
  const oldPlugin = Sound.activePlugin;
  audioContextIsStale = false;
  if (!(oldPlugin instanceof WebAudioPlugin)) {
    return;
  }
  oldPlugin.context.close().catch(() => {});
  WebAudioPlugin.context = WebAudioPlugin._createAudioContext();
  WebAudioPlugin._scratchBuffer = WebAudioPlugin.context.createBuffer(1, 1, 22050);
  WebAudioPlugin._unlocked = false;

  const newPlugin = new WebAudioPlugin();
  // Decoded AudioBuffers belong to no context, so the registered sounds carry over without reloading.
  newPlugin._loaders = oldPlugin._loaders;
  newPlugin._audioSources = oldPlugin._audioSources;
  newPlugin._soundInstances = oldPlugin._soundInstances;
  Sound.activePlugin = newPlugin;
  WebAudioPlugin.playEmptySound();
  WebAudioPlugin.context.resume();
}

function installAudioContextRecovery() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      audioContextIsStale = true;
    }
  });
  const replaceIfStale = () => {
    if (audioContextIsStale) {
      replaceAudioContext();
    }
  };
  // Capture phase, so the new context exists before any button's own handler plays a sound.
  ['touchend', 'click'].forEach(type => document.addEventListener(type, replaceIfStale, true));
}

installAudioContextRecovery();

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
    if (audioContextIsStale) {
      replaceAudioContext();
    }
    let promise = new Promise((res, rej) => {
      let instance = window.createjs.Sound.play(name);

      instance.on("complete", () => {
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
