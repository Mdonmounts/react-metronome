import React from 'react';
import PropTypes from 'prop-types';

class MetronomeView extends React.Component {
    static propTypes = {
        setTempo: PropTypes.func.isRequired,
        togglePlaying: PropTypes.func.isRequired
    }

    tempoChange = (event) => {
        this.props.setTempo(event.target.value);
    }

    render() {
        return (
            <div>
                <button onClick={this.props.togglePlaying}>Toggle Playing</button>
                <input type="number" step="1" onChange={this.tempoChange} />
            </div>
        );
    }
}

export default MetronomeView;
