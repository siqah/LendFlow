import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatNumber, formatUSD } from '../utils/helpers';
import { DEMO_MARKETS, TOKEN_LIST } from '../utils/constants';

export default function Deposit() {
  const { account, contract } = useWeb3();
  const [selectedToken, setSelectedToken] = useState(TOKEN_LIST[0]);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  const selectedMarket = DEMO_MARKETS.find(m => m.token.symbol === selectedToken.symbol) || DEMO_MARKETS[0];

  const estimatedEarnings = amount ? (parseFloat(amount) * selectedMarket.depositAPY / 100).toFixed(4) : '0.00';

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    setTxStatus('pending');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus('success');
      setAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      setTxStatus('error');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setTxStatus(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative pt-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Deposit Assets
        </h2>
        <p className="text-gray-500 text-lg">Supply liquidity to earn interest and protocol rewards</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Deposit Interface */}
        <div className="lg:w-2/3">
          <div className="glass-card p-8">
            {/* Token Selector */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Select Asset</label>
              <div className="grid grid-cols-3 gap-4">
                {TOKEN_LIST.map((token) => {
                  const market = DEMO_MARKETS.find(m => m.token.symbol === token.symbol);
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                        selectedToken.symbol === token.symbol
                          ? 'border-primary-900 bg-primary-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      {selectedToken.symbol === token.symbol && (
                         <div className="absolute top-0 right-0 w-8 h-8 bg-primary-900 rounded-bl-xl flex items-center justify-center">
                           <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border border-white"
                          style={{ backgroundColor: `${token.color}20`, color: token.color }}
                        >
                          {token.icon}
                        </span>
                        <span className="font-bold text-gray-900 text-lg">{token.symbol}</span>
                      </div>
                      <p className="text-sm text-emerald-600 font-semibold mt-1">
                        APY: +{market?.depositAPY.toFixed(2) || '0.00'}%
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Amount</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Balance: 10,000 {selectedToken.symbol}</span>
                  <button
                    onClick={() => setAmount('1000')}
                    className="text-xs text-primary-900 bg-primary-100 px-2 py-1 rounded font-bold hover:bg-primary-200 transition"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-5 py-4 rounded-xl text-gray-900 placeholder-gray-400 text-3xl font-bold outline-none transition-all duration-300 bg-gray-50 border border-gray-200 focus:border-primary-900 focus:ring-4 focus:ring-primary-100 pr-32"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-2xl" style={{ color: selectedToken.color }}>{selectedToken.icon}</span>
                  <span className="font-bold text-gray-900 text-xl">{selectedToken.symbol}</span>
                </div>
              </div>
              <div className="flex justify-between mt-3 px-2">
                <p className="text-sm font-medium text-gray-500">
                  ≈ {formatUSD(parseFloat(amount || 0) * selectedMarket.price)}
                </p>
              </div>
            </div>

            {/* Deposit Button */}
            {txStatus === 'success' ? (
              <div className="w-full py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center shadow-sm">
                <span className="text-emerald-700 font-bold text-lg flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Deposit Successful!
                </span>
              </div>
            ) : txStatus === 'error' ? (
              <div className="w-full py-4 rounded-xl bg-red-50 border border-red-200 text-center shadow-sm">
                <span className="text-red-700 font-bold text-lg flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Transaction Failed
                </span>
              </div>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-md ${
                  (!amount || parseFloat(amount) <= 0) 
                    ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500' 
                    : 'bg-primary-900 hover:bg-primary-800'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Deposit...
                  </span>
                ) : !account ? (
                  'Connect Wallet to Deposit'
                ) : (
                  `Supply ${amount || '0'} ${selectedToken.symbol}`
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-card p-6 border-l-4 border-l-primary-900">
            <h3 className="font-bold text-gray-900 mb-4">Transaction Overview</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Supply APY</span>
                <span className="text-emerald-600 font-bold text-base">+{selectedMarket.depositAPY.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Est. Yearly Earnings</span>
                <span className="text-gray-900 font-bold">
                  {estimatedEarnings} {selectedToken.symbol}
                </span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Collateral Factor</span>
                <span className="text-gray-900 font-bold">
                  {selectedToken.symbol === 'ETH' ? '75%' : '80%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Pool Utilization</span>
                <span className="text-gray-900 font-bold">{selectedMarket.utilizationRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Active Deposits</h3>
            <div className="space-y-3">
              {DEMO_MARKETS.map((market, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white shadow-sm"
                      style={{ color: market.token.color }}
                    >
                      {market.token.icon}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{market.token.symbol}</p>
                      <p className="text-xs text-emerald-600 font-semibold">+{market.depositAPY.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatNumber(Math.random() * 100, 2)}</p>
                    <p className="text-xs text-gray-500">{formatUSD(Math.random() * 20000)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
