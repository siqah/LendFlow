import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatNumber, formatUSD } from '../utils/helpers';
import { DEMO_MARKETS, DEMO_STATS } from '../utils/constants';

function StatCard({ title, value, change, positive, icon }) {
  return (
    <div className="glass-card-hover p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-white/50 font-medium uppercase tracking-wider">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="stat-value mb-2">{value}</p>
      <div className={`flex items-center gap-1 text-sm font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        <span>{positive ? '↑' : '↓'}</span>
        <span>{change}</span>
        <span className="text-white/30 ml-1">vs last month</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3">
        <p className="text-sm text-white/60 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {formatUSD(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { account } = useWeb3();
  const [stats] = useState(DEMO_STATS);
  const [markets] = useState(DEMO_MARKETS);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tvl: 50000000 + Math.sin(i * 0.3) * 10000000 + Math.random() * 5000000,
        volume: 2000000 + Math.cos(i * 0.2) * 800000 + Math.random() * 400000,
        borrows: 20000000 + Math.sin(i * 0.25) * 5000000 + Math.random() * 2000000,
      });
    }
    setHistoricalData(data);
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
        </div>
        <p className="text-white/40 text-sm">Loading protocol data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="gradient-text">Protocol Overview</span>
        </h2>
        <p className="text-white/40 text-lg max-w-2xl mx-auto">
          Real-time analytics and market data for the LendFlow lending protocol
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Value Locked"
          value={formatUSD(stats.totalValueLocked)}
          change="+12.5%"
          positive={true}
          icon="🔒"
        />
        <StatCard
          title="Total Borrowed"
          value={formatUSD(stats.totalBorrows)}
          change="+8.3%"
          positive={true}
          icon="💰"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats.activeUsers, 0)}
          change="+15.2%"
          positive={true}
          icon="👥"
        />
        <StatCard
          title="Average APY"
          value={`${stats.avgAPY}%`}
          change="+2.1%"
          positive={true}
          icon="📈"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/90">TVL History</h3>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="tvl"
                name="TVL"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#tvlGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/90">Daily Volume</h3>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={historicalData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" name="Volume" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Markets Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white/90">Available Markets</h3>
          <p className="text-sm text-white/40 mt-1">Deposit or borrow from active lending pools</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Deposit APY</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Borrow APY</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Total Deposits</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">TVL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {markets.map((market, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ background: `${market.token.color}20`, color: market.token.color }}
                      >
                        {market.token.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white/90 group-hover:text-white transition">{market.token.symbol}</p>
                        <p className="text-xs text-white/40">{market.token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-emerald-400 font-semibold">+{market.depositAPY.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-amber-400 font-semibold">{market.borrowAPY.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${market.utilizationRate}%`,
                            background: `linear-gradient(90deg, #6366f1, #a855f7)`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/60">{market.utilizationRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-white/70">
                    {formatNumber(market.totalDeposits)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right font-semibold text-white/90">
                    {formatUSD(market.tvl)}
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
