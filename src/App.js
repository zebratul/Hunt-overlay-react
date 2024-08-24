import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import tmi from 'tmi.js';
import './App.css';

// Constants
const SERVER_URL = 'https://hunt-overlay.onrender.com'; // Replace with your server's URL

function App() {
  const [healthState, setHealthState] = useState('FULL');

  useEffect(() => {
    // Connect to the server via Socket.IO
    const socket = io(SERVER_URL);

    // Listen for overlay updates from the server
    socket.on('overlayUpdate', ({ healthState }) => {
      setHealthState(healthState);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Twitch chat integration
    const client = new tmi.Client({
      channels: ['zebratul'], // Replace with your Twitch channel name
    });

    client.connect();

    // Listen for chat messages
    client.on('message', (channel, tags, message, self) => {
      // Example: Respond to a specific command
      if (message.toLowerCase() === '!hp') {
        client.say(channel, `Current health state is: ${healthState}`);
      }
    });

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [healthState]);

  return (
    <div className="overlay">
      <h1>Health State: {healthState}</h1>
    </div>
  );
}

export default App;
