// src/Overlay.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

// Importing images
import vineMain from './images/vine-main-3d.png';
import skullMain from './images/skull-main.png';
import skullCritical from './images/skull-critical.png';
import skullDead from './images/skull-dead.png';
import leaves from './images/leaves.png';
import vineStage2 from './images/vine-stage-2.png';

const SERVER_URL = 'https://hunt-overlay.onrender.com'; // Replace with your server's URL

const Overlay = () => {
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
};

export default Overlay;
