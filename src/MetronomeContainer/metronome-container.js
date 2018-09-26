import React from 'react';
import PropTypes from 'prop-types';
import metronomeWorker from '../worker/metronome.worker';

import {
    ACTION_START,
    ACTION_STOP
} from '../constants';

class Metronome extends React.Component {
    static propTypes = {
        tempo: PropTypes.number,
        render: PropTypes.func
    }

    static defaultProps = {
        tempo: 120,
        render: () => null
    }

    constructor(props) {
        super(props);

        this.scheduleWorker = new Worker(metronomeWorker);
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.state = {
            tempo: this.props.tempo
        };
    }

    componentWillUnmount() {
        this.stop();
    }

    start = () => {
        this.setState({
            playing: true
        });

        this.scheduleWorker.postMessage({
            action: ACTION_START
        });
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
    }

    setTempo = (newTempo) => {
        this.setState({
            tempo: newTempo
        });
    };

    render() {
        return this.props.render({
            ...this.state,
            setTempo: this.setTempo
        });
    }
}

export default Metronome;
