import React from 'react';
import { storiesOf } from '@storybook/react';

import MetronomeContainer from '../src/MetronomeContainer/metronome-container';

// storiesOf('Title', module)
//   .add('with text', () => {
//     return <Title text="hello there" />;
//   });

storiesOf('MetronomeContainer', module)
    .add('with no inner', () => {
        return <MetronomeContainer />;
    });
