import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ address }) => {
  const [gasPrice, setGasPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTx: 0,
    uniqueTokens: 0,
    lastActive: null
  });

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=' + process.env.REACT_APP_ETHERSCAN_API_KEY);
        if (response.data.status === '1') {
          setGasPrice(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching gas price:', error);
      }
    };
    
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/transactions/${address}?page=1&limit=1`)
        .then(response => {
          if (response.data.status === '1') {
            setStats({
              totalTx: response.data.pagination.total,
              uniqueTokens: [...new Set(response.data.result.map(tx => tx.tokenSymbol))].length,
              lastActive: response.data.result[0]?.timeStamp ? new Date(response.data.result[0].timeStamp * 1000) : null
            });
          }
        })
        .catch(error => console.error('Error fetching stats:', error))
        .finally(() => setLoading(false));
    }
  }, [address]);

  return (
    <div className="mt-20 bg-[#0D1117] rounded-lg shadow-lg p-6 border border-[#30363D]">
      <h2 className="text-2xl font-bold mb-6 text-[#C9D1D9]">Ethereum Network Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gas Price Card */}
        <div className="bg-[#161B22] p-4 rounded-lg shadow border border-[#30363D]">
          <h3 className="text-sm font-medium text-[#8B949E]">Current Gas Price</h3>
          {gasPrice ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#C9D1D9]">{gasPrice.SafeGasPrice} Gwei</p>
              <div className="flex text-sm mt-1">
                <div className="mr-4">
                  <span className="text-[#8B949E]">Low:</span>
                  <span className="ml-1 text-[#C9D1D9]">{gasPrice.SafeGasPrice} Gwei</span>
                </div>
                <div className="mr-4">
                  <span className="text-[#8B949E]">Avg:</span>
                  <span className="ml-1 text-[#C9D1D9]">{gasPrice.ProposeGasPrice} Gwei</span>
                </div>
                <div>
                  <span className="text-[#8B949E]">High:</span>
                  <span className="ml-1 text-[#C9D1D9]">{gasPrice.FastGasPrice} Gwei</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[#C9D1D9] mt-2">Loading...</p>
          )}
        </div>
        
        {/* Wallet Stats */}
        {address && (
          <>
            <div className="bg-[#161B22] p-4 rounded-lg shadow border border-[#30363D]">
              <h3 className="text-sm font-medium text-[#8B949E]">Total Transactions</h3>
              <p className="text-2xl font-bold text-[#C9D1D9]">{loading ? '...' : stats.totalTx}</p>
            </div>
            
            <div className="bg-[#161B22] p-4 rounded-lg shadow border border-[#30363D]">
              <h3 className="text-sm font-medium text-[#8B949E]">Unique Tokens</h3>
              <p className="text-2xl font-bold text-[#C9D1D9]">{loading ? '...' : stats.uniqueTokens}</p>
            </div>
            
            <div className="bg-[#161B22] p-4 rounded-lg shadow border border-[#30363D]">
              <h3 className="text-sm font-medium text-[#8B949E]">Last Activity</h3>
              <p className="text-lg font-bold text-[#C9D1D9]">
                {loading ? '...' : stats.lastActive ? stats.lastActive.toLocaleString() : 'No activity'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;