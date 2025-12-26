import React, { useState, useEffect } from 'react';
import { getVaccinesAPI, addVaccineAPI, deleteVaccineAPI } from '../../services/api';
import { Vaccine } from '../../types';
import { Card, Button, Badge, PageHeader } from '../../components/Components';
import { Calendar, Search, Plus, ChevronLeft, ChevronRight, Trash2, List } from 'lucide-react';

export const VaccinationManager = () => {
    const [view, setView] = useState<'calendar' | 'table'>('calendar');
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'Viral' | 'Bacterial' | 'Other'>('Viral');
    const [newAge, setNewAge] = useState<'Child' | 'Adult' | 'Senior'>('Child');
    const [newDate, setNewDate] = useState('');

    useEffect(() => { loadVaccines(); }, []);
    const loadVaccines = async () => { const data = await getVaccinesAPI(); setVaccines(data); };
    const handleDelete = async (id: string) => { await deleteVaccineAPI(id); loadVaccines(); };
    const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); await addVaccineAPI({ name: newName, type: newType, ageGroup: newAge, date: newDate, batchNumber: 'V-123', stock: 100 }); setIsAddModalOpen(false); loadVaccines(); };
    
    // Calendar Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-gray-100"></div>);
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayVaccines = vaccines.filter(v => v.date === dateStr);
            days.push(<div key={day} className="h-32 bg-white border border-gray-100 p-2 hover:bg-slate-50 transition-colors relative group"><span className="text-sm font-semibold">{day}</span><div className="mt-1 space-y-1 overflow-y-auto h-24 no-scrollbar">{dayVaccines.map(v => (<div key={v.id} className="text-[10px] px-2 py-1 rounded truncate font-medium bg-blue-100 text-blue-700">{v.name}</div>))}</div></div>);
        }
        return days;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><h1 className="text-2xl font-bold text-slate-900">Vaccination Calendar</h1></div><Button onClick={() => setIsAddModalOpen(true)}><Plus size={18} /> Add Vaccine</Button></div>
            <Card className="p-4 flex gap-4"><button onClick={() => setView('table')} className="px-4 py-2 bg-slate-100 rounded">Table</button><button onClick={() => setView('calendar')} className="px-4 py-2 bg-slate-100 rounded">Calendar</button></Card>
            {view === 'calendar' && (
                <Card className="overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100"><button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><ChevronLeft /></button><h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2><button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><ChevronRight /></button></div>
                    <div className="grid grid-cols-7 text-center bg-slate-50 py-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium">{day}</div>)}</div>
                    <div className="grid grid-cols-7">{renderCalendar()}</div>
                </Card>
            )}
            {view === 'table' && (
                <Card className="overflow-hidden">
                    <table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{vaccines.map(v => <tr key={v.id}><td className="p-4">{v.name}</td><td className="p-4">{v.date}</td><td className="p-4 text-right"><button onClick={() => handleDelete(v.id)}><Trash2 size={16} /></button></td></tr>)}</tbody></table>
                </Card>
            )}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6"><h3 className="text-xl font-bold mb-4">Add Vaccine</h3><form onSubmit={handleAdd} className="space-y-4"><div><label className="block text-sm mb-1">Name</label><input className="w-full border rounded p-2" value={newName} onChange={e => setNewName(e.target.value)} required /></div><div><label className="block text-sm mb-1">Date</label><input type="date" className="w-full border rounded p-2" value={newDate} onChange={e => setNewDate(e.target.value)} required /></div><div className="flex gap-3 justify-end mt-6"><Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit">Add</Button></div></form></Card>
                </div>
            )}
        </div>
    );
};