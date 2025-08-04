import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

interface IdleWarningProps {
  timeUntilLogout: number;
  onExtendSession: () => void;
  onDismiss: () => void;
}

const IdleWarning: React.FC<IdleWarningProps> = ({ 
  timeUntilLogout, 
  onExtendSession, 
  onDismiss 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-800">Session Timeout Warning</h4>
              <button
                onClick={onDismiss}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-yellow-700 mb-3">
              You will be automatically logged out in{' '}
              <span className="font-mono font-bold">{formatTime(timeUntilLogout)}</span>
              {' '}due to inactivity.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={onExtendSession}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Stay Logged In</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleWarning; 