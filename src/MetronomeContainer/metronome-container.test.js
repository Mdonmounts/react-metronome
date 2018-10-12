/* eslint-env jest */

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Mocks for Worker and AudioContext
import '../../__mocks__/metronome-mocks';
import Metronome from './metronome-container';
import { ACTION_START, ACTION_STOP, FIRST_BEAT, SUB_BEAT, SUB_DIVIDE_BEAT } from '../constants';

Enzyme.configure({ adapter: new Adapter() });

const mountComponent = props => mount(<Metronome {...props} />);

describe('Metronome render', () => {
    it('should render nothing by default', () => {
        expect(mountComponent({}).html()).toBe(null);
    });

    it('should render provided children via render prop', () => {
        const renderSpy = jest.fn(() => <div />);
        const wrapper = mountComponent({ render: renderSpy });

        expect(renderSpy).toHaveBeenCalled();
        expect(wrapper.find('div').length).toBe(1);
    });

    it('should pass state to rendered children', () => {
        let renderedProps;
        const renderSpy = jest.fn((props) => {
            renderedProps = props;
            return null;
        });

        const wrapper = mountComponent({ render: renderSpy });
        expect(renderedProps).toEqual({
            ...wrapper.state(),
            setTempo: wrapper.instance().setTempo,
            togglePlaying: wrapper.instance().togglePlaying
        });
    });
});

describe('Metronome worker and audio context', () => {
    it('should initialize a Worker on init', () => {
        const wrapper = mountComponent();
        expect(wrapper.instance().scheduleWorker).toBeInstanceOf(Worker);
    });

    it('should initialize an AudioContext on init', () => {
        const wrapper = mountComponent();
        expect(wrapper.instance().audioContext).toBeInstanceOf(AudioContext);
    });
});

describe('Metronome start/stop', () => {
    let wrapper;
    let instance;
    beforeEach(() => {
        wrapper = mountComponent();
        instance = wrapper.instance();
    });

    afterEach(() => {
        wrapper = null;
        instance = null;
    });

    // Start only
    it('should have a start function', () => {
        expect(instance.start).toBeTruthy();
    });

    it('should set state to playing=true', () => {
        instance.start();
        const state = wrapper.state();
        expect(state.playing).toEqual(true);
    });

    it('should set state to current note to 0', () => {
        instance.start();
        const state = wrapper.state();
        expect(state.beatNumber).toEqual(0);
    });

    it('should send ACTION_START command to scheduler', () => {
        const spy = jest.spyOn(instance.scheduleWorker, 'postMessage');
        instance.start();
        expect(spy).toHaveBeenCalledWith({ action: ACTION_START });
    });

    it('should set nextNoteTime to current audio time', () => {
        instance.start();
        // This test works against a mock with a static time only
        expect(instance.nextNoteTime).toEqual(instance.audioContext.currentTime);
    });

    // Stop only
    it('should have a stop function', () => {
        expect(instance.start).toBeTruthy();
    });

    it('should set state to playing=false', () => {
        instance.stop();
        const state = wrapper.state();
        expect(state.playing).toEqual(false);
    });

    it('should send ACTION_START command to scheduler', () => {
        const spy = jest.spyOn(instance.scheduleWorker, 'postMessage');
        instance.stop();
        expect(spy).toHaveBeenCalledWith({ action: ACTION_STOP });
    });

    // Toggle
    it('should have a function togglePlaying', () => {
        expect(instance.togglePlaying).toBeTruthy();
    });

    it('should pass togglePlaying callback to children', () => {
        let renderedProps;
        const renderSpy = jest.fn((props) => {
            renderedProps = props;
            return null;
        });

        const newWrapper = mountComponent({ render: renderSpy });
        expect(renderedProps.togglePlaying).toEqual(newWrapper.instance().togglePlaying);
    });

    it('should set playing to false when currently true', () => {
        instance.start();
        instance.togglePlaying();
        expect(wrapper.state().playing).toEqual(false);
    });

    it('should set playing to true when currently false', () => {
        instance.stop();
        instance.togglePlaying();
        expect(wrapper.state().playing).toEqual(true);
    });

    // Unmount Cleanup
    it('should stop playing when component unmounts', () => {
        const spy = jest.spyOn(instance, 'stop');
        instance.start();
        wrapper.unmount();
        // expect(wrapper.state().playing).toEqual(false);
        expect(spy).toHaveBeenCalled();
    });
});

