import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement,
  Title,
  Tooltip, 
  Legend,
  Filler
);

const TokenChart = ({ transactions }) => {
  const [chartType, setChartType] = useState('bar');
  const [chartView, setChartView] = useState('volume'); // 'volume' or 'activity'
  
  if (!transactions || transactions.length === 0) {
    return null;
  }

  // Process data for token volume
  const tokenMap = {};
  transactions.forEach(tx => {
    const token = tx.tokenSymbol;
    try {
      const value = parseFloat(tx.value) / 10 ** tx.tokenDecimal;
      if (!isNaN(value) && isFinite(value)) {
        tokenMap[token] = (tokenMap[token] || 0) + value;
      }
    } catch (error) {
      console.error("Error parsing transaction value:", error);
    }
  });

  // Get top 6 tokens by volume
  const sortedTokens = Object.entries(tokenMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  const labels = sortedTokens.map(item => item[0]);
  const values = sortedTokens.map(item => item[1]);

  // Process data for time-based analysis
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  // Count transactions and volume by day (for last 30 days)
  const txByDay = {};
  const volumeByDay = {};
  last30Days.forEach(day => {
    txByDay[day] = 0;
    volumeByDay[day] = 0;
  });
  
  transactions.forEach(tx => {
    const date = new Date(tx.timeStamp * 1000).toISOString().split('T')[0];
    if (txByDay[date] !== undefined) {
      txByDay[date]++;
      
      try {
        const value = parseFloat(tx.value) / 10 ** tx.tokenDecimal;
        if (!isNaN(value) && isFinite(value)) {
          volumeByDay[date] += value;
        }
      } catch (error) {
        console.error("Error parsing transaction value for time chart:", error);
      }
    }
  });

  // Prepare chart data
  const volumeData = {
    labels,
    datasets: [
      {
        label: 'Token Volume',
        data: values,
        backgroundColor: [
          'rgba(88, 166, 255, 0.8)', // sky blue
          'rgba(139, 92, 246, 0.8)', // indigo
          'rgba(56, 189, 248, 0.8)', // lighter blue
          'rgba(167, 139, 250, 0.8)', // lighter indigo
          'rgba(14, 165, 233, 0.8)', // another blue shade
          'rgba(192, 132, 252, 0.8)', // another indigo shade
        ],
        borderColor: [
          'rgb(88, 166, 255)', // sky blue border
          'rgb(139, 92, 246)', // indigo border
          'rgb(56, 189, 248)', // lighter blue border
          'rgb(167, 139, 250)', // lighter indigo border
          'rgb(14, 165, 233)', // another blue shade border
          'rgb(192, 132, 252)', // another indigo shade border
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const activityLineData = {
    labels: Object.keys(txByDay),
    datasets: [
      {
        label: 'Daily Transactions',
        data: Object.values(txByDay),
        fill: true,
        backgroundColor: 'rgba(88, 166, 255, 0.2)',
        borderColor: 'rgb(88, 166, 255)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(88, 166, 255)',
        pointBorderColor: '#161B22',
        pointHoverRadius: 5,
      },
    ],
  };
  
  const volumeLineData = {
    labels: Object.keys(volumeByDay),
    datasets: [
      {
        label: 'Daily Volume',
        data: Object.values(volumeByDay),
        fill: true,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgb(139, 92, 246)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#161B22',
        pointHoverRadius: 5,
      },
    ],
  };
  
  const activityBarData = {
    labels: Object.keys(txByDay),
    datasets: [
      {
        label: 'Daily Transactions',
        data: Object.values(txByDay),
        backgroundColor: 'rgba(88, 166, 255, 0.8)',
        borderColor: 'rgb(88, 166, 255)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#C9D1D9',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        titleColor: '#C9D1D9',
        bodyColor: '#C9D1D9',
        borderColor: 'rgba(88, 166, 255, 0.5)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    },
    scales: chartType !== 'pie' ? {
      x: {
        ticks: {
          color: '#8B949E',
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'Inter', sans-serif",
            size: 10
          }
        },
        grid: {
          color: 'rgba(88, 166, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#8B949E',
          font: {
            family: "'Inter', sans-serif",
            size: 10
          }
        },
        grid: {
          color: 'rgba(88, 166, 255, 0.1)'
        },
        beginAtZero: true
      }
    } : {}
  };

  return (
    <div className="mt-6 bg-[#161B22] p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#C9D1D9] mb-4 md:mb-0">Token Analysis</h2>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-[#0D1117] rounded-lg p-1">
            <button
              onClick={() => setChartView('volume')}
              className={`px-3 py-1 rounded-md text-sm ${chartView === 'volume' ? 'bg-[#58A6FF] text-[#C9D1D9]' : 'text-[#8B949E]'}`}
            >
              Token Volume
            </button>
            <button
              onClick={() => setChartView('activity')}
              className={`px-3 py-1 rounded-md text-sm ${chartView === 'activity' ? 'bg-[#58A6FF] text-[#C9D1D9]' : 'text-[#8B949E]'}`}
            >
              Activity
            </button>
          </div>
          
          <div className="bg-[#0D1117] rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md text-sm ${chartType === 'bar' ? 'bg-[#58A6FF] text-[#C9D1D9]' : 'text-[#8B949E]'}`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-md text-sm ${chartType === 'line' ? 'bg-[#58A6FF] text-[#C9D1D9]' : 'text-[#8B949E]'}`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 rounded-md text-sm ${chartType === 'pie' ? 'bg-[#58A6FF] text-[#C9D1D9]' : 'text-[#8B949E]'}`}
            >
              Pie
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0D1117] p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-[#C9D1D9]">
            {chartView === 'volume' ? 'Token Volume Distribution' : 'Transaction Count by Token'}
          </h3>
          <div className="h-72">
            {chartType === 'bar' ? (
              <Bar data={volumeData} options={chartOptions} />
            ) : chartType === 'line' ? (
              <Line data={volumeData} options={chartOptions} />
            ) : (
              <Pie data={volumeData} options={chartOptions} />
            )}
          </div>
        </div>
        
        <div className="bg-[#0D1117] p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-[#C9D1D9]">
            {chartView === 'volume' ? 'Daily Volume' : 'Daily Transaction Activity'}
          </h3>
          <div className="h-72">
            {chartType === 'line' ? (
              <Line 
                data={chartView === 'volume' ? volumeLineData : activityLineData} 
                options={chartOptions} 
              />
            ) : (
              <Bar 
                data={chartView === 'volume' ? volumeLineData : activityBarData} 
                options={chartOptions} 
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-[#8B949E] text-right">
        Data based on the last {Object.keys(txByDay).length} days of activity
      </div>
    </div>
  );
};

export default TokenChart;