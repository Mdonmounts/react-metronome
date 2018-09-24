import PropTypes from 'prop-types';
import React from 'react';

const Title = (props) => {
  const { text } = props;

  return (
    <p style={{'color': 'red'}}>{text.toUpperCase()}</p>
  );
};

Title.propTypes = {
  text: PropTypes.string
};

export default Title;
