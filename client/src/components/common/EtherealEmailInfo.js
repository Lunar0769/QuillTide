import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiExternalLink, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EtherealEmailInfo = () => {
  const [showCredentials, setShowCredentials] = useState(false);
  
  // Check if using Gmail or Ethereal
  const isGmail = process.env.REACT_APP_EMAIL_SERVICE === 'gmail';
  
  // Ethereal credentials (fallback)
  const emailUser = 'ruuvg4yqusieay2e@ethereal.email';
  const emailPass = 'YtZYMdNChuT3a3mq6a';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
            <span className="text-amber-600 dark:text-amber-400 text-sm">📧</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            How to View Your OTP Email
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
            {isGmail 
              ? 'Check your Gmail inbox for the OTP verification email.'
              : 'We use Ethereal Email for testing. Your OTP emails are sent there, not to your real email.'
            }
          </p>
          
          <div className="space-y-2">
            {isGmail ? (
              <div className="text-xs text-amber-700 dark:text-amber-300">
                📧 Check your Gmail inbox for the OTP verification email. It should arrive within a few seconds.
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-700 dark:text-amber-300">1. Visit:</span>
                  <a
                    href="https://ethereal.email/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline"
                  >
                    <span>https://ethereal.email/</span>
                    <FiExternalLink className="w-3 h-3" />
                  </a>
                </div>
            
            <div className="text-xs text-amber-700 dark:text-amber-300">
              2. Login with these credentials:
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Email:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {emailUser}
                  </code>
                  <button
                    onClick={() => copyToClipboard(emailUser, 'Email')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Password:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {showCredentials ? emailPass : '••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCredentials ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(emailPass, 'Password')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  3. Find your OTP email in the inbox and copy the 6-digit code.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtherealEmailInfo;