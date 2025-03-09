import React, { useState } from 'react';
import { Strategy, Signal } from '../types/chart';

interface StrategyAssistantProps {
  onStrategyChange: (strategy: Strategy) => void;
  signals: Signal[];
}

export const StrategyAssistant: React.FC<StrategyAssistantProps> = ({
  onStrategyChange,
  signals
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    // Handle message submission
    setMessage('');
  };

  return (
    <div className="fixed right-0 top-0 w-[20%] h-screen bg-[#1e222d] border-l border-[#2a2e39] flex flex-col">
      <div className="p-4 bg-[#2a2e39] border-b border-[#363c4e]">
        <h3 className="text-[#d1d4dc] font-semibold flex items-center gap-2">
          <span>Strategy Assistant</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#262b3d] p-4 rounded-lg">
          <h4 className="text-[#d1d4dc] text-sm font-medium mb-3">Create Strategy</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#787b86] mb-1">First Indicator</label>
              <select className="w-full bg-[#1e222d] border border-[#363c4e] rounded p-2 text-[#d1d4dc]">
                <option value="">Select Indicator</option>
                <option value="ma5">MA 5</option>
                <option value="ma10">MA 10</option>
                <option value="ma20">MA 20</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#787b86] mb-1">Condition</label>
              <select className="w-full bg-[#1e222d] border border-[#363c4e] rounded p-2 text-[#d1d4dc]">
                <option value="">Select Condition</option>
                <option value="crosses_above">Crosses Above</option>
                <option value="crosses_below">Crosses Below</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#787b86] mb-1">Second Indicator</label>
              <select className="w-full bg-[#1e222d] border border-[#363c4e] rounded p-2 text-[#d1d4dc]">
                <option value="">Select Indicator</option>
                <option value="ma5">MA 5</option>
                <option value="ma10">MA 10</option>
                <option value="ma20">MA 20</option>
              </select>
            </div>
          </div>

          <button className="w-full mt-4 bg-[#2962ff] text-white py-2 rounded hover:bg-[#1e4bd8]">
            Apply Strategy
          </button>
        </div>

        <div className="bg-[#262b3d] p-4 rounded-lg">
          <h4 className="text-[#d1d4dc] text-sm font-medium mb-3">Signal Log</h4>
          <div className="space-y-2">
            {signals.map((signal, index) => (
              <div key={index} className="text-sm text-[#787b86] border-b border-[#363c4e] pb-2">
                <div className="font-medium text-[#d1d4dc]">{signal.type} Signal</div>
                <div>Price: ${signal.price}</div>
                <div>Time: {signal.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#363c4e]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about trading strategies..."
            className="flex-1 bg-[#1e222d] border border-[#363c4e] rounded px-3 py-2 text-[#d1d4dc]"
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-2 bg-[#2962ff] text-white rounded hover:bg-[#1e4bd8]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};