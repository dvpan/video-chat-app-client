import React from 'react';
import './MessageComponent.css';

const MessageComponent = ({ isItMe, username, date, text, prevUserId, userId }) => {
   
    // Get message header
    const getHeader = () => {
        if (prevUserId === userId) return null;
        return (
            <div className='message-header'>
                <span>
                    {username}
                    {
                        isItMe
                        &&
                        <i> (You)</i>
                    }
                </span>
                <span className='message-date'>
                    {new Date(date).toLocaleDateString()}
                    {
                        ' at '
                    }
                    {new Date(date).toLocaleTimeString()}
                </span>
            </div>
        )
    }

    // Get message body
    const getBody = () => {
        return (
            <div className='message-body'>
                {text}
            </div>
        )
    }

    return (
        <div className='message'>
            {
                getHeader()
            }

            {
                getBody()
            }
        </div>
    )
}

export default MessageComponent;