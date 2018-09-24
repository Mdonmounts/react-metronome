import React from 'react';
import storiesOf from '@storybook/react';

import Title from '../src';

storiesOf('Title', module)
  .add('with text', () => {
    return <Title text="hello there" />;
  });
