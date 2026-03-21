import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatNumber, formatUSD, getHealthColor, getHealthStatus } from '../utils/helpers';
import { DEMO_MARKETS, TOKEN_LIST } from '../utils/constants';

export default function Borrow() {
  const { account } = useWeb3();
  const [selectedToken, setSelectedToken] = useState(TOKEN_LIST[0]);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  const selectedMarket = DEMO_MARKETS.find(m => m.token.symbol === selectedToken.symbol) || DEMO_MARKETS[0];

  // Simulated user data
  const totalCollateral = 150000;
  const currentBorrows = 45000;
  const collateralFactor = selectedToken.symbol === 'ETH' ? 0.75 : 0.80;
  const maxBorrow = totalCollateral * collateralFactor - currentBorrows;
  const borrowAmount = amount ? parseFloat(amount) * selectedMarket.price : 0;
  const newHealthFactor = currentBorrows + borrowAmount > 0
    ? (totalCollateral * 0.85) / (currentBorrows + borrowAmount)
    : Infinity;

  const handleBorrow = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    setTxStatus('pending');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus('success');
      setAmount('');
    } catch (error) {
      console.error('Borrow failed:', error);
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
          <span className="gradient-text">Borrow Assets</span>
        </h2>
        <p className="text-white/40 text-lg">Borrow against your deposited collateral</p>
      </div>

      {/* Collateral Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Collateral</p>
          <p className="text-2xl font-bold text-white/90">{formatUSD(totalCollateral)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Borrows</p>
          <p className="text-2xl font-bold text-amber-400">{formatUSD(currentBorrows)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Available to Borrow</p>
          <p className="text-2xl font-bold text-emerald-400">{formatUSD(maxBorrow)}</p>
        </div>
      </div>

      {/* Borrow Card */}
      <div className="glass-card p-8">
        {/* Token Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Select Asset to Borrow</label>
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
                  <p className="text-xs text-amber-400 font-medium">
                    Rate: {market?.borrowAPY.toFixed(2) || '0.00'}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/50 uppercase tracking-wider">Borrow Amount</label>
            <button
              onClick={() => setAmount((maxBorrow / selectedMarket.price * 0.8).toFixed(4))}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition"
            >
              Safe Max (80%)
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
              ≈ {formatUSD(borrowAmount)}
            </p>
          )}
        </div>

        {/* Health Factor Indicator */}
        <div className="mb-6 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/50">Health Factor</span>
            <span
              className="text-lg font-bold"
              style={{ color: getHealthColor(newHealthFactor) }}
            >
              {newHealthFactor > 100 ? '∞' : newHealthFactor.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, (1 / newHealthFactor) * 100))}%`,
                background: `linear-gradient(90deg, #22c55e, ${getHealthColor(newHealthFactor)})`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/30">Safe</span>
            <span className="text-xs font-medium" style={{ color: getHealthColor(newHealthFactor) }}>
              {getHealthStatus(newHealthFactor)}
            </span>
            <span className="text-xs text-white/30">Risky</span>
          </div>
        </div>

        {/* Borrow Info */}
        <div className="bg-white/[0.02] rounded-xl p-5 mb-6 space-y-3 border border-white/[0.04]">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Borrow APY</span>
            <span className="text-amber-400 font-semibold">{selectedMarket.borrowAPY.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Available Liquidity</span>
            <span className="text-white/90 font-medium">
              {formatNumber(selectedMarket.totalDeposits - selectedMarket.totalBorrows)} {selectedToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Liquidation Threshold</span>
            <span className="text-white/90 font-medium">
              {selectedToken.symbol === 'ETH' ? '80%' : '85%'}
            </span>
          </div>
          <div className="glow-line my-2"></div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Liquidation Penalty</span>
            <span className="text-red-400 font-medium">5%</span>
          </div>
        </div>

        {/* Borrow Button */}
        {txStatus === 'success' ? (
          <div className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-emerald-400 font-semibold">✓ Borrow Successful!</span>
          </div>
        ) : txStatus === 'error' ? (
          <div className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-red-400 font-semibold">✗ Transaction Failed</span>
          </div>
        ) : (
          <button
            onClick={handleBorrow}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing || newHealthFactor < 1.05}
            className={`btn-primary w-full py-4 text-lg ${
              (!amount || parseFloat(amount) <= 0 || newHealthFactor < 1.05) ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : newHealthFactor < 1.05 && amount ? (
              'Health Factor Too Low'
            ) : !account ? (
              'Connect Wallet to Borrow'
            ) : (
              `Borrow ${amount || '0'} ${selectedToken.symbol}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
