/**
 * Navigation Component for Zephyra
 * 
 * This component provides the main navigation for the Zephyra Stellar Testnet
 * remittance platform, allowing users to switch between different sections.
 */

import React, { useState } from 'react';

/**
 * Navigation Component
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Callback when tab changes
 * @returns {JSX.Element} Navigation component
 */
const Navigation = ({ activeTab, onTabChange }) => {  // Remove wallet props
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'chart-pie' },
    { id: 'send', label: 'Send Money', icon: 'paper-plane' },
    { id: 'history', label: 'Transaction History', icon: 'history' },
    { id: 'pools', label: 'Liquidity Pools', icon: 'database' }
  ];
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle tab change
  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };
  
  // Render icon based on name
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'chart-pie':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
          </svg>
        );
      case 'paper-plane':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        );
      case 'history':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
          </svg>
        );
      case 'database':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="w-full mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between h-20">
          {/* Navigation Links on Left Side */}
          <div className="flex items-center">
            {/* Desktop navigation */}
            <div className="flex space-x-8 items-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:border-indigo-200 hover:text-white'
                  } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                >
                  <span className="mr-2">{renderIcon(tab.icon)}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Logo on Right Side */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={`${process.env.PUBLIC_URL}/images/logo.png`} 
              alt="Zephyra Logo" 
              className="h-36 w-auto transition-transform duration-300 hover:scale-105" 
            />
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1 bg-indigo-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-indigo-800 border-white text-white'
                  : 'border-transparent text-indigo-100 hover:bg-indigo-600 hover:border-indigo-300 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              <div className="flex items-center">
                <span className="mr-2">{renderIcon(tab.icon)}</span>
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;