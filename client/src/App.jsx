import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Home />} /> {/* For now, all routes point to Home */}
          <Route path="/analytics" element={<Home />} /> {/* For now, all routes point to Home */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;