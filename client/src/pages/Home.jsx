import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionList from '../components/TransactionList';
import TokenChart from '../components/TokenChart';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import { Search, AlertCircle, Loader } from 'lucide-react';
import { ethers } from 'ethers';

const Home = () => {
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterToken, setFilterToken] = useState('');
  const [uniqueTokens, setUniqueTokens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false
  });

  // Handle address input change
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    // Reset pagination when address changes
    setCurrentPage(1);
  };

  // Function to fetch transactions with pagination
  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = `http://localhost:5000/api/transactions/${address}?page=${page}&limit=20`;
      
      if (filterToken) {
        endpoint = `http://localhost:5000/api/transactions/${address}/token/${filterToken}?page=${page}&limit=20`;
      }
      
      const { data } = await axios.get(endpoint);
      
      if (data.status === '1' && data.result?.length > 0) {
        if (page === 1) {
          setTransactions(data.result);
        } else {
          // Append new transactions to existing ones for infinite scroll
          setTransactions(prev => [...prev, ...data.result]);
        }
        
        setPagination(data.pagination);
        
        // Extract unique tokens for filter dropdown (only on first page)
        if (page === 1 && !filterToken) {
          const tokens = {};
          data.result.forEach(tx => {
            if (tx.tokenSymbol && tx.tokenName) {
              tokens[tx.tokenSymbol] = {
                name: tx.tokenName,
                address: tx.contractAddress,
                symbol: tx.tokenSymbol
              };
            }
          });
          setUniqueTokens(Object.values(tokens));
        }
      } else {
        if (page === 1) {
          setTransactions([]);
          setError(data.message || 'No transactions found');
        } else {
          setPagination(prev => ({...prev, hasMore: false}));
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 400) {
          setError('Bad Request: ' + (err.response.data.message || 'Possibly an invalid address'));
        } else if (err.response.status === 429) {
          setError('Rate limit exceeded. Please try again later.');
        } else if (err.response.status === 404) {
          setError('No transactions found for this address');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error: ${err.response.data.message || err.response.statusText}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection or try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset state
    setTransactions([]);
    setFilterToken('');
    setCurrentPage(1);
    setError(null);
    
    // Validate address format before making the API call
    if (!ethers.utils.isAddress(address)) {
      setError('Invalid Ethereum address. Please enter a valid address.');
      return;
    }
    
    fetchTransactions(1);
  };

  // Handle token filter change
  const handleFilterChange = async (tokenAddress) => {
    setFilterToken(tokenAddress);
    setCurrentPage(1);
    
    if (!address) return;
    
    // We reset transactions when changing filter
    setTransactions([]);
    
    // This will fetch with the new filter
    fetchTransactions(1);
  };

  // Load more transactions (next page)
  const loadMoreTransactions = () => {
    if (pagination.hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTransactions(nextPage);
    }
  };
  
  // Example wallet addresses for quick testing
  const exampleAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
    '0xC098B2a3Aa256D2140208C3de6543aAEf5cd3A94', // FTX
    '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a'  // Binance
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9]">
      <Navbar activePage="dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-10">
        {/* Hero Section / Search */}
        <div className="mb-8 bg-[#161B22] rounded-lg shadow-xl p-6 md:p-10">
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#58A6FF] to-[#8B5CF6] bg-clip-text text-transparent">
            BlockTrace – Ethereum Token Tracker
          </h1>
          
          <p className="text-[#8B949E] text-center max-w-2xl mx-auto mb-8">
            Track token transfers for any Ethereum wallet address and visualize transaction history with our powerful analytics tools.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6 max-w-3xl mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-[#8B949E]" />
              </div>
              <input
                type="text"
                placeholder="Enter Ethereum wallet address (0x...)"
                value={address}
                onChange={handleAddressChange}
                className="pl-10 p-3 rounded-lg text-[#C9D1D9] bg-[#0D1117] border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] w-full"
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#58A6FF] hover:bg-[#8B5CF6] px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              disabled={loading && currentPage === 1}
            >
              {loading && currentPage === 1 ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Tracking...
                </>
              ) : 'Track Wallet'}
            </button>
          </form>
          
          {/* Example addresses */}
          <div className="text-center">
            <p className="text-sm text-[#8B949E] mb-2">Try one of these addresses:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleAddresses.map(exAddr => (
                <button
                  key={exAddr}
                  onClick={() => {
                    setAddress(exAddr);
                    setTransactions([]);
                    setFilterToken('');
                    setCurrentPage(1);
                    fetchTransactions(1);
                  }}
                  className="text-xs bg-[#0D1117] hover:bg-[#58A6FF]/30 px-3 py-1 rounded-full text-[#8B949E] hover:text-[#C9D1D9] transition-colors"
                >
                  {exAddr.substring(0, 6)}...{exAddr.substring(exAddr.length - 4)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/60 border border-red-700 rounded-lg p-4 mb-8 flex items-center">
            <AlertCircle size={20} className="text-red-400 mr-2 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}
        
        {/* Dashboard with Gas prices and stats */}
        <Dashboard address={address} />
        
        {/* Main content - chart and transaction list */}
        {transactions.length > 0 && (
          <>
            <div className="mt-8 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
              <h2 className="text-2xl font-bold text-[#C9D1D9]">
                Token Analysis
                <span className="text-sm font-normal ml-2 text-[#8B949E]">
                  (For wallet {address.substring(0, 6)}...{address.substring(address.length - 4)})
                </span>
              </h2>
              <div className="mt-2 md:mt-0">
                <select 
                  value={filterToken} 
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="p-2 rounded-lg bg-[#161B22] text-[#C9D1D9] border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                  disabled={loading}
                >
                  <option value="">All Tokens</option>
                  {uniqueTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Token charts */}
            {transactions.length > 0 && <TokenChart transactions={transactions} />}
            
            {/* Transaction list */}
            <TransactionList transactions={transactions} />
            
            {/* Load more button */}
            {pagination.hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreTransactions}
                  disabled={loading}
                  className="bg-[#161B22] hover:bg-[#58A6FF] px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Loading more...
                    </>
                  ) : 'Load More Transactions'}
                </button>
                <div className="text-sm text-[#8B949E] mt-2">
                  Page {pagination.page} of {pagination.totalPages || '?'}
                </div>
              </div>
            )}
          </>
        )}
        
        {!transactions.length && !loading && !error && (
          <div className="text-center p-10 bg-[#161B22] rounded-lg mt-8">
            <p className="text-[#8B949E]">Enter an Ethereum wallet address to view its token transactions</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#161B22] py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#8B949E] text-sm">
            BlockTrace Token Tracker &copy; {new Date().getFullYear()} | Data provided by Etherscan API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;