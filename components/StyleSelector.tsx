import React from 'react';
import { Style, Genre } from '../types';
import { STYLES, GENRES } from '../constants';

interface StyleSelectorProps {
  style: Style;
  setStyle: (style: Style) => void;
  genre: Genre;
  setGenre: (genre: Genre) => void;
}

const CustomSelect = <T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: readonly T[] }) => (
    <div>
        <label htmlFor={label.toLowerCase()} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            id={label.toLowerCase()}
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
            {options.map((option) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);


export const StyleSelector: React.FC<StyleSelectorProps> = ({ style, setStyle, genre, setGenre }) => {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-gray-300">C. Choose Style & Genre</p>
      <div className="space-y-3">
        <CustomSelect label="Style" value={style} onChange={setStyle} options={STYLES} />
        <CustomSelect label="Genre" value={genre} onChange={setGenre} options={GENRES} />
      </div>
    </div>
  );
};
