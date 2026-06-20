import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 ${isDark
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Icons */}
            <Sun
                size={14}
                className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-500 transition-opacity ${isDark ? 'opacity-40' : 'opacity-100'
                    }`}
            />
            <Moon
                size={14}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-400 transition-opacity ${isDark ? 'opacity-100' : 'opacity-40'
                    }`}
            />

            {/* Toggle Ball */}
            <div
                className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${isDark
                        ? 'translate-x-7 bg-slate-900'
                        : 'translate-x-0 bg-white'
                    }`}
            />
        </button>
    );
};
