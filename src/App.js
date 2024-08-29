import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import tmi from 'tmi.js';
import './App.css';

// Importing images
import vineMain from './images/vine-main-3d.png';
import skullMain from './images/skull-main.png';
import skullCritical from './images/skull-critical.png';
import skullDead from './images/skull-dead.png';
import leaves from './images/leaves.png';
import vineStage2 from './images/vine-stage-2.png';

// Constants
const SERVER_URL = 'https://hunt-overlay.onrender.com'; // Replace with your server's URL

function Overlay() {
  const [healthState, setHealthState] = useState('FULL');
  const [twitchClient, setTwitchClient] = useState(null);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('overlayUpdate', ({ healthState }) => {
      setHealthState(healthState);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    connectToTwitch();
  }, [healthState]);

  const connectToTwitch = async () => {
    try {
      // Fetch the Twitch token from the backend
      const tokenResponse = await fetch(`${SERVER_URL}/twitch-token`);
      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;

      // Create a new Twitch client
      const client = new tmi.Client({
        options: { debug: true },
        identity: {
          username: 'YourTwitchBotUsername', // Replace with your bot's username
          password: `oauth:${token}`, // Use the token received from your backend
        },
        channels: ['zebratul'], // Replace with your Twitch channel name
      });

      // Connect to Twitch chat
      client.connect();

      // Listen for messages
      client.on('message', (channel, tags, message, self) => {
        if (message.toLowerCase() === '!hp') {
          client.say(channel, `Current health state is: ${healthState}`);
        } else if (message.toLowerCase() === '!jump') {
          sendCommand('JUMP');
        } else if (message.toLowerCase() === '!shoot') {
          sendCommand('LMB');
        }
      });

      // Handle 401 Unauthorized errors
      client.on('connected', () => {
        setTwitchClient(client);
      });

      client.on('disconnected', (reason) => {
        console.error('Disconnected from Twitch:', reason);
        if (reason === 'Authentication failed') {
          refreshTwitchToken();
        }
      });

    } catch (error) {
      console.error('Error connecting to Twitch:', error);
    }
  };

  const sendCommand = async (command) => {
    await fetch(`${SERVER_URL}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
  };

  const refreshTwitchToken = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/refresh-token`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log('Twitch token refreshed:', data.access_token);
      if (twitchClient) {
        twitchClient.disconnect();
        connectToTwitch();
      }
    } catch (error) {
      console.error('Error refreshing Twitch token:', error);
    }
  };

  return (
    <div className="overlay-container">
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
      <img
        src={
          healthState === 'DEAD'
            ? skullDead
            : healthState === 'CRITICAL'
            ? skullCritical
            : skullMain
        }
        alt="Skull"
        className="foreground-image skull"
        style={{ opacity: 1, transition: 'opacity 0.5s' }}
      />
    </div>
  );
}

function Controls() {
  const handleButtonClick = (command) => {
    fetch(`${SERVER_URL}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
  };

  return (
    <div>
      <button onClick={() => handleButtonClick('A')}>A</button>
      <button onClick={() => handleButtonClick('W')}>W</button>
      <button onClick={() => handleButtonClick('D')}>D</button>
      <button onClick={() => handleButtonClick('JUMP')}>JUMP</button>
      <button onClick={() => handleButtonClick('LMB')}>LMB</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Overlay />} />
        <Route path="/controls" element={<Controls />} />
      </Routes>
    </Router>
  );
}

export default App;
