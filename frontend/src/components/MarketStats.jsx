import React from 'react';
import { formatNumber, formatUSD } from '../utils/helpers';
import { DEMO_MARKETS, DEMO_STATS } from '../utils/constants';

export default function MarketStats() {
  return (
    <div className="space-y-8 animate-fade-in pt-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Market Statistics</h2>
          <p className="text-gray-500 text-lg">Detailed analytics across all lending markets</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
          Download Report
        </button>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary-900 border-t-0 border-r-0 border-b-0 shadow-sm bg-white">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Protocol TVL</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{formatUSD(DEMO_STATS.totalValueLocked)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">↑ 12.5%</span>
            <span className="text-xs text-gray-400 font-semibold">this month</span>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-accent-500 border-t-0 border-r-0 border-b-0 shadow-sm bg-white">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Rewards Distributed</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{formatUSD(DEMO_STATS.totalRewardsDistributed)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-md">1.2M LFT</span>
            <span className="text-xs text-gray-400 font-semibold">tokens distributed</span>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500 border-t-0 border-r-0 border-b-0 shadow-sm bg-white">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Protocol Revenue</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{formatUSD(DEMO_STATS.protocolRevenue)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">↑ 8.3%</span>
            <span className="text-xs text-gray-400 font-semibold">From interest spread</span>
          </div>
        </div>
      </div>

      {/* Individual Market Cards */}
      <div className="space-y-6">
        {DEMO_MARKETS.map((market, idx) => (
          <div key={idx} className="glass-card overflow-hidden bg-white shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-200 bg-white"
                  style={{ color: market.token.color }}>
                  {market.token.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{market.token.symbol} Market</h3>
                  <p className="text-sm text-gray-500 font-semibold tracking-wide">{market.token.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Active Status</span>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Deposits</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">{formatNumber(market.totalDeposits)}</p>
                  <p className="text-sm font-semibold text-gray-400 mt-1">{formatUSD(market.tvl)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Borrows</p>
                  <p className="text-2xl font-black text-amber-600 tracking-tight">{formatNumber(market.totalBorrows)}</p>
                  <p className="text-sm font-semibold text-gray-400 mt-1">
                    {formatUSD(market.totalBorrows * market.price)}
                  </p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <p className="text-xs text-emerald-800 uppercase font-bold tracking-wider mb-2">Deposit APY</p>
                  <p className="text-2xl font-black text-emerald-600 tracking-tight">+{market.depositAPY.toFixed(2)}%</p>
                  <p className="text-xs font-bold text-emerald-600/70 mt-1">Variable rate</p>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  <p className="text-xs text-amber-800 uppercase font-bold tracking-wider mb-2">Borrow APY</p>
                  <p className="text-2xl font-black text-amber-600 tracking-tight">{market.borrowAPY.toFixed(2)}%</p>
                  <p className="text-xs font-bold text-amber-600/70 mt-1">Variable rate</p>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pool Utilization Rate</span>
                  <span className="text-sm font-black text-gray-900">{market.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${market.utilizationRate}%`,
                      backgroundColor: market.utilizationRate > 80 ? '#ef4444' : '#187a6d',
                    }}></div>
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-xs font-bold text-gray-400">0%</span>
                  <span className="text-xs font-bold text-gray-400">Optimal: 80%</span>
                  <span className="text-xs font-bold text-gray-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
