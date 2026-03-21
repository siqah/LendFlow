import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LENDFLOW_ABI, PRICE_ORACLE_ABI, CONTRACT_ADDRESSES } from '../utils/constants';

const Web3Context = createContext();

export function useWeb3() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initWeb3 = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const { ethers } = await import('ethers');
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const network = await web3Provider.getNetwork();
        setChainId(Number(network.chainId));

        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          const newSigner = await web3Provider.getSigner();
          setSigner(newSigner);
          setAccount(accounts[0].address);

          const lendFlowContract = new ethers.Contract(
            CONTRACT_ADDRESSES.LendFlow,
            LENDFLOW_ABI,
            newSigner
          );
          setContract(lendFlowContract);

          const oracle = new ethers.Contract(
            CONTRACT_ADDRESSES.PriceOracle,
            PRICE_ORACLE_ABI,
            newSigner
          );
          setOracleContract(oracle);
        }
      }
    } catch (err) {
      console.error('Web3 init error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initWeb3();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await initWeb3();
        } else {
          setAccount(null);
          setSigner(null);
          setContract(null);
          setOracleContract(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [initWeb3]);

  const connectWallet = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError('Please install MetaMask or another Web3 wallet');
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initWeb3();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setOracleContract(null);
    setError(null);
  };

  const value = {
    provider,
    signer,
    contract,
    oracleContract,
    account,
    chainId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}
