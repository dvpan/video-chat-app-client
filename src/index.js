import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import App from './App';
import SocketContext from './socket-context'
import * as serviceWorker from './serviceWorker';

import './index.css';

const socket = io('http://localhost:3000');

ReactDOM.render(
    // Create context to pass socket through intermediate elements
    <SocketContext.Provider value={socket}>
        <App />
    </SocketContext.Provider>,

    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
