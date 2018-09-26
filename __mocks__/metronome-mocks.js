import '@react-frontend-developer/jsdom-worker';

if (!global.AudioContext) {
    global.AudioContext = class AudioContext {
        constructor() {
            this.currentTime = null;
            this.destination = null;
            this.createOscillator = () => { };
            this.createGain = () => { };
        }
    };
}

module.exports = global;
