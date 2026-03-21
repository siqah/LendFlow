import React, { useState } from 'react';
import { formatNumber, formatUSD, getHealthColor, getHealthStatus } from '../utils/helpers';
import { DEMO_MARKETS } from '../utils/constants';

const DEMO_POSITIONS = [
  {
    token: DEMO_MARKETS[0].token,
    deposited: 12.5, depositValue: 25000, borrowed: 4200, borrowRate: 7.15,
    depositAPY: 4.82, healthFactor: 2.38, accruedInterest: 0.0156, liquidationPrice: 840,
  },
  {
    token: DEMO_MARKETS[1].token,
    deposited: 45000, depositValue: 45000, borrowed: 28000, borrowRate: 8.92,
    depositAPY: 6.25, healthFactor: 1.36, accruedInterest: 125.4, liquidationPrice: 0.62,
  },
  {
    token: DEMO_MARKETS[2].token,
    deposited: 22000, depositValue: 22000, borrowed: 0, borrowRate: 0,
    depositAPY: 5.18, healthFactor: Infinity, accruedInterest: 87.2, liquidationPrice: null,
  },
];

export default function Positions() {
  const [activeTab, setActiveTab] = useState('all');
  const totalDeposited = DEMO_POSITIONS.reduce((s, p) => s + p.depositValue, 0);
  const totalBorrowed = DEMO_POSITIONS.reduce((s, p) => s + p.borrowed, 0);
  const netWorth = totalDeposited - totalBorrowed;
  const borrowPositions = DEMO_POSITIONS.filter(p => p.healthFactor < Infinity);
  const avgHF = borrowPositions.length > 0
    ? borrowPositions.reduce((s, p) => s + p.healthFactor, 0) / borrowPositions.length : Infinity;

  const filtered = activeTab === 'deposits' ? DEMO_POSITIONS.filter(p => p.deposited > 0)
    : activeTab === 'borrows' ? DEMO_POSITIONS.filter(p => p.borrowed > 0) : DEMO_POSITIONS;

  const TX_HISTORY = [
    { type: 'Deposit', token: 'ETH', amount: '5.0', time: '2 hours ago' },
    { type: 'Borrow', token: 'USDC', amount: '10,000', time: '5 hours ago' },
    { type: 'Deposit', token: 'DAI', amount: '22,000', time: '1 day ago' },
    { type: 'Repay', token: 'USDC', amount: '5,000', time: '2 days ago' },
    { type: 'Withdraw', token: 'ETH', amount: '2.5', time: '3 days ago' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-3"><span className="gradient-text">Your Positions</span></h2>
        <p className="text-white/40 text-lg">Manage your deposits, borrows, and health factors</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Supplied</p>
          <p className="text-2xl font-bold text-white/90">{formatUSD(totalDeposited)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Borrowed</p>
          <p className="text-2xl font-bold text-amber-400">{formatUSD(totalBorrowed)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-white/90">{formatUSD(netWorth)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Avg Health Factor</p>
          <p className="text-2xl font-bold" style={{ color: getHealthColor(avgHF) }}>
            {avgHF > 100 ? '∞' : avgHF.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl w-fit">
        {['all', 'deposits', 'borrows'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-primary-500/20 text-primary-400' : 'text-white/40 hover:text-white/60'}`}>
            {tab === 'all' ? 'All Positions' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((pos, idx) => (
          <div key={idx} className="glass-card-hover p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 lg:w-48">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${pos.token.color}15`, color: pos.token.color }}>
                  {pos.token.icon}
                </div>
                <div>
                  <p className="font-bold text-lg text-white/90">{pos.token.symbol}</p>
                  <p className="text-xs text-white/40">{pos.token.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
                <div>
                  <p className="text-xs text-white/40 mb-1">Deposited</p>
                  <p className="font-semibold text-white/90">{formatNumber(pos.deposited)}</p>
                  <p className="text-xs text-white/30">{formatUSD(pos.depositValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Borrowed</p>
                  <p className="font-semibold text-amber-400">{pos.borrowed > 0 ? formatUSD(pos.borrowed) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Interest Earned</p>
                  <p className="font-semibold text-emerald-400">+{formatNumber(pos.accruedInterest, 4)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Health Factor</p>
                  <p className="font-bold text-lg" style={{ color: getHealthColor(pos.healthFactor) }}>
                    {pos.healthFactor > 100 ? '∞' : pos.healthFactor.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 lg:flex-col lg:w-32">
                <button className="btn-secondary text-sm flex-1 py-2">Withdraw</button>
                {pos.borrowed > 0 && <button className="btn-secondary text-sm flex-1 py-2">Repay</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white/90">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {TX_HISTORY.map((tx, idx) => (
            <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  tx.type === 'Deposit' ? 'bg-emerald-500/15 text-emerald-400' :
                  tx.type === 'Withdraw' ? 'bg-red-500/15 text-red-400' :
                  tx.type === 'Borrow' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                }`}>{tx.type === 'Deposit' ? '↓' : tx.type === 'Withdraw' ? '↑' : tx.type === 'Borrow' ? '←' : '→'}</div>
                <div>
                  <p className="font-medium text-white/90">{tx.type}</p>
                  <p className="text-xs text-white/40">{tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white/90">{tx.amount} {tx.token}</p>
                <p className="text-xs text-emerald-400">Confirmed ✓</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
