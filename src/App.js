import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
    const client = new tmi.Client({
      channels: ['zebratul'], // Replace with your Twitch channel name
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
      if (message.toLowerCase() === '!hp') {
        client.say(channel, `Current health state is: ${healthState}`);
      }
    });

    return () => {
      client.disconnect();
    };
  }, [healthState]);

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
    console.log('fetching command:', command);
    
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
      <nav>
        <Link to="/">Overlay</Link>
        <Link to="/controls">Controls</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Overlay />} />
        <Route path="/controls" element={<Controls />} />
      </Routes>
    </Router>
  );
}

export default App;
