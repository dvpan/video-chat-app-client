import React, { useState, useEffect } from 'react';
import RoomComponent from './components/room/RoomComponent';
import LoginComponent from './components/login/LoginComponent';
import SocketContext from './socket-context'

import './App.css';

function App({ socket }) {
    const [user, setUser] = useState();
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    // Handle user in and out
    useEffect(() => {
        const handleUserJoined = newUser => {
            setUsers([...users, newUser]);
        };

        const handleUserLeaved = exUser => {
            setUsers(users.filter(user => user.userId !== exUser.userId));
        };

        socket.on('userJoined', handleUserJoined);
        socket.on('userLeaved', handleUserLeaved);

        return () => {
            socket.off('userJoined', handleUserJoined);
            socket.off('userLeaved', handleUserLeaved);
        }
    }, [users]);

    // Handle new message receiving
    useEffect(() => {
        const handleSendMessage = message => {
            setMessages([...messages, message]);
        };
        socket.once('newMessage', handleSendMessage);
    }, [messages]);

    window.onpopstate = event => { setUser(null); };

    // Handle login user
    const handleLogin = (username) => {
        socket.once('loginSuccess', ({ roomId, username, userId, users }) => {
            setUser({ username, userId, roomId });
            setUsers(users);

            window.history.pushState(null, null, roomId);
        });

        socket.emit('login', username);
    }

    // Send new message
    const handleSendMessage = (message) => {
        socket.emit('sendMessage', message);
    }

    // Clean up after detach
    const handleRoomExit = () => {
        setUsers([]);
        setMessages([]);
        socket.emit('forceDisconnect');
    }

    const desiredRoomId = window.location.pathname.slice(1);

    // If we don't have a user, create one 
    // or enter the room
    if (!user) {
        return (
            <LoginComponent onLogin={handleLogin} roomId={desiredRoomId} />
        )
    } else {
        return (
            <RoomComponent
                {...user}
                users={users}
                messages={messages}
                onSendMessage={handleSendMessage}
                onExit={handleRoomExit}
            />
        )
    }
}

// Get socket object from the context
const AppWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <App {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default AppWithSocket;