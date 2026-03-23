import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Borrow from './components/Borrow';
import Positions from './components/Positions';
import MarketStats from './components/MarketStats';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/markets', label: 'Analytics', icon: '📈' },
  { path: '/deposit', label: 'Investments', icon: '🏦' },
  { path: '/borrow', label: 'Borrowings', icon: '💰' },
  { path: '/positions', label: 'Transactions', icon: '📋' },
];

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-primary-900 text-white shadow-md'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}>
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function WalletButton() {
  const { account, connectWallet, disconnectWallet, loading } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="w-32 h-10 rounded-full bg-gray-100 animate-pulse"></div>
    );
  }

  if (!account) {
    return (
      <button onClick={connectWallet} className="bg-primary-900 hover:bg-primary-800 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors flex items-center gap-2 shadow-sm">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold text-xs uppercase">
          {account.slice(2, 4)}
        </div>
        <span className="font-mono text-sm font-semibold text-gray-700">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-slide-up">
          <button onClick={() => { navigator.clipboard.writeText(account); setShowMenu(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 font-medium hover:bg-gray-50 transition">
            📋 Copy Address
          </button>
          <button onClick={() => { disconnectWallet(); setShowMenu(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 font-medium hover:bg-red-50 transition">
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const { account } = useWeb3();

  return (
    <Router>
      <div className="min-h-screen bg-surface-50 flex">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="h-20 flex items-center px-8 border-b border-white"> {/* Optional border-b if separated */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LF</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LendFlow</span>
            </Link>
          </div>
          
          <div className="px-5 py-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</h3>
            <div className="space-y-1">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.path} to={item.path} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Top Header */}
          <header className="h-24 bg-surface-50 flex flex-col sm:flex-row sm:items-center justify-between px-8 py-4 sm:py-0 shrink-0 z-10 sticky top-0">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {account ? `User ${account.slice(2, 6)}` : 'Guest'}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">Effortlessly manage your finances with real-time insights</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar matching image */}
              <div className="hidden md:flex relative items-center">
                <input 
                  type="text" 
                  placeholder="Search for a specific transaction..." 
                  className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary-900/10 focus:border-primary-900" 
                />
                <span className="absolute right-3 text-gray-400">🔍</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm">
                  🔔
                </button>
              </div>
              
              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
              <WalletButton />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-6xl mx-auto pb-12">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/markets" element={<MarketStats />} />
              </Routes>
            </div>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
