import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        // Sequence of animations
        // 0: Initial state
        // 1: Fade in Logo (500ms)
        // 2: Pulse / Scale (1000ms)
        // 3: Fade out (500ms)
        // 4: Finish

        const t1 = setTimeout(() => setStage(1), 100);
        const t2 = setTimeout(() => setStage(2), 800);
        const t3 = setTimeout(() => setStage(3), 2500);
        const t4 = setTimeout(() => onFinish(), 3200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-700 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className={`relative transition-all duration-1000 transform ${stage >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                    <div className="w-32 h-32 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl relative z-10">
                        <Activity size={64} className="text-white animate-bounce-slow" />
                    </div>
                </div>

                <div className={`mt-8 text-center transition-all duration-1000 delay-300 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MediCore</h1>
                    <p className="text-slate-400 text-lg tracking-widest uppercase text-xs font-semibold">Hospital Management System</p>
                </div>

                {/* Loading Bar */}
                <div className={`mt-12 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden transition-all duration-500 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-loading-bar rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
