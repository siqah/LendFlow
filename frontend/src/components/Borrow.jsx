import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { formatNumber, formatUSD, getHealthColor, getHealthStatus } from '../utils/helpers';
import { DEMO_MARKETS, TOKEN_LIST } from '../utils/constants';

export default function Borrow() {
  const { account, contract } = useWeb3();
  const [selectedToken, setSelectedToken] = useState(TOKEN_LIST[0]);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  const selectedMarket = DEMO_MARKETS.find(m => m.token.symbol === selectedToken.symbol) || DEMO_MARKETS[0];

  // Simulated user data until full integration
  const totalCollateral = 150000;
  const currentBorrows = 45000;
  const collateralFactor = selectedToken.symbol === 'ETH' || selectedToken.symbol === 'WETH' ? 0.75 : 0.80;
  const maxBorrow = totalCollateral * collateralFactor - currentBorrows;
  const borrowAmount = amount ? parseFloat(amount) * selectedMarket.price : 0;
  const newHealthFactor = currentBorrows + borrowAmount > 0
    ? (totalCollateral * 0.85) / (currentBorrows + borrowAmount)
    : Infinity;

  const handleBorrow = async () => {
    if (!amount || parseFloat(amount) <= 0 || !contract) return;
    setIsProcessing(true);
    setTxStatus('pending');

    try {
      const { ethers } = await import('ethers');
      const borrowAmountWei = ethers.parseUnits(amount, selectedToken.decimals);
      
      const tx = await contract.borrow(selectedToken.address, borrowAmountWei);
      await tx.wait();

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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative pt-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Borrow Assets
        </h2>
        <p className="text-gray-500 text-lg">Borrow against your deposited collateral</p>
      </div>

      {/* Collateral Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Collateral</p>
          <p className="text-2xl font-black text-gray-900">{formatUSD(totalCollateral)}</p>
        </div>
        <div className="glass-card p-6 border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">Current Borrows</p>
          <p className="text-2xl font-black text-amber-700">{formatUSD(currentBorrows)}</p>
        </div>
        <div className="glass-card p-6 border-primary-200 bg-primary-50">
          <p className="text-xs text-primary-700 font-bold uppercase tracking-wider mb-2">Available to Borrow</p>
          <p className="text-2xl font-black text-primary-900">{formatUSD(maxBorrow)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Borrow Card */}
        <div className="lg:w-2/3">
          <div className="glass-card p-8">
            {/* Token Selector */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Select Asset to Borrow</label>
              <div className="grid grid-cols-3 gap-4">
                {TOKEN_LIST.map((token) => {
                  const market = DEMO_MARKETS.find(m => m.token.symbol === token.symbol);
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative ${
                        selectedToken.symbol === token.symbol
                          ? 'border-primary-900 bg-primary-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {selectedToken.symbol === token.symbol && (
                         <div className="absolute top-0 right-0 w-8 h-8 bg-primary-900 rounded-bl-xl flex items-center justify-center">
                           <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white shadow-sm border border-gray-50"
                          style={{ color: token.color }}
                        >
                          {token.icon}
                        </span>
                        <span className="font-bold text-gray-900 text-lg">{token.symbol}</span>
                      </div>
                      <p className="text-sm text-amber-600 font-bold mt-1">
                        Rate: {market?.borrowAPY.toFixed(2) || '0.00'}%
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Borrow Amount</label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-gray-500">Max: {((maxBorrow / selectedMarket.price) * 0.99).toFixed(4)} {selectedToken.symbol}</span>
                  <button
                    onClick={() => setAmount((maxBorrow / selectedMarket.price * 0.8).toFixed(4))}
                    className="text-xs text-primary-900 bg-primary-100 px-3 py-1.5 rounded-md font-bold hover:bg-primary-200 transition"
                  >
                    Safe Max (80%)
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
                  ≈ {formatUSD(borrowAmount)}
                </p>
              </div>
            </div>

            {/* Grow indicator for button */}
            {txStatus === 'success' ? (
              <div className="w-full py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center shadow-sm">
                <span className="text-emerald-700 font-bold text-lg flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Borrow Successful!
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
                onClick={handleBorrow}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing || newHealthFactor < 1.05}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-md ${
                  (!amount || parseFloat(amount) <= 0 || newHealthFactor < 1.05) 
                    ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500' 
                    : 'bg-primary-900 hover:bg-primary-800'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Borrow...
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

        {/* Info Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-primary-900">
            <h3 className="font-bold text-gray-900 mb-4">Position Health</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-500">Health Factor</span>
                <span
                  className="text-xl font-black"
                  style={{ color: getHealthColor(newHealthFactor) }}
                >
                  {newHealthFactor > 100 ? '∞' : newHealthFactor.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, (1 / newHealthFactor) * 100))}%`,
                    backgroundColor: getHealthColor(newHealthFactor),
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs font-bold text-gray-400">Safe</span>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: getHealthColor(newHealthFactor) }}>
                  {getHealthStatus(newHealthFactor)}
                </span>
                <span className="text-xs font-bold text-gray-400">Risky</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Borrow APY</span>
                <span className="text-amber-600 font-bold text-base">{selectedMarket.borrowAPY.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Available Liquidity</span>
                <span className="text-gray-900 font-bold">
                  {formatNumber(selectedMarket.totalDeposits - selectedMarket.totalBorrows)} {selectedToken.symbol}
                </span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Liquidation Threshold</span>
                <span className="text-gray-900 font-bold">
                  {selectedToken.symbol === 'ETH' ? '80%' : '85%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Liquidation Penalty</span>
                <span className="text-red-500 font-bold">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
