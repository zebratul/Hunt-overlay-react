import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overlay from './Overlay';
import Controls from './Controls';
import TwitchChat from './TwitchChat'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Overlay />} />
        <Route path="/controls" element={<Controls />} />
        <Route path="/twitch-chat" element={<TwitchChat />} /> 
      </Routes>
    </Router>
  );
}

export default App;
