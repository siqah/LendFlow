import React from 'react';
import { formatNumber, formatUSD } from '../utils/helpers';
import { DEMO_MARKETS, DEMO_STATS } from '../utils/constants';

export default function MarketStats() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-3">
          <span className="gradient-text">Market Statistics</span>
        </h2>
        <p className="text-white/40 text-lg">Detailed analytics across all lending markets</p>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card p-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Protocol TVL</p>
          <p className="stat-value">{formatUSD(DEMO_STATS.totalValueLocked)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-emerald-400">+12.5% this month</span>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Rewards Distributed</p>
          <p className="stat-value">{formatUSD(DEMO_STATS.totalRewardsDistributed)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
            <span className="text-xs text-accent-400">LFT tokens</span>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Protocol Revenue</p>
          <p className="stat-value">{formatUSD(DEMO_STATS.protocolRevenue)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
            <span className="text-xs text-primary-400">From interest spread</span>
          </div>
        </div>
      </div>

      {/* Individual Market Cards */}
      <div className="space-y-6">
        {DEMO_MARKETS.map((market, idx) => (
          <div key={idx} className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${market.token.color}15`, color: market.token.color }}>
                    {market.token.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white/90">{market.token.symbol} Market</h3>
                    <p className="text-sm text-white/40">{market.token.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-sm text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total Deposits</p>
                  <p className="text-xl font-bold text-white/90">{formatNumber(market.totalDeposits)}</p>
                  <p className="text-xs text-white/30 mt-1">{formatUSD(market.tvl)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total Borrows</p>
                  <p className="text-xl font-bold text-amber-400">{formatNumber(market.totalBorrows)}</p>
                  <p className="text-xs text-white/30 mt-1">
                    {formatUSD(market.totalBorrows * market.price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Deposit APY</p>
                  <p className="text-xl font-bold text-emerald-400">+{market.depositAPY.toFixed(2)}%</p>
                  <p className="text-xs text-white/30 mt-1">Variable rate</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Borrow APY</p>
                  <p className="text-xl font-bold text-amber-400">{market.borrowAPY.toFixed(2)}%</p>
                  <p className="text-xs text-white/30 mt-1">Variable rate</p>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mt-6 pt-6 border-t border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/50">Utilization Rate</span>
                  <span className="text-sm font-bold text-white/90">{market.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${market.utilizationRate}%`,
                      background: market.utilizationRate > 80
                        ? 'linear-gradient(90deg, #6366f1, #ef4444)'
                        : 'linear-gradient(90deg, #6366f1, #a855f7)',
                    }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/30">0%</span>
                  <span className="text-xs text-white/30">Optimal: 80%</span>
                  <span className="text-xs text-white/30">100%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
