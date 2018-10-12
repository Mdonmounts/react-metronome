/* eslint-env jest */

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Mocks for Worker and AudioContext
import '../../__mocks__/metronome-mocks';
import MetronomeView from './metronome-view';
// import { ACTION_START, ACTION_STOP, FIRST_BEAT, SUB_BEAT, SUB_DIVIDE_BEAT } from '../constants';

Enzyme.configure({ adapter: new Adapter() });

const mountComponent = props => mount(<MetronomeView {...props} />);

describe('MetronomeView render', () => {
    it('should render', () => {
        expect(mountComponent({}).html()).toBeTruthy();
    });
});
