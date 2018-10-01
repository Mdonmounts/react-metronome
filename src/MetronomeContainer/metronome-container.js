import React from 'react';
import PropTypes from 'prop-types';
import metronomeWorker from '../worker/metronome.worker';

import {
    ACTION_START,
    ACTION_STOP,
    ACTION_TICK,
    SCHEDULE_AHEAD_TIME,
    SECONDS_IN_MINUTE,
    NOTE_LENGTH,
    FIRST_BEAT,
    SUB_BEAT,
    SUB_DIVIDE_BEAT
} from '../constants';

class Metronome extends React.Component {
    static propTypes = {
        tempo: PropTypes.number,
        beatsPerMeasure: PropTypes.number,
        subBeats: PropTypes.number,
        render: PropTypes.func
    }

    static defaultProps = {
        tempo: 120,
        beatsPerMeasure: 4,
        subBeats: 4,
        render: () => null
    }

    constructor(props) {
        super(props);

        this.scheduleWorker = new Worker(metronomeWorker);
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.scheduledNotes = [];

        this.state = {
            tempo: this.props.tempo,
            beatNumber: 0,
            beatsPerMeasure: this.props.beatsPerMeasure,
            subBeats: this.props.subBeats
        };

        this.nextNoteTime = this.getNextNoteTime();
    }

    componentDidMount() {
        this.scheduleWorker.onmessage = (event) => {
            if (event.data === ACTION_TICK) {
                this.noteScheduler();
            }
        };
        this.start();
    }

    componentWillUnmount() {
        this.stop();
    }

    start = () => {
        this.setState({
            playing: true,
            beatNumber: 0
        });

        this.scheduleWorker.postMessage({
            action: ACTION_START
        });
        this.nextNoteTime = this.audioContext.currentTime;
    };

    stop = () => {
        this.setState({
            playing: false
        });

        this.scheduleWorker.postMessage({
            action: ACTION_STOP
        });
    };

    togglePlaying = () => {
        this.state.playing ? this.stop() : this.start();
    };

    setTempo = (newTempo) => {
        this.setState({
            tempo: newTempo
        });
    };

    getNextBeatNumber = (beatNumber) => {
        if (beatNumber < (this.state.beatsPerMeasure * this.state.subBeats) - 1) {
            return beatNumber + 1;
        }
        // Wrapped around
        return 0;
    };

    getNextNoteTime = (lastNoteTime, tempo) => {
        // Advance current note and time by a 16th note...
        // Notice this picks up the CURRENT
        // tempo value to calculate beat length.
        const secondsPerBeat = SECONDS_IN_MINUTE / tempo;
        // Add beat length to last beat time
        const nextNoteTime = lastNoteTime + (0.25 * secondsPerBeat);

        // current16thNote++;    // Advance the beat number, wrap to zero
        // if (current16thNote == 16) {
        //     current16thNote = 0;
        // }
        return nextNoteTime;
    };

    scheduleNote = (time, beatNumber) => {
        // push the note on the queue, even if we're not playing.
        const currentNoteType = this.determineNoteType(beatNumber);
        this.scheduledNotes.push(this.createNote(time, currentNoteType));
        this.setState({
            beatNumber: this.getNextBeatNumber(this.state.beatNumber)
        });
    };

    determineNoteType = (beatNumber) => {
        if (beatNumber === 0) {
            return FIRST_BEAT;
        } else if (beatNumber % this.state.subBeats === 0) {
            return SUB_BEAT;
        }
        return SUB_DIVIDE_BEAT;
    };

    noteScheduler = () => {
        // On each worker TICK
        // while there are notes that will need to play before the next interval,
        // schedule them and advance the next note time and current beat.
        while (this.nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
            this.scheduleNote(this.nextNoteTime, this.state.beatNumber);
            this.nextNoteTime = this.getNextNoteTime(this.nextNoteTime, this.state.tempo);
        }
    };

    // Function to create a note that will actually play.
    // Can use oscillator or sound, should not matter to caller
    createNote = (time, beatType) => {
        // create an oscillator
        const osc = this.audioContext.createOscillator();
        osc.connect(this.audioContext.destination);
        switch (beatType) {
        case FIRST_BEAT:
            osc.frequency.value = 880.0;
            break;
        case SUB_BEAT:
            osc.frequency.value = 440.0;
            break;
        default:
            osc.frequency.value = 220.0;
        }

        osc.start(time);
        osc.stop(time + NOTE_LENGTH);
        return { beatType, time, player: osc };
    };

    render() {
        return this.props.render({
            ...this.state,
            setTempo: this.setTempo,
            togglePlaying: this.togglePlaying
        });
    }
}

export default Metronome;
