import React from 'react';
import {
    Building2,
    Stethoscope,
    Heart,
    Activity,
    Syringe,
    Pill,
    Siren,
    Coffee,
    Wifi,
    Baby,
    Microscope,
    Scan
} from 'lucide-react';

const FacilityCard = ({ icon: Icon, title, description, color }: any) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
);

export const Facilities = () => {
    const specializedUnits = [
        {
            icon: Heart,
            title: "Cardiac Care Unit (CCU)",
            description: "Advanced heart care facility equipped with continuous cardiac monitoring and specialized support systems.",
            color: "bg-red-50 text-red-500"
        },
        {
            icon: Activity,
            title: "Intensive Care Unit (ICU)",
            description: "24/7 critical care provided by multidisciplinary teams using state-of-the-art life support technology.",
            color: "bg-blue-50 text-blue-500"
        },
        {
            icon: Baby,
            title: "Neonatal ICU",
            description: "Specialized care for premature and ill newborn babies, ensuring the best start in life.",
            color: "bg-purple-50 text-purple-500"
        },
        {
            icon: Scan,
            title: "Radiology Center",
            description: "Comprehensive imaging services including MRI, CT Scan, X-Ray, and Ultrasound for precise diagnosis.",
            color: "bg-indigo-50 text-indigo-500"
        }
    ];

    const generalServices = [
        {
            icon: Microscope,
            title: "Pathology Lab",
            description: "Fully automated NABL accredited laboratory providing accurate diagnostic results.",
            color: "bg-teal-50 text-teal-500"
        },
        {
            icon: Pill,
            title: "24/7 Pharmacy",
            description: "Well-stocked pharmacy ensuring round-the-clock availability of all essential medicines.",
            color: "bg-green-50 text-green-500"
        },
        {
            icon: Siren,
            title: "Emergency & Trauma",
            description: "Rapid response emergency department equipped to handle all kinds of medical urgencies.",
            color: "bg-orange-50 text-orange-500"
        },
        {
            icon: Syringe,
            title: "Vaccination Center",
            description: "Safe and hygienic immunization services for children and adults.",
            color: "bg-pink-50 text-pink-500"
        }
    ];

    const amenities = [
        { icon: Building2, label: "Private Rooms" },
        { icon: Coffee, label: "Cafeteria" },
        { icon: Wifi, label: "Free Wi-Fi" },
        { icon: Stethoscope, label: "Rehab Center" }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative bg-slate-900 py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
                        World-Class Infrastructure
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Advanced Facilities for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">Superior Care</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        We combine cutting-edge technology with patient-centric design to ensure the most comfortable and effective healing environment.
                    </p>
                </div>
            </section>

            {/* Specialized Units */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Specialized Care Units</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Dedicated departments staffed by experts and equipped with specialized technology for focused treatment.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {specializedUnits.map((facility, idx) => (
                            <FacilityCard key={idx} {...facility} />
                        ))}
                    </div>
                </div>
            </section>

            {/* General Services */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Support Services</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Essential healthcare services operating 24/7 to support your recovery journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {generalServices.map((service, idx) => (
                            <FacilityCard key={idx} {...service} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Amenities Banner */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-4">Patient & Visitor Amenities</h2>
                                <p className="text-slate-400">Making your stay comfortable with our premium amenities.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {amenities.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                        <item.icon className="text-primary-400 mb-4" size={32} />
                                        <span className="text-white font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Facilities;
