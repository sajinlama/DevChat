
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contextApi/Context';
import Page from './components/page';
import Room from './components/room';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/room/:roomId" element={<Room/>} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
