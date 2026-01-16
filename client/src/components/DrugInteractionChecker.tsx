import React, { useState } from 'react';
import { Plus, X, AlertTriangle, CheckCircle, Search, Pill, Info, Clock, ShieldAlert, Loader2 } from 'lucide-react';
import { searchDrugsAPI, checkInteractionsAPI, getDrugInfoAPI } from '../services/api';
import { Drug } from '../types';

export const DrugInteractionChecker = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Drug[]>([]);
    const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length > 1) {
            const results = await searchDrugsAPI(val);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const addDrug = async (drugOrName: Drug | string) => {
        setQuery('');
        setSuggestions([]);

        let drugToAdd: Drug;

        if (typeof drugOrName === 'string') {
            // Need to fetch details
            setAiLoading(true);
            try {
                const fetchedDrug = await getDrugInfoAPI(drugOrName);
                if (fetchedDrug) {
                    drugToAdd = fetchedDrug;
                } else {
                    alert('Could not fetch details for this medicine.');
                    setAiLoading(false);
                    return;
                }
            } catch (err) {
                console.error(err);
                setAiLoading(false);
                return;
            }
            setAiLoading(false);
        } else {
            drugToAdd = drugOrName;
        }

        if (!selectedDrugs.some(d => d.name.toLowerCase() === drugToAdd.name.toLowerCase())) {
            setSelectedDrugs([...selectedDrugs, drugToAdd]);
        }
        setHasChecked(false);
    };

    const removeDrug = (name: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.name !== name));
        setHasChecked(false);
    };

    const checkInteractions = async () => {
        if (selectedDrugs.length < 2) return;
        setLoading(true);
        try {
            const drugNames = selectedDrugs.map(d => d.name);
            const res = await checkInteractionsAPI(drugNames);
            setInteractions(res.interactions);
            setHasChecked(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transform transition-all hover:shadow-2xl">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Pill size={120} />
                </div>
                <h2 className="text-3xl font-bold flex items-center gap-3 relative z-10">
                    <Pill className="text-blue-200" size={32} /> Drug Interaction Checker & Info
                </h2>
                <p className="text-blue-100 mt-4 text-lg max-w-2xl relative z-10">
                    Search for medicines to see dosage instructions and check for safe combinations.
                </p>
            </div>

            <div className="p-8">
                {/* Search & Add */}
                <div className="relative mb-10">
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Search Medicine</label>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                        <input
                            type="text"
                            className="w-full pl-14 pr-12 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-lg text-slate-700 placeholder:font-normal"
                            placeholder="Type medicine name (e.g. Aspirin)"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && query && suggestions.length === 0) {
                                    // Allow adding custom drug by checking AI
                                    addDrug(query);
                                }
                            }}
                            disabled={aiLoading}
                        />
                        {aiLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto animate-fadeIn">
                            {suggestions.map((drug, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between group"
                                    onClick={() => addDrug(drug)}
                                >
                                    <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">{drug.name}</span>
                                    {drug.category && (
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full group-hover:bg-white group-hover:shadow-sm">{drug.category}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Hint for AI search */}
                    {query.length > 2 && suggestions.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-blue-100 z-50 p-4 text-center">
                            <p className="text-slate-500 mb-2">Medicine not found in local list.</p>
                            <button
                                onClick={() => addDrug(query)}
                                className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                            >
                                <Search size={16} /> Fetch details for "{query}" using AI
                            </button>
                        </div>
                    )}
                </div>

                {/* Selected Drugs Info Cards */}
                <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedDrugs.map((drug, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 relative group hover:border-blue-200 transition-all">
                            <button
                                onClick={() => removeDrug(drug.name)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow"
                            >
                                <X size={18} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Pill size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">{drug.name}</h3>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{drug.category}</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm text-slate-600">
                                {drug.description && (
                                    <p className="italic text-slate-500">{drug.description}</p>
                                )}

                                {drug.dosageTiming && (
                                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                        <Clock className="shrink-0 text-amber-500 mt-0.5" size={16} />
                                        <div>
                                            <span className="block font-bold text-slate-800 text-xs uppercase mb-1">When to take</span>
                                            {drug.dosageTiming}
                                        </div>
                                    </div>
                                )}

                                {(drug.minDose || drug.maxDose) && (
                                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                        <Info className="shrink-0 text-blue-500 mt-0.5" size={16} />
                                        <div>
                                            <span className="block font-bold text-slate-800 text-xs uppercase mb-1">Dosage Limits</span>
                                            <div className="grid grid-cols-2 gap-4">
                                                {drug.minDose && <div>Min: <span className="font-bold">{drug.minDose}</span></div>}
                                                {drug.maxDose && <div>Max: <span className="font-bold">{drug.maxDose}</span></div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {drug.sideEffects && (
                                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                        <ShieldAlert className="shrink-0 text-red-500 mt-0.5" size={16} />
                                        <div>
                                            <span className="block font-bold text-slate-800 text-xs uppercase mb-1">Side Effects</span>
                                            {drug.sideEffects}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {selectedDrugs.length === 0 && (
                        <div className="col-span-full py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Search size={32} className="opacity-20" />
                            <p>Search and add medicines to view their details</p>
                        </div>
                    )}
                </div>

                {/* Check Action */}
                <div className="flex justify-center border-t border-slate-100 pt-8">
                    <button
                        onClick={checkInteractions}
                        disabled={selectedDrugs.length < 2 || loading}
                        className={`w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-xl shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${selectedDrugs.length < 2
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] hover:shadow-blue-600/30 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <>Checking Database...</>
                        ) : (
                            <>
                                <CheckCircle size={24} /> Check Interactions ({selectedDrugs.length})
                            </>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                {hasChecked && (
                    <div className="mt-10 animate-slideUp">
                        <div className="border-t border-slate-100 pt-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                Interaction Report
                            </h3>

                            {interactions.length === 0 ? (
                                <div className="p-8 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-5 text-green-800 shadow-sm">
                                    <div className="bg-green-100 p-3 rounded-full shrink-0 text-green-600">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xl mb-1">No Interactions Found</div>
                                        <div className="opacity-80 leading-relaxed">
                                            Good news! We couldn't find any known interactions between the medicines you selected based on our database.
                                            <br /><br />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Disclaimer: Always consult your doctor for professional advice.</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-800 mb-6 flex items-center gap-3">
                                        <AlertTriangle className="text-red-600" />
                                        <span className="font-bold">Caution: {interactions.length} interaction{interactions.length > 1 ? 's' : ''} found.</span>
                                    </div>

                                    {interactions.map((interaction, idx) => (
                                        <div key={idx} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                                            <div className="shrink-0">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${interaction.severity === 'Severe' ? 'bg-red-50 text-red-500' :
                                                    interaction.severity === 'Moderate' ? 'bg-amber-50 text-amber-500' :
                                                        'bg-blue-50 text-blue-500'
                                                    }`}>
                                                    <AlertTriangle size={32} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${interaction.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                                                        interaction.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {interaction.severity} Risk
                                                    </span>
                                                    <div className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{interaction.drugs[0]}</span>
                                                        <span className="text-slate-300">+</span>
                                                        <span className="font-bold text-slate-800">{interaction.drugs[1]}</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 mb-4 leading-relaxed">{interaction.description}</p>
                                                {interaction.management && (
                                                    <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700">
                                                        <strong className="text-slate-900">Recommendation:</strong> {interaction.management}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
