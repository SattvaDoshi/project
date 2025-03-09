import React from 'react';
import { 
  MousePointer2, 
  Crosshair, 
  Pen, 
  Shapes, 
  TextCursor,
  Ruler,
  Move,
  Magnet,
  Trash2
} from 'lucide-react';

interface SidePanelProps {
  onToolSelect: (tool: string) => void;
  activeTool: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({ onToolSelect, activeTool }) => {
  const tools = [
    { id: 'pointer', icon: MousePointer2 },
    { id: 'crosshair', icon: Crosshair },
    { id: 'pen', icon: Pen },
    { id: 'shapes', icon: Shapes },
    { id: 'text', icon: TextCursor },
    { id: 'ruler', icon: Ruler },
    { id: 'move', icon: Move },
    { id: 'magnet', icon: Magnet },
    { id: 'trash', icon: Trash2 }
  ];

  return (
    <div className="fixed left-0 top-14 bottom-0 w-14 flex flex-col bg-[#1e222d] py-3 px-2 border-r border-[#2a2e39] z-89">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`w-10 h-10 mb-2 flex items-center justify-center rounded-md transition-all
            ${activeTool === tool.id 
              ? 'bg-[#2962ff] text-white' 
              : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
        >
          <tool.icon size={18} />
        </button>
      ))}
    </div>
  );
};