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
    { type: 'Deposit', token: 'ETH', amount: '5.0', time: 'Feb 13, 2025, 09:30 AM', status: 'Completed' },
    { type: 'Borrow', token: 'USDC', amount: '10,000', time: 'Feb 12, 2025, 09:30 AM', status: 'Completed' },
    { type: 'Deposit', token: 'DAI', amount: '22,000', time: 'Feb 8, 2025, 09:30 AM', status: 'Failed' },
    { type: 'Repay', token: 'USDC', amount: '5,000', time: 'Feb 4, 2025, 03:45 PM', status: 'Completed' },
    { type: 'Withdraw', token: 'ETH', amount: '2.5', time: 'Feb 3, 2025, 11:10 AM', status: 'Completed' },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative pt-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your Positions</h2>
          <p className="text-gray-500 text-lg">Manage your deposits, borrows, and health factors</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary-900 border-t-0 border-r-0 border-b-0 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Supplied</p>
          <p className="text-2xl font-black text-gray-900">{formatUSD(totalDeposited)}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500 border-t-0 border-r-0 border-b-0 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Borrowed</p>
          <p className="text-2xl font-black text-amber-600">{formatUSD(totalBorrowed)}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500 border-t-0 border-r-0 border-b-0 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Net Worth</p>
          <p className="text-2xl font-black text-gray-900">{formatUSD(netWorth)}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-primary-300 border-t-0 border-r-0 border-b-0 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Avg Health Factor</p>
          <p className="text-2xl font-black" style={{ color: getHealthColor(avgHF) }}>
            {avgHF > 100 ? '∞' : avgHF.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit border border-gray-200">
        {['all', 'deposits', 'borrows'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'all' ? 'All Positions' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((pos, idx) => (
          <div key={idx} className="glass-card-hover p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 lg:w-48">
                <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-xl bg-white"
                  style={{ color: pos.token.color }}>
                  {pos.token.icon}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{pos.token.symbol}</p>
                  <p className="text-xs text-gray-500 font-medium tracking-wide">{pos.token.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Deposited</p>
                  <p className="font-black text-gray-900">{formatNumber(pos.deposited)}</p>
                  <p className="text-xs text-gray-500 font-medium">{formatUSD(pos.depositValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Borrowed</p>
                  <p className="font-black text-amber-600">{pos.borrowed > 0 ? formatUSD(pos.borrowed) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Interest Earned</p>
                  <p className="font-black text-emerald-600">+{formatNumber(pos.accruedInterest, 4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Health Factor</p>
                  <p className="font-black text-lg" style={{ color: pos.healthFactor > 100 ? '#10b981' : getHealthColor(pos.healthFactor) }}>
                    {pos.healthFactor > 100 ? 'Safe' : pos.healthFactor.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 lg:flex-col lg:w-32">
                <button className="btn-secondary py-2 text-sm w-full font-bold">Withdraw</button>
                {pos.borrowed > 0 && <button className="btn-primary py-2 text-sm w-full font-bold shadow-none hover:shadow-sm">Repay</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card mt-8 overflow-hidden shadow-sm border-gray-200">
        <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Transfer Activity</h3>
          <div className="flex gap-2">
            <button className="text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50">February ▾</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827]">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-lg">Date & Time</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Token</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                <th className="px-8 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider rounded-tr-lg">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {TX_HISTORY.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900">{tx.time.split(',')[0]}, {tx.time.split(',')[1].split(' ')[1]}</p>
                    <p className="text-xs text-gray-500 font-medium">{tx.time.split(',')[1].trim()}</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                        tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        tx.type === 'Withdraw' ? 'bg-red-50 text-red-600 border border-red-100' :
                        tx.type === 'Borrow' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {tx.type === 'Deposit' ? '↓' : tx.type === 'Withdraw' ? '↑' : tx.type === 'Borrow' ? '←' : '→'}
                      </div>
                      <p className="font-bold text-gray-900">{tx.type}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-600">
                    {tx.token}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {tx.amount}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tx.status === 'Completed' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button className="text-gray-400 hover:text-gray-700 mx-1">↓ PDF</button>
                    <button className="text-gray-400 hover:text-gray-700 mx-1">↓ CSV</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
