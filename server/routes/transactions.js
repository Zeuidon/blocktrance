const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();
const { ethers } = require('ethers');

// Utility function to validate Ethereum address
const validateAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Get paginated token transactions for an address
router.get('/:address', async (req, res) => {
  const { address } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Validate address format
  if (!validateAddress(address)) {
    return res.status(400).json({ 
      status: '0', 
      message: 'Invalid Ethereum address format' 
    });
  }
  
  try {
    // First get the total number of transactions
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`
    );
    
    if (response.data.status === '0') {
      return res.status(404).json({ 
        status: '0', 
        message: response.data.message || 'No transactions found' 
      });
    }
    
    const allTransactions = response.data.result || [];
    const totalItems = allTransactions.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    
    // Slice the transactions for the requested page
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      status: '1',
      message: 'OK',
      result: paginatedTransactions,
      pagination: {
        total: totalItems,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalItems / Number(limit)),
        hasMore: endIndex < totalItems
      }
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status;
      if (statusCode === 429) {
        return res.status(429).json({ 
          status: '0', 
          message: 'Rate limit exceeded. Please try again later.' 
        });
      } else {
        return res.status(statusCode).json({ 
          status: '0', 
          message: `API Error: ${error.response.data.message || 'Unknown error'}` 
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ 
        status: '0', 
        message: 'No response from Etherscan API. Please try again later.' 
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ 
        status: '0', 
        message: 'Internal server error' 
      });
    }
  }
});

// Get filtered and paginated transactions by token address
router.get('/:address/token/:tokenAddress', async (req, res) => {
  const { address, tokenAddress } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Validate addresses
  if (!validateAddress(address)) {
    return res.status(400).json({ 
      status: '0', 
      message: 'Invalid Ethereum wallet address format' 
    });
  }
  
  if (!validateAddress(tokenAddress)) {
    return res.status(400).json({ 
      status: '0', 
      message: 'Invalid token contract address format' 
    });
  }
  
  try {
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&contractaddress=${tokenAddress}&startblock=0&endblock=999999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`
    );
    
    if (response.data.status === '0') {
      return res.status(404).json({ 
        status: '0', 
        message: response.data.message || 'No transactions found for this token' 
      });
    }
    
    const allTransactions = response.data.result || [];
    const totalItems = allTransactions.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    
    // Slice the transactions for the requested page
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      status: '1',
      message: 'OK',
      result: paginatedTransactions,
      pagination: {
        total: totalItems,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalItems / Number(limit)),
        hasMore: endIndex < totalItems
      }
    });
    
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    
    // Enhanced error handling
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode === 429) {
        return res.status(429).json({ 
          status: '0', 
          message: 'Rate limit exceeded. Please try again later.' 
        });
      } else {
        return res.status(statusCode).json({ 
          status: '0', 
          message: `API Error: ${error.response.data.message || 'Unknown error'}` 
        });
      }
    } else if (error.request) {
      return res.status(503).json({ 
        status: '0', 
        message: 'No response from Etherscan API. Please try again later.' 
      });
    } else {
      return res.status(500).json({ 
        status: '0', 
        message: 'Internal server error' 
      });
    }
  }
});

module.exports = router;