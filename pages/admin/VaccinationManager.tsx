import React, { useState, useEffect } from 'react';
import { getVaccinesAPI, addVaccineAPI, deleteVaccineAPI } from '../../services/api';
import { Vaccine } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Calendar, Search, Filter, Plus, ChevronLeft, ChevronRight, Trash2, List } from 'lucide-react';

export const VaccinationManager = () => {
    const [view, setView] = useState<'calendar' | 'table'>('calendar');
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // Default to Oct 2023 for demo
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'Viral' | 'Bacterial' | 'Other'>('Viral');
    const [newAge, setNewAge] = useState<'Child' | 'Adult' | 'Senior'>('Child');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        loadVaccines();
    }, []);

    const loadVaccines = async () => {
        const data = await getVaccinesAPI();
        setVaccines(data);
    };

    const handleDelete = async (id: string) => {
        await deleteVaccineAPI(id);
        loadVaccines();
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addVaccineAPI({
            name: newName,
            type: newType,
            ageGroup: newAge,
            date: newDate,
            batchNumber: `V-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            stock: 100
        });
        setIsAddModalOpen(false);
        loadVaccines();
        setNewName('');
        setNewDate('');
    };

    const filteredVaccines = vaccines.filter(v => {
        const matchesType = filterType === 'All' || v.type === filterType;
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Calendar Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-gray-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayVaccines = filteredVaccines.filter(v => v.date === dateStr);
            
            days.push(
                <div key={day} className="h-32 bg-white border border-gray-100 p-2 hover:bg-slate-50 transition-colors relative group">
                    <span className={`text-sm font-semibold ${dayVaccines.length > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto h-24 no-scrollbar">
                        {dayVaccines.map(v => (
                            <div key={v.id} className={`text-[10px] px-2 py-1 rounded truncate font-medium ${
                                v.type === 'Viral' ? 'bg-blue-100 text-blue-700' : 
                                v.type === 'Bacterial' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                                {v.name}
                            </div>
                        ))}
                    </div>
                    {dayVaccines.length > 0 && (
                         <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></div>
                    )}
                </div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vaccination Calendar Management</h1>
                    <p className="text-slate-500">Manage vaccine schedules and view the calendar.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add New Vaccine
                </Button>
            </div>

            {/* Controls */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('table')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        <List size={16} /> Table View
                    </button>
                    <button 
                        onClick={() => setView('calendar')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                        <Calendar size={16} /> Calendar View
                    </button>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input 
                            type="text" 
                            placeholder="Search by vaccine name..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:bg-white transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                    </div>
                    <select 
                        className="p-2 border rounded-lg bg-slate-50 text-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Viral">Viral</option>
                        <option value="Bacterial">Bacterial</option>
                    </select>
                </div>
            </Card>

            {view === 'calendar' && (
                <Card className="overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>
                        <h2 className="text-xl font-bold text-slate-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center bg-slate-50 text-slate-500 text-sm py-2 border-b border-gray-100">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="font-medium">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {renderCalendar()}
                    </div>
                </Card>
            )}

            {view === 'table' && (
                <Card className="overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-gray-100">
                            <tr>
                                <th className="p-4">Vaccine Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Target Group</th>
                                <th className="p-4">Scheduled Date</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVaccines.map(v => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{v.name}</td>
                                    <td className="p-4">
                                        <Badge color={v.type === 'Viral' ? 'blue' : v.type === 'Bacterial' ? 'green' : 'gray'}>
                                            {v.type}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-slate-600">{v.ageGroup}</td>
                                    <td className="p-4 text-slate-600">{v.date}</td>
                                    <td className="p-4 text-slate-600">{v.stock} units</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredVaccines.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No vaccines found matching your criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Add New Vaccine</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Vaccine Name</label>
                                <input className="w-full border rounded p-2" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Polio Booster" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select className="w-full border rounded p-2" value={newType} onChange={e => setNewType(e.target.value as any)}>
                                        <option value="Viral">Viral</option>
                                        <option value="Bacterial">Bacterial</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Target Group</label>
                                    <select className="w-full border rounded p-2" value={newAge} onChange={e => setNewAge(e.target.value as any)}>
                                        <option value="Child">Child</option>
                                        <option value="Adult">Adult</option>
                                        <option value="Senior">Senior</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Schedule Date</label>
                                <input type="date" className="w-full border rounded p-2" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Add Schedule</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};