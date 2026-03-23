import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatNumber, formatUSD } from '../utils/helpers';
import { DEMO_MARKETS, DEMO_STATS } from '../utils/constants';

function StatCard({ title, value, change, positive, icon, highlight = false }) {
  if (highlight) {
    return (
      <div className="bg-primary-900 rounded-2xl p-6 shadow-md text-white animate-slide-up hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-sm font-medium text-primary-100">{title}</p>
          <span className="text-xl bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">{icon}</span>
        </div>
        <p className="text-3xl font-bold mb-2 relative z-10">{value}</p>
        <div className="flex items-center justify-between text-xs mt-4 relative z-10">
          <span className="text-primary-100 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
            <span>{positive ? '↑' : '↓'}</span>
            <span>{change}</span>
          </span>
          <span className="text-primary-200">vs last month</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <span className="text-xl w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <div className="flex items-center justify-between text-xs mt-4">
        <div className={`flex items-center gap-1 font-semibold px-2 py-1 rounded-md ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <span>{positive ? '↑' : '↓'}</span>
          <span>{change}</span>
        </div>
        <span className="text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white rounded-lg shadow-xl px-4 py-3 border border-gray-700">
        <p className="text-sm text-gray-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
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
        <p className="text-gray-500 text-sm font-medium">Loading protocol data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Title Area */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Financial Insights Dashboard
        </h2>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
             Export Data
           </button>
           <button className="px-4 py-2 bg-primary-900 rounded-xl text-sm font-medium text-white hover:bg-primary-800 transition shadow-sm">
             Generate Report
           </button>
        </div>
      </div>

      {/* Stats Grid matching Bankio: Total Income, Expenses, Available Savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatUSD(stats.totalValueLocked * 0.05)} // Mocking data for visuals
          change="+16.5%"
          positive={true}
          icon="💵"
        />
        <StatCard
          title="Total Expenses"
          value={formatUSD(stats.totalBorrows * 0.02)}
          change="+4.2%"
          positive={false}
          icon="📉"
        />
        <div className="md:col-span-1 xl:col-span-2">
          <StatCard
            title="Net Balance"
            value={formatUSD(stats.totalValueLocked)}
            change="+12.5%"
            positive={true}
            icon="🏦"
            highlight={true}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main large chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Monthly Financial</h3>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {['7D', '30D', '90D'].map((period) => (
                <button
                  key={period}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${period === '30D' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData} barSize={28}>
              <XAxis
                dataKey="date"
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                dx={-10}
              />
              <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
              <Bar dataKey="tvl" name="Total Value" fill="#187a6d" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supporting Chart */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Volume Trend</h3>
            <button className="text-gray-400 hover:text-gray-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
            </button>
          </div>
          
          {/* Quick Stat above chart */}
          <div className="mb-4">
             <p className="text-3xl font-bold text-gray-900">{formatUSD(stats.activeUsers * 1050)}</p>
             <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
               <span>↑</span> 8.4% <span className="text-gray-400">vs last week</span>
             </p>
          </div>

          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#104c44" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#104c44" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#104c44"
                  strokeWidth={3}
                  fill="url(#volGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="glass-card overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Transactions Activity Overview</h3>
            <p className="text-sm text-gray-500 mt-1">Track all your loans and deposits in one place</p>
          </div>
          <div className="flex gap-3">
             <input type="text" placeholder="Find transactions..." className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 w-64" />
             <button className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827]">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-lg">Asset</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Deposit APY</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Borrow APY</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Utilization</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Total Deposits</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider rounded-tr-lg">TVL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {markets.map((market, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100 bg-white"
                        style={{ color: market.token.color }}
                      >
                        {market.token.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-primary-900 transition">{market.token.symbol}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{market.token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">+{market.depositAPY.toFixed(2)}%</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-700">{market.borrowAPY.toFixed(2)}%</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${market.utilizationRate}%`,
                            backgroundColor: '#187a6d',
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{market.utilizationRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium text-gray-600">
                    {formatNumber(market.totalDeposits)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-gray-900">
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
