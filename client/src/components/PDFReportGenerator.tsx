import React, { useState } from 'react';
import {
    FileText, Download, Calendar, User, Pill, AlertTriangle,
    CheckCircle, Share2, Printer
} from 'lucide-react';
import { Drug, DrugInteraction } from '../types';

interface PDFReportGeneratorProps {
    drugs: Drug[];
    interactions: DrugInteraction[];
    onClose: () => void;
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
    drugs,
    interactions,
    onClose
}) => {
    const [patientName, setPatientName] = useState('');
    const [generating, setGenerating] = useState(false);

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const generateReport = () => {
        setGenerating(true);

        const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Drug Interaction Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            color: #334155;
        }
        .header { 
            text-align: center; 
            padding-bottom: 30px; 
            border-bottom: 3px solid #0ea5e9; 
            margin-bottom: 30px; 
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #0ea5e9; 
            margin-bottom: 5px; 
        }
        .subtitle { color: #64748b; font-size: 14px; }
        .report-title { 
            font-size: 22px; 
            font-weight: bold; 
            margin: 20px 0; 
            color: #1e293b;
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 15px; 
            background: #f8fafc; 
            border-radius: 8px; 
            margin-bottom: 20px; 
        }
        .section { margin-bottom: 30px; }
        .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #475569; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 8px; 
            margin-bottom: 15px; 
        }
        .drug-card { 
            background: #f1f5f9; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 10px; 
        }
        .drug-name { font-weight: bold; color: #0ea5e9; font-size: 16px; }
        .drug-info { font-size: 13px; color: #64748b; margin-top: 5px; }
        .interaction-card { 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 15px; 
            border-left: 4px solid;
        }
        .severe { background: #fef2f2; border-color: #ef4444; }
        .moderate { background: #fffbeb; border-color: #f59e0b; }
        .mild { background: #eff6ff; border-color: #3b82f6; }
        .severity-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
        }
        .severe .severity-badge { background: #ef4444; color: white; }
        .moderate .severity-badge { background: #f59e0b; color: white; }
        .mild .severity-badge { background: #3b82f6; color: white; }
        .interaction-drugs { font-weight: bold; margin: 10px 0; }
        .no-interactions { 
            text-align: center; 
            padding: 40px; 
            background: #f0fdf4; 
            border-radius: 12px; 
            color: #16a34a; 
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e2e8f0; 
            text-align: center; 
            font-size: 12px; 
            color: #94a3b8; 
        }
        .disclaimer { 
            background: #fef3c7; 
            padding: 15px; 
            border-radius: 8px; 
            font-size: 12px; 
            color: #92400e; 
            margin-top: 20px; 
        }
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏥 NextGen Health</div>
        <div class="subtitle">AI-Powered Healthcare Solutions</div>
    </div>

    <div class="report-title">Drug Interaction Report</div>

    <div class="info-row">
        <div><strong>Patient:</strong> ${patientName || 'Not specified'}</div>
        <div><strong>Date:</strong> ${currentDate}</div>
        <div><strong>Report ID:</strong> DIR-${Date.now().toString(36).toUpperCase()}</div>
    </div>

    <div class="section">
        <div class="section-title">📋 Medications Analyzed (${drugs.length})</div>
        ${drugs.map(drug => `
            <div class="drug-card">
                <div class="drug-name">${drug.name}</div>
                <div class="drug-info">
                    ${drug.category ? `Category: ${drug.category}` : ''}
                    ${drug.dosageTiming ? ` | Timing: ${drug.dosageTiming}` : ''}
                    ${drug.maxDose ? ` | Max Dose: ${drug.maxDose}` : ''}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">⚠️ Interaction Analysis</div>
        ${interactions.length === 0 ? `
            <div class="no-interactions">
                <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                <div style="font-size: 18px; font-weight: bold;">No Interactions Found</div>
                <div style="margin-top: 5px;">The analyzed medications appear to be safe to use together.</div>
            </div>
        ` : interactions.map(int => `
            <div class="interaction-card ${int.severity.toLowerCase()}">
                <span class="severity-badge">${int.severity} Risk</span>
                <div class="interaction-drugs">${int.drugs.join(' + ')}</div>
                <div>${int.description}</div>
                ${int.management ? `<div style="margin-top: 10px; font-weight: 500;">💡 Recommendation: ${int.management}</div>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="disclaimer">
        ⚠️ <strong>Disclaimer:</strong> This report is generated by an AI system for informational purposes only. 
        It does not replace professional medical advice. Always consult a qualified healthcare provider 
        before making any changes to your medication regimen.
    </div>

    <div class="footer">
        Generated by NextGen Health AI System | ${currentDate} | www.nextgenhealth.com
    </div>
</body>
</html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(reportContent);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
                setGenerating(false);
            }, 500);
        } else {
            setGenerating(false);
            alert('Please allow popups to generate the report.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generate PDF Report</h2>
                        <p className="text-slate-500 text-sm">Download or print interaction report</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Patient Name (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter patient name..."
                            value={patientName}
                            onChange={e => setPatientName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Report will include:</div>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            <li>✓ {drugs.length} medication(s) analyzed</li>
                            <li>✓ {interactions.length} interaction(s) found</li>
                            <li>✓ Severity levels & recommendations</li>
                            <li>✓ Professional formatting</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generateReport}
                        disabled={generating}
                        className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {generating ? (
                            'Generating...'
                        ) : (
                            <>
                                <Download size={18} />
                                Generate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
