// src/Controls.js
import React from 'react';

const SERVER_URL = 'https://hunt-overlay.onrender.com'; // Replace with your server's URL

const Controls = () => {
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
};

export default Controls;
