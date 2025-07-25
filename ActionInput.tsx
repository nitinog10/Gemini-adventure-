
import React, { useState } from 'react';

interface ActionInputProps {
  suggestedActions: string[];
  onActionSubmit: (action: string) => void;
  isLoading: boolean;
  gameOver: boolean;
}

const ActionInput: React.FC<ActionInputProps> = ({ suggestedActions, onActionSubmit, isLoading, gameOver }) => {
  const [customAction, setCustomAction] = useState('');

  const handleSubmit = (action: string) => {
    if (action.trim() && !isLoading && !gameOver) {
      onActionSubmit(action.trim());
      setCustomAction('');
    }
  };

  if (gameOver) {
    return null; // Game over message and button handled in App.tsx
  }

  return (
    <div className="mt-6 p-4 bg-gray-700/50 backdrop-blur-sm rounded-lg shadow-md animate-fadeIn">
      <h3 className="text-xl font-semibold text-sky-300 mb-4">What do you do?</h3>
      <div className="space-y-3">
        {suggestedActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleSubmit(action)}
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {action}
          </button>
        ))}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
          <input
            type="text"
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            placeholder="Or type your own action..."
            disabled={isLoading}
            className="flex-grow p-3 border border-gray-600 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-60"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(customAction);
              }
            }}
          />
          <button
            onClick={() => handleSubmit(customAction)}
            disabled={isLoading || !customAction.trim()}
            className="bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-6 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionInput;
