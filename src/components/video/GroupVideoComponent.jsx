import React, { useState, useEffect } from 'react';
import Peer from 'simple-peer';
import SocketContext from '../../socket-context';
import StreamButton from '../button/StreamButton';

import './GroupVideoComponent.css';

const streamSettings = { audio: true, video: { width: 320, height: 240, frameRate: { max: 10 } } };
let streamObj;
let peers = [];

// Create video view for master stream
function CreateVideo(stream, username) {
    let div = document.createElement('div');
    div.id = stream.userId;
    document.querySelector('#video-content').appendChild(div);

    let video = document.createElement('video');
    video.className = 'video-content__video-item';
    video.srcObject = stream;
    div.appendChild(video);
    video.play();

    let title = document.createElement('div');
    title.className = 'video-content__video-title';
    title.innerText = username;
    div.appendChild(title);
}

// Create video view for own stream
function CreateMirrorVideo(stream) {
    let div = document.createElement('div');
    div.id = 'stream-mirror';
    document.querySelector('#video-content').insertAdjacentElement('afterbegin', div);

    let video = document.createElement('video');
    video.className = 'video-content__video-item_mirror';
    video.srcObject = stream;
    video.volume = 0;
    div.appendChild(video);
    video.play();
}

// Remove video view from the DOM
function RemoveVideo(nodeId) {
    const video = document.getElementById(nodeId);
    if (video) video.remove();
}

const GroupVideoComponent = ({ socket }) => {
    const [streamActive, setStreamActive] = useState(false);

    // Create socket listeners and removing them on detach
    useEffect(() => {
        socket.on('someoneInitPeerStream', initSlavePeer);

        socket.on('slaveWantsStream', (slaveId) => {
            if (streamObj) socket.emit('startStreamTo', slaveId);
        });

        const slaveReadyGetStream = () => {
            socket.emit('slaveReadyGetStream');
        }

        slaveReadyGetStream();

        return () => {
            socket.off('someoneInitPeerStream');
            socket.off('slaveWantsStream');
            socket.off('startStreamAnswer');
            socket.off('masterBackAnswerSlave');
            handleStopStream();
        }
    }, []);

    // Create master stream
    const handleStartStream = () => {
        handleStopStream();

        const initMasterStreamPeer = (clients, stream) => {
            setStreamActive(true);

            // Create a peer for each client
            clients.forEach(clientId => {
                let peer = new Peer({ initiator: true, stream: stream })

                peers.push(peer);

                // Start of the master's "handshake"
                peer.on('signal', (data) => {
                    data.slaveId = clientId;
                    socket.emit('masterOfferSlave', data)
                })

                // Master is ready to respond to a slave's "handshake"
                socket.on('masterBackAnswerSlave', answer => {
                    if (clientId === answer.slaveId) {
                        peer.signal(answer)
                    }
                });
            })
        }

        // Create stream from webcam
        async function createStream() {
            if (!streamObj) {
                streamObj = await navigator.mediaDevices.getUserMedia(streamSettings);
                CreateMirrorVideo(streamObj);

                socket.on('startStreamAnswer', (clients) => {
                    initMasterStreamPeer(clients, streamObj);
                });
            }
        }

        // If everything is okay start stream from webcam
        if (Peer.WEBRTC_SUPPORT) {
            createStream().then(() => socket.emit('startStream'));
        }
    };

    // Handle stop stream
    const handleStopStream = () => {
        // Destroy master peer to destroy slaves
        peers.forEach(peer => peer.destroy());
        peers = [];

        // Remove event listeners
        socket.off('masterBackAnswerSlave');
        socket.off('startStreamAnswer');

        RemoveVideo('stream-mirror');
        setStreamActive(false);

        // Stop MediaStream
        try {
            if (streamObj) {
                streamObj.getTracks().forEach(track => track.stop());
            }
        } catch { }

        streamObj = null;
    }

    // Create slave peer
    const initSlavePeer = ({ socketId, username }) => {
        let peer = new Peer();

        // If master stream closed remove video from the DOM
        peer.on('close', () => {
            RemoveVideo(socketId);
        })

        // If something bad happened remove video from the DOM
        peer.on('error', () => {
            RemoveVideo(socketId);
        })

        // Get stream from master and show it on the DOM 
        peer.once('stream', (stream) => {
            stream.userId = socketId;
            CreateVideo(stream, username);
        })

        // Start of the slave's "handshake"
        peer.on('signal', (data) => {
            data.socketId = socketId;
            socket.emit('slaveAnswerMaster', data)
        })

        // Slave is ready to respond to a master's "handshake"
        socket.once('slaveBackOfferMaster', (offer) => {
            try {
                peer.signal(offer)
            }
            catch (e) { RemoveVideo(socketId); }
        })
    };

    // Render the start stream btn and container for future streams
    return (
        <div id="video-container-control">
            <StreamButton
                active={streamActive}
                onStart={handleStartStream}
                onStop={handleStopStream}
            />
            <div id="video-content" />
        </div>
    )
}

// Get socket object from the context
const GroupVideoComponentSocket = props => (
    <SocketContext.Consumer>
        {socket => <GroupVideoComponent {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default GroupVideoComponentSocket;