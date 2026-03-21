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
      // Simulate transaction for demo
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
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-3">
          <span className="gradient-text">Deposit Assets</span>
        </h2>
        <p className="text-white/40 text-lg">Supply liquidity to earn interest and protocol rewards</p>
      </div>

      {/* Deposit Card */}
      <div className="glass-card p-8">
        {/* Token Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Select Asset</label>
          <div className="grid grid-cols-3 gap-3">
            {TOKEN_LIST.map((token) => {
              const market = DEMO_MARKETS.find(m => m.token.symbol === token.symbol);
              return (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                    selectedToken.symbol === token.symbol
                      ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: `${token.color}20`, color: token.color }}
                    >
                      {token.icon}
                    </span>
                    <span className="font-semibold text-white/90">{token.symbol}</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">
                    APY: +{market?.depositAPY.toFixed(2) || '0.00'}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/50 uppercase tracking-wider">Amount</label>
            <button
              onClick={() => setAmount('1000')}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition"
            >
              Use Max
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field text-2xl font-semibold pr-24 h-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span style={{ color: selectedToken.color }}>{selectedToken.icon}</span>
              <span className="font-semibold text-white/70">{selectedToken.symbol}</span>
            </div>
          </div>
          {amount && (
            <p className="text-sm text-white/40 mt-2">
              ≈ {formatUSD(parseFloat(amount) * selectedMarket.price)}
            </p>
          )}
        </div>

        {/* Deposit Info */}
        <div className="bg-white/[0.02] rounded-xl p-5 mb-6 space-y-3 border border-white/[0.04]">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Deposit APY</span>
            <span className="text-emerald-400 font-semibold">+{selectedMarket.depositAPY.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Est. Yearly Earnings</span>
            <span className="text-white/90 font-medium">
              {estimatedEarnings} {selectedToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Collateral Factor</span>
            <span className="text-white/90 font-medium">
              {selectedToken.symbol === 'ETH' ? '75%' : '80%'}
            </span>
          </div>
          <div className="glow-line my-2"></div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">LFT Reward Rate</span>
            <span className="text-accent-400 font-semibold">+0.1%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Pool Utilization</span>
            <span className="text-white/90 font-medium">{selectedMarket.utilizationRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Deposit Button */}
        {txStatus === 'success' ? (
          <div className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-emerald-400 font-semibold">✓ Deposit Successful!</span>
          </div>
        ) : txStatus === 'error' ? (
          <div className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-red-400 font-semibold">✗ Transaction Failed</span>
          </div>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            className={`btn-primary w-full py-4 text-lg ${
              (!amount || parseFloat(amount) <= 0) ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : !account ? (
              'Connect Wallet to Deposit'
            ) : (
              `Deposit ${amount || '0'} ${selectedToken.symbol}`
            )}
          </button>
        )}
      </div>

      {/* Your Deposits */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white/90 mb-4">Your Active Deposits</h3>
        <div className="space-y-3">
          {DEMO_MARKETS.map((market, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${market.token.color}15`, color: market.token.color }}
                >
                  {market.token.icon}
                </span>
                <div>
                  <p className="font-semibold text-white/90">{market.token.symbol}</p>
                  <p className="text-xs text-emerald-400">+{market.depositAPY.toFixed(2)}% APY</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white/90">{formatNumber(Math.random() * 100, 4)}</p>
                <p className="text-xs text-white/40">{formatUSD(Math.random() * 200000)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
