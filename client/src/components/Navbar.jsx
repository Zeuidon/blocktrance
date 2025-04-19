import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ activePage }) => {
  return (
    <nav className="bg-[#161B22] text-[#C9D1D9] fixed top-0 left-0 right-0 z-10 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22L3 17V7L12 2L21 7V17L12 22Z" stroke="#58A6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14L17 11V7.5L12 5L7 7.5V11L12 14Z" fill="#8B5CF6"/>
              </svg>
              <span className="font-bold text-xl">BlockTrace</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${activePage === 'dashboard' ? 'bg-[#58A6FF]' : 'hover:bg-[#8B5CF6]/70'}`}>
                Dashboard
              </Link>
              <Link to="/transactions" className={`px-3 py-2 rounded-md text-sm font-medium ${activePage === 'transactions' ? 'bg-[#58A6FF]' : 'hover:bg-[#8B5CF6]/70'}`}>
                Transactions
              </Link>
              <Link to="/analytics" className={`px-3 py-2 rounded-md text-sm font-medium ${activePage === 'analytics' ? 'bg-[#58A6FF]' : 'hover:bg-[#8B5CF6]/70'}`}>
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;