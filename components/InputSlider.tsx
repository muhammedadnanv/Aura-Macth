import React from 'react';

interface InputSliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (val: number) => void;
}

const InputSlider: React.FC<InputSliderProps> = ({ label, leftLabel, rightLabel, value, onChange }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2 text-mystic-accent font-medium tracking-wide">
        <span>{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-mystic-700 rounded-lg appearance-none cursor-pointer accent-mystic-accent hover:accent-white transition-all duration-300"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-2 uppercase tracking-wider">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

export default InputSlider;
