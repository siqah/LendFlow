import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LENDFLOW_ABI, PRICE_ORACLE_ABI, ERC20_ABI, CONTRACT_ADDRESSES, TOKENS } from '../utils/constants';

const Web3Context = createContext();

export function useWeb3() { return useContext(Web3Context); }

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  const [tokenContracts, setTokenContracts] = useState({});
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [protocolData, setProtocolData] = useState([]);
  const [userData, setUserData] = useState([]);

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

          let lendFlowContract = null;
          let oracle = null;

          if (CONTRACT_ADDRESSES.LendFlow) {
            lendFlowContract = new ethers.Contract(CONTRACT_ADDRESSES.LendFlow, LENDFLOW_ABI, newSigner);
            setContract(lendFlowContract);
          }
          if (CONTRACT_ADDRESSES.PriceOracle) {
            oracle = new ethers.Contract(CONTRACT_ADDRESSES.PriceOracle, PRICE_ORACLE_ABI, newSigner);
            setOracleContract(oracle);
          }

          // Initialize Mock Tokens
          const tContracts = {};
          for (const key in TOKENS) {
            if (TOKENS[key].address && TOKENS[key].address.startsWith("0x")) {
              tContracts[key] = new ethers.Contract(TOKENS[key].address, ERC20_ABI, newSigner);
            }
          }
          setTokenContracts(tContracts);
        }
      }
    } catch (err) {
      console.error('Web3 init error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!contract || !oracleContract) return;
    try {
      const { ethers } = await import('ethers');
      const pData = [];
      const uData = [];
      
      for (const symbol in TOKENS) {
        const token = TOKENS[symbol];
        if (!token.address || !token.address.startsWith("0x")) continue;
        
        try {
          const market = await contract.getMarketData(token.address);
          const price = await oracleContract.getPrice(token.address);
          
          pData.push({
            token,
            totalDeposits: parseFloat(ethers.formatUnits(market[0], token.decimals)),
            totalBorrows: parseFloat(ethers.formatUnits(market[1], token.decimals)),
            utilizationRate: Number(market[2]) / 100, // Basis points
            depositAPY: Number(market[3]) / 100,
            borrowAPY: Number(market[4]) / 100,
            price: parseFloat(ethers.formatUnits(price, 18)),
            tvl: parseFloat(ethers.formatUnits(market[0], token.decimals)) * parseFloat(ethers.formatUnits(price, 18))
          });
          
          if (account) {
            const userPos = await contract.getUserPosition(account, token.address);
            uData.push({
              token,
              depositedAmount: parseFloat(ethers.formatUnits(userPos[0], token.decimals)),
              borrowedAmount: parseFloat(ethers.formatUnits(userPos[1], token.decimals)),
              accumulatedInterest: parseFloat(ethers.formatUnits(userPos[2], token.decimals)),
              totalCollateral: parseFloat(ethers.formatUnits(userPos[3], 18)),
              healthFactor: Number(userPos[4]) / 1e18
            });
          }
        } catch (e) {
            console.error(`Failed to fetch data for ${symbol}`, e);
        }
      }
      if (pData.length > 0) setProtocolData(pData);
      if (uData.length > 0) setUserData(uData);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  }, [contract, oracleContract, account]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    initWeb3();
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await initWeb3();
        } else {
          setAccount(null); setSigner(null); setContract(null); setOracleContract(null);
        }
      };
      const handleChainChanged = () => window.location.reload();

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
        setError('Please install MetaMask'); 
        alert('Please install the MetaMask browser extension to connect your wallet!');
        return; 
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initWeb3();
    } catch (err) { console.error(err); setError(err.message); }
  };

  const disconnectWallet = () => {
    setAccount(null); setSigner(null); setContract(null); setOracleContract(null); setError(null);
  };

  const mintTestTokens = async () => {
    if (!account) return;
    try {
      const { ethers } = await import('ethers');
      for (const symbol in tokenContracts) {
        if (tokenContracts[symbol]) {
          const tx = await tokenContracts[symbol].mint(account, ethers.parseEther("10000"));
          await tx.wait();
        }
      }
      return true;
    } catch (err) {
      console.error('Minting failed:', err);
      throw err;
    }
  };

  const value = {
    provider, signer, contract, oracleContract, tokenContracts,
    account, chainId, loading, error,
    protocolData, userData, fetchData,
    connectWallet, disconnectWallet, mintTestTokens
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
