import React, { useState, useEffect } from 'react';
import { getDoctorsAPI } from '../services/api';
import { User } from '../types';
import { Search, Stethoscope, GraduationCap, Clock, ArrowRight, Filter, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Doctors = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await getDoctorsAPI();
                setDoctors(data);
            } catch (err: any) {
                setError('Failed to load doctors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Extract unique specialties
    const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.doctorDetails?.specialization).filter(Boolean)))];

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.doctorDetails?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.doctorDetails?.specialization === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Section */}
            <section className="relative bg-white py-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary-50 skew-x-12 translate-x-32 z-0 opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <span className="text-secondary-600 font-bold bg-secondary-50 px-4 py-2 rounded-full text-sm inline-block mb-6">
                            Our Medical Experts
                        </span>
                        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            Meet Our Team of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Specialized Doctors</span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                            We bring together a multidisciplinary team of highly qualified doctors to provide you with comprehensive and personalized care.
                        </p>

                        {/* Search Filters */}
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4 max-w-2xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search doctors by name..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-slate-50 focus:ring-2 focus:ring-primary-100 outline-none text-slate-700 font-medium placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative md:w-1/3">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select
                                    className="w-full pl-12 pr-10 py-4 rounded-xl border-none bg-slate-50 focus:ring-2 focus:ring-primary-100 outline-none text-slate-700 font-medium appearance-none cursor-pointer"
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                >
                                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctor Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl">{error}</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No doctors found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredDoctors.map((doc) => (
                                <div key={doc.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                                        {/* Placeholder or real avatar if available */}
                                        <img
                                            src={doc.avatar || `https://ui-avatars.com/api/?name=${doc.name}&background=0D9488&color=fff`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={doc.name}
                                        />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/20">
                                                {doc.doctorDetails?.specialization}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">Dr. {doc.name.replace(/^Dr\.\s*/, '')}</h3>
                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                <ShieldCheck size={14} />
                                                <span>Verified</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <GraduationCap size={18} className="text-primary-500" />
                                                <span>{doc.doctorDetails?.qualification || 'MBBS, MD'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <Stethoscope size={18} className="text-secondary-500" />
                                                <span>{doc.doctorDetails?.experience || 5}+ Years Experience</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <Clock size={18} className="text-amber-500" />
                                                <span>Available: {doc.doctorDetails?.availability?.join(', ') || 'Mon - Fri'}</span>
                                            </div>
                                        </div>

                                        <Link
                                            to="/login"
                                            className="block w-full py-4 rounded-xl bg-slate-50 text-slate-900 font-bold text-center border border-slate-200 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-500/20"
                                        >
                                            Book Appointment <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Doctors;
