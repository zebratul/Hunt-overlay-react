import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import tmi from 'tmi.js';
import './App.css';

// Importing images
import vineMain from './images/vine-main-3d.png';
import skullMain from './images/skull-main.png';
import skullCritical from './images/skull-critical.png';
import leaves from './images/leaves.png';
import vineStage2 from './images/vine-stage-2.png';

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
    <div className="overlay-container">
      {/* Background images */}
      <img
        src={vineStage2}
        alt="Vine Stage 2"
        className="background-image vine-stage-2"
        style={{ opacity: healthState !== 'FULL' ? 1 : 0 }}
      />
      <img
        src={leaves}
        alt="Leaves"
        className="background-image leaves"
        style={{ opacity: healthState !== 'FULL' ? 1 : 0 }}
      />
      
      <img src={vineMain} alt="Vine Main" className="background-image vine-main" />

      {/* Skull image */}
      <img
        src={healthState === 'CRITICAL' ? skullCritical : skullMain}
        alt="Skull"
        className="foreground-image skull"
        style={{ opacity: healthState === 'DEAD' ? 0 : 1 }}
      />
    </div>
  );
}

export default App;
