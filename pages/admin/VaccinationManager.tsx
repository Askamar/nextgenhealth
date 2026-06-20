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
            days.push(<div key={`empty-${i}`} className="bg-light border-bottom border-end" style={{ height: '120px' }}></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayVaccines = filteredVaccines.filter(v => v.date === dateStr);
            
            days.push(
                <div key={day} className="bg-white border-bottom border-end p-2 hover-scale position-relative" style={{ height: '120px' }}>
                    <span className={`small fw-bold ${dayVaccines.length > 0 ? 'text-dark' : 'text-muted'}`}>{day}</span>
                    <div className="mt-1 d-flex flex-column gap-1 overflow-auto" style={{ height: '80px' }}>
                        {dayVaccines.map(v => (
                            <div key={v.id} style={{ fontSize: '10px' }} className={`px-2 py-1 rounded text-truncate fw-semibold ${
                                v.type === 'Viral' ? 'bg-primary-subtle text-primary' : 
                                v.type === 'Bacterial' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                            }`}>
                                {v.name}
                            </div>
                        ))}
                    </div>
                    {dayVaccines.length > 0 && (
                         <div className="position-absolute top-0 end-0 m-2 bg-danger rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                    )}
                </div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <div className="container-fluid py-3 d-flex flex-column gap-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <h1 className="fw-bold text-dark mb-1">Vaccination Calendar Management</h1>
                    <p className="text-muted mb-0">Manage vaccine schedules and view the calendar.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add New Vaccine
                </Button>
            </div>

            {/* Controls */}
            <div className="card border-0 premium-card p-3 bg-white">
                <div className="d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
                    <div className="btn-group bg-light p-1 rounded">
                        <button 
                            onClick={() => setView('table')}
                            className={`btn btn-sm py-2 px-3 fw-semibold rounded border-0 transition-all d-flex align-items-center gap-2 ${view === 'table' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`}
                        >
                            <List size={16} /> Table View
                        </button>
                        <button 
                            onClick={() => setView('calendar')}
                            className={`btn btn-sm py-2 px-3 fw-semibold rounded border-0 transition-all d-flex align-items-center gap-2 ${view === 'calendar' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`}
                        >
                            <Calendar size={16} /> Calendar View
                        </button>
                    </div>

                    <div className="d-flex gap-3 w-100 w-md-auto align-items-center">
                        <div className="position-relative flex-grow-1" style={{ minWidth: '240px' }}>
                             <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={18} />
                             <input 
                                type="text" 
                                placeholder="Search by vaccine name..." 
                                className="form-control form-control-premium ps-5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                        </div>
                        <select 
                            className="form-select form-control-premium w-auto"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Viral">Viral</option>
                            <option value="Bacterial">Bacterial</option>
                        </select>
                    </div>
                </div>
            </div>

            {view === 'calendar' && (
                <div className="card border-0 premium-card overflow-hidden bg-white">
                    <div className="p-3 d-flex align-items-center justify-content-between border-bottom bg-light">
                        <button onClick={prevMonth} className="btn btn-sm btn-light rounded-circle"><ChevronLeft size={18} /></button>
                        <h4 className="fw-bold mb-0 text-dark">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button onClick={nextMonth} className="btn btn-sm btn-light rounded-circle"><ChevronRight size={18} /></button>
                    </div>
                    <div className="text-center bg-light text-muted small py-2 border-bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="fw-bold">{day}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {renderCalendar()}
                    </div>
                </div>
            )}

            {view === 'table' && (
                <div className="card border-0 premium-card overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 small">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th className="p-3 ps-4">Vaccine Name</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Target Group</th>
                                    <th className="p-3">Scheduled Date</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3 pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVaccines.map(v => (
                                    <tr key={v.id}>
                                        <td className="p-3 ps-4 fw-bold text-dark">{v.name}</td>
                                        <td className="p-3">
                                            <Badge color={v.type === 'Viral' ? 'blue' : v.type === 'Bacterial' ? 'green' : 'gray'}>
                                                {v.type}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-muted">{v.ageGroup}</td>
                                        <td className="p-3 text-muted">{v.date}</td>
                                        <td className="p-3 text-muted">{v.stock} units</td>
                                        <td className="p-3 pe-4 text-end">
                                            <button onClick={() => handleDelete(v.id)} className="btn btn-sm btn-outline-danger border-0 rounded-circle" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVaccines.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-muted">No vaccines found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-3">
                                <h5 className="modal-title fw-bold text-dark">Add New Vaccine</h5>
                                <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)} aria-label="Close"></button>
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="modal-body p-4 d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label small fw-semibold text-muted mb-1">Vaccine Name</label>
                                        <input 
                                            className="form-control form-control-premium" 
                                            value={newName} 
                                            onChange={e => setNewName(e.target.value)} 
                                            required 
                                            placeholder="e.g. Polio Booster" 
                                        />
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Type</label>
                                            <select 
                                                className="form-select form-control-premium" 
                                                value={newType} 
                                                onChange={e => setNewType(e.target.value as any)}
                                            >
                                                <option value="Viral">Viral</option>
                                                <option value="Bacterial">Bacterial</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted mb-1">Target Group</label>
                                            <select 
                                                className="form-select form-control-premium" 
                                                value={newAge} 
                                                onChange={e => setNewAge(e.target.value as any)}
                                            >
                                                <option value="Child">Child</option>
                                                <option value="Adult">Adult</option>
                                                <option value="Senior">Senior</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label small fw-semibold text-muted mb-1">Schedule Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-premium" 
                                            value={newDate} 
                                            onChange={e => setNewDate(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-3 bg-light">
                                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                    <Button type="submit">Add Schedule</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};