describe('Metronome tempo', () => {
    it('should have a default tempo state', () => {
        const wrapper = mountComponent();
        expect(wrapper.state().tempo).toEqual(Metronome.defaultProps.tempo);
    });

    it('should set tempo from passed in props', () => {
        const props = { tempo: 150 };
        const wrapper = mountComponent(props);
        expect(wrapper.state().tempo).toEqual(props.tempo);
    });

    it('should provide function setTempo', () => {
        const instance = mountComponent().instance();
        expect(instance.setTempo).toBeTruthy();
    });

    it('should set state.tempo to value passed to setTempo', () => {
        const newTempo = 200;
        const wrapper = mountComponent();
        wrapper.instance().setTempo(newTempo);
        expect(wrapper.state().tempo).toEqual(200);
    });

    it('should pass setTempo callback to children', () => {
        let renderedProps;
        const renderSpy = jest.fn((props) => {
            renderedProps = props;
            return null;
        });

        const wrapper = mountComponent({ render: renderSpy });
        expect(renderedProps.setTempo).toEqual(wrapper.instance().setTempo);
    });

    it('should set new tempo when child calls setTempo callback', () => {
        let renderedProps;
        const newTempo = 200;
        const renderSpy = jest.fn((props) => {
            renderedProps = props;
            return null;
        });

        const wrapper = mountComponent({ render: renderSpy });
        renderedProps.setTempo(newTempo);
        expect(wrapper.state().tempo).toEqual(newTempo);
    });
});

// TODO: Flesh out unit tests as functionality builds
describe('Metronome scheduleNote', () => {
    let wrapper;
    let instance;
    beforeEach(() => {
        wrapper = mountComponent();
        instance = wrapper.instance();
    });

    afterEach(() => {
        wrapper = null;
        instance = null;
    });

    it('should have a scheduleNote function', () => {
        expect(instance.scheduleNote).toBeTruthy();
    });
});

// TODO: Flesh out unit tests as functionality builds
describe('Metronome note scheduler', () => {
    let wrapper;
    let instance;
    beforeEach(() => {
        wrapper = mountComponent();
        instance = wrapper.instance();
    });

    afterEach(() => {
        wrapper = null;
        instance = null;
    });

    it('should have a noteScheduler function', () => {
        expect(instance.noteScheduler).toBeTruthy();
    });
});

describe('Metronome getNextBeatNumber', () => {
    let instance;
    beforeEach(() => {
        instance = mountComponent().instance();
    });

    it('should return +1 when not at then end of the measure', () => {
        const nextBeatNumber = instance.getNextBeatNumber(2);
        expect(nextBeatNumber).toEqual(3);
    });

    it('should return 0 when at then end of the measure', () => {
        const nextBeatNumber = instance.getNextBeatNumber(15);
        expect(nextBeatNumber).toEqual(0);
    });
});

describe('Metrenome determineNoteType', () => {
    it('should return FIRST_BEAT for beat number 0', () => {
        const instance = mountComponent().instance();
        const noteType = instance.determineNoteType(0);
        expect(noteType).toEqual(FIRST_BEAT);
    });

    it('should return SUB_BEAT for beat number divisible by beatsPerMeasure', () => {
        const instance = mountComponent().instance();
        const noteType = instance.determineNoteType(4);
        expect(noteType).toEqual(SUB_BEAT);
    });

    it('should return SUB_DIVIDE_BEAT for beat number divisible by beatsPerMeasure', () => {
        const instance = mountComponent().instance();
        const noteType = instance.determineNoteType(3);
        expect(noteType).toEqual(SUB_DIVIDE_BEAT);
    });
});
