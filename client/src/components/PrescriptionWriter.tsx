import React, { useState, useRef } from 'react';
import {
    FileText, Download, Printer, User, Calendar, Pill,
    AlertTriangle, CheckCircle, Building2, Phone, Mail,
    Stethoscope, QrCode
} from 'lucide-react';

interface PrescriptionData {
    patientName: string;
    patientAge: string;
    patientGender: string;
    patientPhone: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string; instructions: string }[];
    advice: string;
    followUpDate: string;
}

export const PrescriptionWriter = () => {
    const [prescription, setPrescription] = useState<PrescriptionData>({
        patientName: '',
        patientAge: '',
        patientGender: 'Male',
        patientPhone: '',
        diagnosis: '',
        medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
        advice: '',
        followUpDate: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const addMedicine = () => {
        setPrescription(prev => ({
            ...prev,
            medicines: [...prev.medicines, { name: '', dosage: '', duration: '', instructions: '' }]
        }));
    };

    const updateMedicine = (index: number, field: string, value: string) => {
        setPrescription(prev => ({
            ...prev,
            medicines: prev.medicines.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const removeMedicine = (index: number) => {
        setPrescription(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index)
        }));
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Prescription - ${prescription.patientName}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: bold; color: #0ea5e9; }
                        .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                        .section { margin-bottom: 20px; }
                        .section-title { font-weight: bold; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
                        .medicine { background: #f8fafc; padding: 10px; margin-bottom: 10px; border-radius: 8px; }
                        .medicine-name { font-weight: bold; color: #0ea5e9; }
                        .rx { font-size: 32px; color: #0ea5e9; font-weight: bold; }
                        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #334155; padding-top: 10px; text-align: center; }
                        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const generatePrescriptionId = () => {
        return `RX${Date.now().toString(36).toUpperCase()}`;
    };

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText className="text-blue-500" />
                            Digital Prescription Writer
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Create professional prescriptions with QR codes
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {showPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <Printer size={18} />
                            Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className={`space-y-6 ${showPreview ? 'hidden lg:block' : ''}`}>
                        {/* Patient Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-blue-500" />
                                Patient Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Patient Name"
                                    value={prescription.patientName}
                                    onChange={e => setPrescription(p => ({ ...p, patientName: e.target.value }))}
                                    className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Age"
                                    value={prescription.patientAge}
                                    onChange={e => setPrescription(p => ({ ...p, patientAge: e.target.value }))}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <select
                                    value={prescription.patientGender}
                                    onChange={e => setPrescription(p => ({ ...p, patientGender: e.target.value }))}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={prescription.patientPhone}
                                    onChange={e => setPrescription(p => ({ ...p, patientPhone: e.target.value }))}
                                    className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Stethoscope size={20} className="text-purple-500" />
                                Diagnosis
                            </h3>
                            <textarea
                                placeholder="Enter diagnosis..."
                                value={prescription.diagnosis}
                                onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        {/* Medicines */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Pill size={20} className="text-green-500" />
                                Medications
                            </h3>
                            <div className="space-y-4">
                                {prescription.medicines.map((med, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl relative">
                                        {prescription.medicines.length > 1 && (
                                            <button
                                                onClick={() => removeMedicine(idx)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={med.name}
                                                onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage (e.g., 500mg)"
                                                value={med.dosage}
                                                onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration (e.g., 5 days)"
                                                value={med.duration}
                                                onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Instructions (e.g., After meals)"
                                                value={med.instructions}
                                                onChange={e => updateMedicine(idx, 'instructions', e.target.value)}
                                                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addMedicine}
                                    className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                >
                                    + Add Medicine
                                </button>
                            </div>
                        </div>

                        {/* Advice & Follow-up */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-amber-500" />
                                Advice & Follow-up
                            </h3>
                            <textarea
                                placeholder="Additional advice..."
                                value={prescription.advice}
                                onChange={e => setPrescription(p => ({ ...p, advice: e.target.value }))}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                            />
                            <input
                                type="date"
                                value={prescription.followUpDate}
                                onChange={e => setPrescription(p => ({ ...p, followUpDate: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className={`${!showPreview ? 'hidden lg:block' : ''}`}>
                        <div ref={printRef} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200" style={{ minHeight: '800px' }}>
                            {/* Header */}
                            <div className="header text-center border-b-2 border-blue-500 pb-6 mb-6">
                                <div className="logo text-2xl font-bold text-blue-600 mb-2">
                                    🏥 NextGen Health Hospital
                                </div>
                                <p className="text-slate-500 text-sm">123 Healthcare Avenue, Medical City - 110001</p>
                                <p className="text-slate-500 text-sm">📞 +91 98765 43210 | ✉️ care@nextgenhealth.com</p>
                            </div>

                            {/* Prescription ID & Date */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-sm text-slate-500">Prescription ID:</span>
                                    <span className="ml-2 font-mono font-bold text-blue-600">{generatePrescriptionId()}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">Date:</span>
                                    <span className="ml-2 font-medium">{currentDate}</span>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="patient-info grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-6">
                                <div><span className="text-slate-500">Name:</span> <strong>{prescription.patientName || '---'}</strong></div>
                                <div><span className="text-slate-500">Age/Gender:</span> <strong>{prescription.patientAge || '--'} / {prescription.patientGender}</strong></div>
                                <div><span className="text-slate-500">Phone:</span> <strong>{prescription.patientPhone || '---'}</strong></div>
                            </div>

                            {/* Diagnosis */}
                            <div className="section mb-6">
                                <div className="section-title font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">
                                    Diagnosis
                                </div>
                                <p className="text-slate-700">{prescription.diagnosis || 'Not specified'}</p>
                            </div>

                            {/* Rx Symbol & Medicines */}
                            <div className="section mb-6">
                                <div className="rx text-4xl text-blue-600 font-bold mb-4">℞</div>
                                <div className="space-y-3">
                                    {prescription.medicines.map((med, idx) => (
                                        med.name && (
                                            <div key={idx} className="medicine bg-slate-50 p-4 rounded-xl">
                                                <div className="medicine-name text-blue-600 font-bold">
                                                    {idx + 1}. {med.name} {med.dosage && `- ${med.dosage}`}
                                                </div>
                                                <div className="text-slate-600 text-sm mt-1">
                                                    {med.duration && `Duration: ${med.duration}`}
                                                    {med.instructions && ` | ${med.instructions}`}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Advice */}
                            {prescription.advice && (
                                <div className="section mb-6">
                                    <div className="section-title font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3">
                                        Advice
                                    </div>
                                    <p className="text-slate-700">{prescription.advice}</p>
                                </div>
                            )}

                            {/* Follow-up */}
                            {prescription.followUpDate && (
                                <div className="bg-amber-50 p-4 rounded-xl mb-6">
                                    <span className="text-amber-700 font-medium">📅 Follow-up Date: </span>
                                    <strong>{new Date(prescription.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="footer mt-12 flex justify-between items-end">
                                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <QrCode size={48} className="text-slate-400" />
                                </div>
                                <div className="signature text-center">
                                    <div className="w-48 border-t border-slate-400 pt-2">
                                        <p className="font-bold">Dr. Smith Wilson</p>
                                        <p className="text-slate-500 text-sm">MBBS, MD (Medicine)</p>
                                        <p className="text-slate-500 text-sm">Reg. No: MCI-12345</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
