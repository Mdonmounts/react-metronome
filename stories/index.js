import React from 'react';
import { storiesOf } from '@storybook/react';

import MetronomeContainer from '../src/MetronomeContainer/metronome-container';

storiesOf('MetronomeContainer', module)
    .add('default with no inner', () => {
        return <MetronomeContainer />;
    });
