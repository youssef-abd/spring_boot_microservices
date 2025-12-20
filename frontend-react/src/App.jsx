import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import CommandesV1 from './pages/CommandesV1';
import CommandesV2 from './pages/CommandesV2';

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/produits" element={<Produits />} />
                        <Route path="/commandes-v1" element={<CommandesV1 />} />
                        <Route path="/commandes-v2" element={<CommandesV2 />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
