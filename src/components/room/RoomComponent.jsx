
import React, { useState, useEffect } from 'react';
import GroupVideoComponentSocket from '../video/GroupVideoComponent';
import UserComponent from '../user/UserComponent';
import MessageComponent from '../message/MessageComponent';

import './RoomComponent.css';

const RoomComponent = ({ users, messages, userId, roomId, onSendMessage, onExit }) => {
    const [message, setMessage] = useState("");

    // Fire onExit event on the component detach
    useEffect(() => {
        return onExit;
    }, [])

    // Keep the chat view scrolled down
    useEffect(() => {
        const chatHistory = document.getElementById("messages-container");
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, [messages]);

    // Handle the message text change 
    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    // Handle on send message btn click
    const handleSubmit = (event) => {
        event.preventDefault();
        if (message.trim().length !== 0) {
            onSendMessage(message);
            setMessage("");
        }
    }

    // Get user list
    const getUserList = () => {
        return (
            users.map(user =>
                <UserComponent
                    key={user.userId}
                    username={user.username}
                    isItMe={user.userId === userId}
                />
            )
        )
    }

    // Get message list
    const getMessageList = () => {
        return (
            messages.map((message, index) =>
                <MessageComponent
                    key={index}
                    prevUserId={index !== 0 ? messages[index - 1].userId : null}
                    username={message.username}
                    userId={message.userId}
                    text={message.text}
                    date={message.timestamp}
                    isItMe={message.userId === userId}
                />
            )
        )
    }

    // Get message sending form
    const getMessageSendingForm = () => {
        return (
            <form
                onSubmit={handleSubmit}
                autoComplete="off"
            >
                <label>
                    <input
                        id='message-input'
                        autoFocus
                        type="text"
                        placeholder={`Message @${roomId}`}
                        name="message"
                        onChange={handleChange}
                        value={message}
                    />
                </label>
            </form>
        )
    }

    return (
        <div id='room-container'>
            <div id='room-content'>
                <div id='users-container'>
                    <h3>@{roomId}</h3>
                    <div id='users-scroll'>
                        {
                            getUserList()
                        }
                    </div>
                </div>

                <div id='media-container'>
                    <div id='video-container'>
                        <GroupVideoComponentSocket />
                    </div>
                    <div>
                        <div id='messages-container'>
                            {
                                getMessageList()
                            }
                        </div>

                        {
                            getMessageSendingForm()
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomComponent;