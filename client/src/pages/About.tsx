import React from 'react';
import { ShieldCheck, Award, Users, Globe, Clock, ArrowRight } from 'lucide-react';

export const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-slate-50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-40"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Pioneering Healthcare <br /><span className="text-primary-600">Since 2010</span></h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        MediCore Hospital has been at the forefront of medical excellence, providing world-class healthcare with a touch of compassion. We believe in healing with heart and technology.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=2000" alt="Hospital Team" className="rounded-3xl shadow-2xl" />
                    </div>
                    <div className="space-y-8">
                        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-primary-100 rounded-xl text-primary-600"><Globe size={24} /></div>
                                <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
                            </div>
                            <p className="text-slate-600">To provide accessible, affordable, and high-quality healthcare to every individual, transcending borders and barriers.</p>
                        </div>
                        <div className="bg-secondary-50 p-6 rounded-2xl border border-secondary-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-secondary-100 rounded-xl text-secondary-600"><Award size={24} /></div>
                                <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
                            </div>
                            <p className="text-slate-600">To be the global leader in patient-centric care, integrating advanced medical research with human compassion.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-slate-400">The principles that guide every decision we make.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "Patient First", desc: "Every decision we make is centered around the well-being and comfort of our patients." },
                            { icon: ShieldCheck, title: "Integrity", desc: "We maintain the highest standards of ethical behavior and transparency in all our actions." },
                            { icon: Clock, title: "Excellence", desc: "We strive for perfection in every procedure, diagnosis, and patient interaction." }
                        ].map((val, idx) => (
                            <div key={idx} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <val.icon className="w-12 h-12 text-primary-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
