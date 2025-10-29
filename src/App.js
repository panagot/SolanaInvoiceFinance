import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MintInvoice from './pages/MintInvoice';
import Marketplace from './pages/Marketplace';
import BusinessDashboard from './pages/BusinessDashboard';
import Profile from './pages/Profile';
import InvestorDashboard from './pages/InvestorDashboard';
import InvestorYield from './pages/InvestorYield';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<MintInvoice />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/dashboard" element={<BusinessDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/investor" element={<InvestorDashboard />} />
        <Route path="/investor/yield" element={<InvestorYield />} />
      </Routes>
    </Router>
  );
}

export default App;
