import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Award, BarChart3, LogOut, CheckCircle, Search, Edit2, Plus, Trash2 } from 'lucide-react';
import adminService from '../services/adminService';
import authService from '../services/authService';
import Logo from '../components/Logo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isDarkMode] = useState(true);
    const theme = {
        bg: 'bg-[#0B0F14]',
        sidebar: 'bg-[#111827]',
        card: 'bg-[#1e293b]',
        border: 'border-[#1e293b]',
        text: 'text-white',
        textMuted: 'text-[#9ca3af]'
    };

    // Protect route on frontend
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/student-dashboard'); // kick back if not admin
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Companies', path: '/admin/companies', icon: Briefcase },
        { name: 'Placements', path: '/admin/placements', icon: Award },
    ];

    return (
        <div className={`flex min-h-screen ${theme.bg} ${theme.text} font-sans`}>
            {/* Sidebar */}
            <aside className={`w-64 shrink-0 ${theme.sidebar} border-r border-white/5 flex flex-col`}>
                <div className="p-6 pb-2 border-b border-white/5">
                    <Logo isDarkMode={isDarkMode} />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 block">Admin Portal</span>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-6">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-blue-500/15 text-blue-500 border-l-[3px] border-blue-500 rounded-none' 
                                    : `${theme.textMuted} hover:bg-white/5 hover:text-white`
                                }`}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'} />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>
                <button onClick={handleLogout} className={`m-4 flex items-center gap-3 px-4 py-3 ${theme.textMuted} hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 mt-auto`}>
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto w-full custom-scrollbar">
                <div className="p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<DashboardView theme={theme} />} />
                        <Route path="/students" element={<StudentsView theme={theme} />} />
                        <Route path="/companies" element={<CompaniesView theme={theme} />} />
                        <Route path="/placements" element={<PlacementsView theme={theme} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

// --- SUB VIEWS ---

const DashboardView = ({ theme }) => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        adminService.getAnalytics().then(res => setAnalytics(res.data)).catch(console.error);
    }, []);

    if (!analytics) return <div className="text-center p-8 text-blue-500"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: analytics.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Placed Students', value: analytics.placedStudents, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Not Placed', value: analytics.notPlacedStudents, icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Placement Rate', value: `${analytics.placementRate}%`, icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                ].map(s => (
                    <div key={s.label} className={`${theme.card} p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm`}>
                        <div className={`p-4 rounded-xl ${s.bg} ${s.color}`}>
                            <s.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">{s.label}</p>
                            <p className="text-2xl font-bold">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`${theme.card} p-6 rounded-2xl border border-white/5 mt-8`}>
                <h3 className="text-lg font-bold mb-4">Students Placed Per Company</h3>
                <div className="w-full h-72">
                    {analytics.chartData && analytics.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="placed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">No placement data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentsView = ({ theme }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        adminService.getStudents().then(res => setStudents(res.data.students)).catch(console.error);
    }, []);

    const filtered = students.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Students</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="bg-[#111827] border border-white/10 text-white rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={`${theme.card} rounded-2xl border border-white/5 overflow-hidden shadow-sm`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#111827] border-b border-white/5">
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Name</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Email</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">CGPA</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Status</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">{s.name}</td>
                                <td className="p-4 text-sm text-slate-300">{s.email}</td>
                                <td className="p-4 text-sm">{s.cgpa}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'Placed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-8 text-center text-slate-500">No students found</div>}
            </div>
        </div>
    );
};

const CompaniesView = ({ theme }) => {
    const [companies, setCompanies] = useState([]);
    const [formObj, setFormObj] = useState({ name: '', role: '', package: '', eligibility: '' });
    
    const loadData = () => adminService.getCompanies().then(res => setCompanies(res.data.companies)).catch(console.error);
    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminService.createCompany(formObj);
            setFormObj({ name: '', role: '', package: '', eligibility: '' });
            loadData();
        } catch (err) { console.error(err); }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Delete this company?')) {
            await adminService.deleteCompany(id);
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-6">Manage Companies</h2>
            
            <div className={`${theme.card} p-5 rounded-2xl border border-white/5 mb-8`}>
                <h3 className="font-semibold mb-4 text-sm uppercase text-slate-400">Add New Company</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input required type="text" placeholder="Company Name" className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={formObj.name} onChange={e=>setFormObj({...formObj, name: e.target.value})} />
                    <input required type="text" placeholder="Role (e.g. SDE)" className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={formObj.role} onChange={e=>setFormObj({...formObj, role: e.target.value})} />
                    <input required type="text" placeholder="Package (LPA)" className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={formObj.package} onChange={e=>setFormObj({...formObj, package: e.target.value})} />
                    <input required type="text" placeholder="Eligibility (e.g. 8+ CGPA)" className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={formObj.eligibility} onChange={e=>setFormObj({...formObj, eligibility: e.target.value})} />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-medium flex items-center justify-center gap-2 text-sm transition-colors"><Plus size={16}/> Add</button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {companies.map(c => (
                    <div key={c._id} className={`${theme.card} p-5 rounded-2xl border border-white/5 shadow-sm relative group`}>
                        <button onClick={() => handleDelete(c._id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                        <h4 className="text-xl font-bold text-white mb-1">{c.name}</h4>
                        <p className="text-blue-400 font-medium text-sm mb-4">{c.role}</p>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between border-b border-white/5 pb-1"><span>Package</span><span className="font-semibold text-white">{c.package}</span></div>
                            <div className="flex justify-between pb-1"><span>Eligibility</span><span className="font-semibold text-white">{c.eligibility}</span></div>
                        </div>
                    </div>
                ))}
                {companies.length === 0 && <div className="col-span-3 text-center p-8 text-slate-500">No companies added yet.</div>}
            </div>
        </div>
    );
};

const PlacementsView = ({ theme }) => {
    const [placements, setPlacements] = useState([]);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [formObj, setFormObj] = useState({ student: '', company: '', status: 'Applied' });

    const loadData = async () => {
        try {
            const [pRes, sRes, cRes] = await Promise.all([adminService.getPlacements(), adminService.getStudents(), adminService.getCompanies()]);
            setPlacements(pRes.data.placements);
            setStudents(sRes.data.students);
            setCompanies(cRes.data.companies);
        } catch (e) { console.error(e); }
    };
    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminService.createPlacement(formObj);
            loadData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await adminService.updatePlacement(id, { status: newStatus });
            loadData();
        } catch (e) { console.error(e); }
    }

    const rounds = ['Applied', 'Round 1 Cleared', 'Round 2 Cleared', 'Round 3 Cleared', 'Selected', 'Rejected'];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-6">Placement Tracking</h2>

            <div className={`${theme.card} p-5 rounded-2xl border border-white/5 mb-8`}>
                <h3 className="font-semibold mb-4 text-sm uppercase text-slate-400">Assign Student to Company</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select required className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" value={formObj.student} onChange={e=>setFormObj({...formObj, student: e.target.value})}>
                        <option value="">Select Student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                    </select>
                    <select required className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" value={formObj.company} onChange={e=>setFormObj({...formObj, company: e.target.value})}>
                        <option value="">Select Company...</option>
                        {companies.map(c => <option key={c._id} value={c._id}>{c.name} - {c.role}</option>)}
                    </select>
                    <select className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" value={formObj.status} onChange={e=>setFormObj({...formObj, status: e.target.value})}>
                        {rounds.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-medium flex items-center justify-center gap-2 text-sm transition-colors"><Plus size={16}/> Assign</button>
                </form>
            </div>

            <div className={`${theme.card} rounded-2xl border border-white/5 overflow-hidden shadow-sm`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#111827] border-b border-white/5">
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Student</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Company</th>
                            <th className="p-4 text-xs tracking-wider text-slate-400 uppercase font-semibold">Current Round</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {placements.map(p => (
                            <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">{p.student?.name}</td>
                                <td className="p-4 text-sm text-slate-300">{p.company?.name} ({p.company?.role})</td>
                                <td className="p-4">
                                    <select 
                                        className={`bg-[#111827] border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 ${
                                            p.status === 'Selected' ? 'text-green-400 border-green-500/30' : 
                                            p.status === 'Rejected' ? 'text-red-400 border-red-500/30' : 'text-blue-400'
                                        }`}
                                        value={p.status}
                                        onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                                    >
                                        {rounds.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {placements.length === 0 && <div className="p-8 text-center text-slate-500">No placements assigned yet</div>}
            </div>
        </div>
    );
};

export default AdminDashboard;
