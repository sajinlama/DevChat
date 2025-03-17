import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page from './components/Page';
import Room from './components/Room';
import { SocketProvider } from './contextApi/Context';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
