import React from 'react';
import { storiesOf } from '@storybook/react';

import MetronomeContainer from '../src/MetronomeContainer/metronome-container';
import MetronomeDemo from '../src/MetronomeView/metronome-view';

storiesOf('MetronomeContainer', module)
    .add('default with no inner', () => {
        return <MetronomeContainer />;
    })
    .add('with very simple demo inner', () => {
        return <MetronomeContainer render={(props) => { return <MetronomeDemo {...props} />; }} />;
    });
