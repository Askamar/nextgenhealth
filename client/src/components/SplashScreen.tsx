import React, { useEffect, useState } from 'react';
import { Stethoscope, Heart } from 'lucide-react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [stage, setStage] = useState(0);
    const [lineProgress, setLineProgress] = useState(0);

    useEffect(() => {
        // Simple sequence:
        // 0: Initial
        // 1: Logo appears (300ms)
        // 2: Text appears (600ms)
        // 3: Heartbeat line starts (900ms)
        // 4: Fade out when line completes (2500ms)

        const t1 = setTimeout(() => setStage(1), 100);
        const t2 = setTimeout(() => setStage(2), 400);
        const t3 = setTimeout(() => setStage(3), 700);
        const t4 = setTimeout(() => setStage(4), 2800);
        const t5 = setTimeout(() => onFinish(), 3300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, [onFinish]);

    // Animate line progress
    useEffect(() => {
        if (stage >= 3) {
            const startTime = Date.now();
            const duration = 2000; // 2 seconds for line to complete

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                setLineProgress(progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [stage]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${stage === 4 ? 'opacity-0' : 'opacity-100'
                }`}
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            }}
        >
            {/* Logo */}
            <div className={`transition-all duration-700 transform ${stage >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
                }`}>
                <div className="relative">
                    {/* Subtle glow */}
                    <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-2xl opacity-20" />

                    {/* Logo Box */}
                    <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)'
                        }}>
                        <Stethoscope size={56} className="text-white drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {/* Text */}
            <div className={`mt-8 text-center transition-all duration-700 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    NextGen Health
                </h1>
                <p className="text-slate-400 text-sm tracking-widest uppercase">
                    Healthcare Solutions
                </p>
            </div>

            {/* Heartbeat Line - Full Width */}
            <div className={`absolute bottom-0 left-0 right-0 h-32 transition-opacity duration-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'
                }`}>
                <svg
                    viewBox="0 0 1200 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    {/* Background line (gray) */}
                    <path
                        d="M0,50 L200,50 L250,50 L280,20 L310,80 L340,30 L370,70 L400,50 L500,50 L550,50 L580,15 L610,85 L640,25 L670,75 L700,50 L800,50 L850,50 L880,20 L910,80 L940,30 L970,70 L1000,50 L1200,50"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="2"
                    />

                    {/* Animated line (cyan gradient) */}
                    <path
                        d="M0,50 L200,50 L250,50 L280,20 L310,80 L340,30 L370,70 L400,50 L500,50 L550,50 L580,15 L610,85 L640,25 L670,75 L700,50 L800,50 L850,50 L880,20 L910,80 L940,30 L970,70 L1000,50 L1200,50"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: 1400,
                            strokeDashoffset: 1400 - (1400 * lineProgress)
                        }}
                    />

                    {/* Glowing dot at the end of the line */}
                    {lineProgress > 0 && lineProgress < 1 && (
                        <circle
                            cx={lineProgress * 1200}
                            cy={50}
                            r="6"
                            fill="#06b6d4"
                            style={{
                                filter: 'drop-shadow(0 0 8px #06b6d4) drop-shadow(0 0 16px #06b6d4)'
                            }}
                        />
                    )}

                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Heart icon that pulses when line reaches certain points */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Heart
                        size={16}
                        className={`text-red-500 transition-transform duration-200 ${lineProgress > 0.3 && lineProgress < 0.35 ? 'scale-150' :
                                lineProgress > 0.6 && lineProgress < 0.65 ? 'scale-150' :
                                    lineProgress > 0.9 && lineProgress < 0.95 ? 'scale-150' : 'scale-100'
                            }`}
                        fill="#ef4444"
                    />
                    <span className="text-slate-500 text-xs tracking-wider">
                        {lineProgress < 1 ? 'Connecting...' : 'Ready'}
                    </span>
                </div>
            </div>
        </div>
    );
};
