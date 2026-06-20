import React from 'react';
import {
    Users, Calendar, Stethoscope, TrendingUp, TrendingDown,
    Activity, Clock, CheckCircle, XCircle, AlertCircle,
    DollarSign, FileText, Pill, UserCheck
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard = ({ title, value, change, icon, color }: StatCardProps) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(change)}%
                </div>
            )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
    </div>
);

interface ChartBarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
}

const ChartBar = ({ label, value, maxValue, color }: ChartBarProps) => (
    <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000 flex items-center justify-end pr-3`}
                style={{ width: `${(value / maxValue) * 100}%` }}
            >
                <span className="text-xs font-bold text-white">{value}</span>
            </div>
        </div>
    </div>
);

export const AdminAnalytics = () => {
    // Mock data - in real app, fetch from API
    const stats = {
        totalPatients: 15420,
        totalDoctors: 156,
        appointmentsToday: 248,
        revenue: 125000,
        pendingAppointments: 45,
        completedToday: 203,
        cancelledToday: 12,
        newPatientsThisMonth: 342
    };

    const weeklyAppointments = [
        { day: 'Mon', count: 45 },
        { day: 'Tue', count: 52 },
        { day: 'Wed', count: 48 },
        { day: 'Thu', count: 61 },
        { day: 'Fri', count: 55 },
        { day: 'Sat', count: 38 },
        { day: 'Sun', count: 22 }
    ];

    const departmentStats = [
        { name: 'Cardiology', patients: 342, color: 'bg-red-500' },
        { name: 'Orthopedics', patients: 289, color: 'bg-blue-500' },
        { name: 'Neurology', patients: 256, color: 'bg-purple-500' },
        { name: 'Pediatrics', patients: 198, color: 'bg-green-500' },
        { name: 'Dermatology', patients: 167, color: 'bg-amber-500' }
    ];

    const recentActivity = [
        { type: 'appointment', message: 'New appointment booked by John Doe', time: '2 mins ago', icon: Calendar },
        { type: 'patient', message: 'New patient registered: Sarah Smith', time: '15 mins ago', icon: UserCheck },
        { type: 'prescription', message: 'Dr. Wilson issued prescription #1234', time: '32 mins ago', icon: FileText },
        { type: 'drug', message: 'Drug interaction alert: Aspirin + Warfarin', time: '1 hour ago', icon: Pill }
    ];

    const maxAppointments = Math.max(...weeklyAppointments.map(d => d.count));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Welcome back! Here's what's happening at NextGen Health today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients.toLocaleString()}
                        change={12}
                        icon={<Users size={24} className="text-white" />}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Active Doctors"
                        value={stats.totalDoctors}
                        change={5}
                        icon={<Stethoscope size={24} className="text-white" />}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    />
                    <StatCard
                        title="Today's Appointments"
                        value={stats.appointmentsToday}
                        change={-3}
                        icon={<Calendar size={24} className="text-white" />}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={`₹${(stats.revenue / 1000).toFixed(0)}K`}
                        change={18}
                        icon={<DollarSign size={24} className="text-white" />}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Weekly Appointments Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" />
                            Weekly Appointments
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {weeklyAppointments.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500"
                                        style={{ height: `${(day.count / maxAppointments) * 100}%` }}
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Stethoscope size={20} className="text-purple-500" />
                            Patients by Department
                        </h3>
                        <div className="space-y-4">
                            {departmentStats.map((dept, idx) => (
                                <ChartBar
                                    key={idx}
                                    label={dept.name}
                                    value={dept.patients}
                                    maxValue={400}
                                    color={dept.color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Appointment Status */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                            Today's Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-amber-500" />
                                    <span className="text-slate-700 dark:text-slate-300">Pending</span>
                                </div>
                                <span className="text-2xl font-bold text-amber-600">{stats.pendingAppointments}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span className="text-slate-700 dark:text-slate-300">Completed</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{stats.completedToday}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <XCircle size={20} className="text-red-500" />
                                    <span className="text-slate-700 dark:text-slate-300">Cancelled</span>
                                </div>
                                <span className="text-2xl font-bold text-red-600">{stats.cancelledToday}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-blue-500" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <activity.icon size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-700 dark:text-slate-300">{activity.message}</p>
                                        <p className="text-slate-400 text-sm mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
