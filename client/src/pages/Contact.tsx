import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
                    <p className="text-lg text-slate-600">We're here to help and answer any question you might have.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Emergency</h3>
                            <p className="text-slate-500 mb-4">24/7 Rapid Response</p>
                            <p className="text-2xl font-bold text-slate-900">+1 (555) 123-4567</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center text-secondary-600 mb-6">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Email Us</h3>
                            <p className="text-slate-500 mb-4">For general inquiries</p>
                            <p className="text-lg font-medium text-slate-900">support@medicore.com</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Visit Us</h3>
                            <p className="text-slate-500 mb-4">Main Hospital Campus</p>
                            <p className="text-lg font-medium text-slate-900">123 Medical Drive,<br />New York, NY 10001</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 h-full">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-colors bg-slate-50" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-colors bg-slate-50" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-colors bg-slate-50" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                    <textarea className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-colors bg-slate-50 h-32 resize-none" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="button" className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30">
                                    <Send size={18} />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
