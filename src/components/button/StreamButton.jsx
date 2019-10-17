import React from 'react';
import './StreamButton.css';

const StreamButton = ({ active, onStart, onStop }) => {
    const handleClick = () => {
        if (active) onStop();
        else onStart();
    }

    return (
        <button active={`${active}`} onClick={handleClick}>
            {
                active ? 'STOP STREAM' : 'OPEN WEBCAM'
            }
        </button>
    )
}

export default StreamButton;