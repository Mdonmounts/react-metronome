/* eslint-env jest */

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Mocks for Worker and AudioContext
import '../../__mocks__/metronome-mocks';
import Metronome from './metronome-container';
import { ACTION_START, ACTION_STOP } from '../constants';

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
            setTempo: wrapper.instance().setTempo
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

    it('should send ACTION_START command to scheduler', () => {
        const spy = jest.spyOn(instance.scheduleWorker, 'postMessage');
        instance.start();
        expect(spy).toHaveBeenCalledWith({ action: ACTION_START });
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

    it('should set new tempo when child call setTempo callback', () => {
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
