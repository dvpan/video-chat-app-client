import React, { useState } from 'react';
import './LoginComponent.css';

const LoginComponent = ({ onLogin, roomId }) => {
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(false);

    // Handle the name change
    const handleChange = (e) => {
        setUsername(e.target.value);
        setUsernameError(false);
    }

    // Handle on login btn click
    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim().length === 0) {
            setUsernameError(true);
        } else {
            onLogin({ username, roomId });
        }
    };

    // Get correct title 
    // If the room number exists, the user will enter it
    // if not, the system will give a random room
    const getTitle = (roomId) => {
        if (roomId) {
            return <h2>You are connecting to the<i>@{roomId}</i></h2>
        } else {
            return <h2>Hi, welcome to the video chat app</h2>
        }
    }

    return (
        <div id='login-container'>
            <div id='login-content'>
                {
                    getTitle(roomId)
                }

                <h3 error={`${usernameError}`}>Enter your name</h3>
                <form
                    onSubmit={handleLogin}
                    autoComplete="off"
                >
                    <label>
                        <input id='login-input'
                            autoFocus type="text"
                            name="username"
                            onChange={handleChange}
                            value={username}
                            error={`${usernameError}`}
                        />
                    </label>
                </form>
            </div>
        </div>
    )
};

export default LoginComponent;