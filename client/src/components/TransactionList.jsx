import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, ArrowUpRight, ArrowDownLeft, Filter, Copy, ExternalLink } from 'lucide-react';

const TransactionList = ({ transactions }) => {
  const [filters, setFilters] = useState({
    direction: 'all', // 'in', 'out', 'all'
    dateRange: 'all', // 'today', 'week', 'month', 'all'
    sortBy: 'date', // 'date', 'value'
    sortDir: 'desc' // 'asc', 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-[#161B22] rounded-lg p-6 text-center">
        <p className="text-[#8B949E]">No transactions found.</p>
      </div>
    );
  }

  // Apply filters
  const filteredTransactions = transactions.filter(tx => {
    // Direction filter
    if (filters.direction !== 'all') {
      const isIncoming = tx.to.toLowerCase() === tx.address?.toLowerCase();
      if ((filters.direction === 'in' && !isIncoming) || 
          (filters.direction === 'out' && isIncoming)) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const txDate = new Date(tx.timeStamp * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filters.dateRange === 'today') {
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        if (txDate < today || txDate > todayEnd) return false;
      } else if (filters.dateRange === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        if (txDate < weekStart) return false;
      } else if (filters.dateRange === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (txDate < monthStart) return false;
      }
    }
    
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (filters.sortBy === 'date') {
      return filters.sortDir === 'desc' 
        ? parseInt(b.timeStamp) - parseInt(a.timeStamp)
        : parseInt(a.timeStamp) - parseInt(b.timeStamp);
    } else if (filters.sortBy === 'value') {
      const aValue = parseFloat(a.value) / 10 ** a.tokenDecimal;
      const bValue = parseFloat(b.value) / 10 ** b.tokenDecimal;
      return filters.sortDir === 'desc' ? bValue - aValue : aValue - bValue;
    }
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (sortField) => {
    if (filters.sortBy === sortField) {
      setFilters({
        ...filters,
        sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc'
      });
    } else {
      setFilters({
        ...filters,
        sortBy: sortField,
        sortDir: 'desc'
      });
    }
  };

  return (
    <div className="mt-6 bg-[#161B22] rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl font-bold text-[#C9D1D9] mb-3 md:mb-0">
          Transaction History
          <span className="text-sm font-normal ml-2 text-[#8B949E]">
            (Showing {filteredTransactions.length} of {transactions.length})
          </span>
        </h2>
        
        <button 
          className="flex items-center gap-2 bg-[#0D1117] hover:bg-[#58A6FF] text-[#C9D1D9] py-2 px-4 rounded-lg transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          <span>Filters</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {/* Filter controls */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#0D1117] rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Direction filter */}
          <div>
            <label className="block text-sm font-medium text-[#8B949E] mb-2">Direction</label>
            <select 
              value={filters.direction}
              onChange={(e) => setFilters({...filters, direction: e.target.value})}
              className="w-full bg-[#161B22] text-[#C9D1D9] rounded-md px-3 py-2 border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
            >
              <option value="all">All Transactions</option>
              <option value="in">Incoming</option>
              <option value="out">Outgoing</option>
            </select>
          </div>
          
          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-[#8B949E] mb-2">Time Period</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full bg-[#161B22] text-[#C9D1D9] rounded-md px-3 py-2 border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          {/* Sort by filter */}
          <div>
            <label className="block text-sm font-medium text-[#8B949E] mb-2">Sort By</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full bg-[#161B22] text-[#C9D1D9] rounded-md px-3 py-2 border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
            >
              <option value="date">Date</option>
              <option value="value">Value</option>
            </select>
          </div>
          
          {/* Sort direction */}
          <div>
            <label className="block text-sm font-medium text-[#8B949E] mb-2">Order</label>
            <select 
              value={filters.sortDir}
              onChange={(e) => setFilters({...filters, sortDir: e.target.value})}
              className="w-full bg-[#161B22] text-[#C9D1D9] rounded-md px-3 py-2 border border-[#30363D] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Transaction list */}
      <div className="overflow-hidden rounded-lg shadow">
        <table className="min-w-full divide-y divide-[#30363D]">
          <thead className="bg-[#0D1117]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8B949E] uppercase tracking-wider">
                <button 
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1"
                >
                  <span>Date</span>
                  {filters.sortBy === 'date' && (
                    filters.sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8B949E] uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8B949E] uppercase tracking-wider">
                Token
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8B949E] uppercase tracking-wider">
                <button 
                  onClick={() => toggleSort('value')}
                  className="flex items-center gap-1"
                >
                  <span>Amount</span>
                  {filters.sortBy === 'value' && (
                    filters.sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[#8B949E] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#0D1117] divide-y divide-[#30363D]">
            {sortedTransactions.map((tx, i) => {
              // Handle potential NaN or infinite values
              let amount = 0;
              try {
                amount = parseFloat(tx.value) / 10 ** tx.tokenDecimal;
                if (isNaN(amount) || !isFinite(amount)) amount = 0;
              } catch (error) {
                console.error("Error parsing transaction amount:", error);
              }
              
              const formattedAmount = amount.toLocaleString(undefined, {
                maximumFractionDigits: 6
              });
              
              // Check if this tx is incoming for the current wallet address
              const isIncoming = tx.to.toLowerCase() === tx.address?.toLowerCase();
              
              return (
                <tr key={`${tx.hash}-${i}`} className="hover:bg-[#58A6FF]/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C9D1D9]">
                    {new Date(tx.timeStamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isIncoming ? 'bg-[#0D8A47]/30 text-[#7EE2A8]' : 'bg-[#DA3633]/30 text-[#FF7B72]'
                    }`}>
                      {isIncoming ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {isIncoming ? 'Received' : 'Sent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-[#30363D] rounded-full flex items-center justify-center text-[#C9D1D9] font-bold">
                        {tx.tokenSymbol?.charAt(0) || '?'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#C9D1D9]">{tx.tokenSymbol}</div>
                        <div className="text-xs text-[#8B949E]">{tx.tokenName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#C9D1D9]">{formattedAmount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(tx.hash)}
                        className="text-[#8B949E] hover:text-[#58A6FF] transition-colors"
                        title="Copy transaction hash"
                      >
                        <Copy size={16} />
                      </button>
                      <a 
                        href={`https://etherscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#8B949E] hover:text-[#58A6FF] transition-colors"
                        title="View on Etherscan"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Transaction details expandable view */}
      <div className="mt-4 pt-4 border-t border-[#30363D] text-center">
        <a 
          href="https://etherscan.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-[#58A6FF] hover:text-[#8B5CF6] transition-colors"
        >
          View all transactions on Etherscan
          <ExternalLink size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

export default TransactionList;