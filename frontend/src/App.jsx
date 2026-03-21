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
  { path: '/deposit', label: 'Deposit', icon: '💎' },
  { path: '/borrow', label: 'Borrow', icon: '💰' },
  { path: '/positions', label: 'Positions', icon: '📋' },
  { path: '/markets', label: 'Markets', icon: '📈' },
];

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'bg-primary-500/15 text-primary-400 shadow-inner'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
      }`}>
      <span className="text-base">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}

function WalletButton() {
  const { account, connectWallet, disconnectWallet, loading } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="w-36 h-10 rounded-xl bg-white/[0.04] animate-pulse"></div>
    );
  }

  if (!account) {
    return (
      <button onClick={connectWallet} className="btn-primary text-sm py-2.5 px-5">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Connect Wallet
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="font-mono text-sm text-white/80">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <svg className={`w-4 h-4 text-white/40 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-50 animate-slide-up">
          <button onClick={() => { navigator.clipboard.writeText(account); setShowMenu(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.04] transition">
            📋 Copy Address
          </button>
          <button onClick={() => { disconnectWallet(); setShowMenu(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/[0.04] transition">
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-surface-900/70 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LF</span>
                </div>
                <span className="text-xl font-bold gradient-text hidden sm:inline">LendFlow</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map(item => (
                  <NavLink key={item.path} to={item.path} label={item.label} icon={item.icon} />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <WalletButton />
                {/* Mobile Menu Toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    }
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 animate-slide-up">
              {NAV_ITEMS.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition">
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/markets" element={<MarketStats />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">LF</span>
                </div>
                <span className="text-sm text-white/30">LendFlow Protocol © 2024</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-white/30 hover:text-white/60 transition">Docs</a>
                <a href="#" className="text-sm text-white/30 hover:text-white/60 transition">GitHub</a>
                <a href="#" className="text-sm text-white/30 hover:text-white/60 transition">Discord</a>
                <a href="#" className="text-sm text-white/30 hover:text-white/60 transition">Twitter</a>
              </div>
            </div>
          </div>
        </footer>
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
