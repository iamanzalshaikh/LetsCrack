import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Search, Bell } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-8">
                    <h2 className="text-xl font-black tracking-tight text-blue-600">
                        LetsCrack <span className="text-slate-900">Admin</span>
                    </h2>
                </div>
                
                <nav className="flex-1 px-4 space-y-1.5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold transition-all">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-medium transition-all">
                        <Users className="w-5 h-5" /> Manage Students
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-medium transition-all">
                        <FileText className="w-5 h-5" /> Test Content
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-medium transition-all">
                        <Settings className="w-5 h-5" /> Settings
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search students, tests..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-8">
                        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-4 border-l border-slate-100 pl-8">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center font-bold text-blue-600">
                                {user?.firstName?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Area */}
                <section className="p-10 overflow-y-auto space-y-10">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                           <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
                            <p className="text-blue-100/80 text-xs font-black uppercase tracking-widest mb-2">Total Students</p>
                            <h3 className="text-4xl font-black">1,284</h3>
                            <div className="mt-6 flex items-center gap-2 text-blue-100 text-[11px] font-bold">
                                <div className="px-1.5 py-0.5 bg-white/20 rounded-md">+12%</div> from last month
                            </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Active Sessions</p>
                            <h3 className="text-4xl font-black">42</h3>
                            <div className="mt-6 flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                                8 currently speaking
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm relative overflow-hidden group text-slate-900">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Evaluations</p>
                            <h3 className="text-4xl font-black text-slate-900">8,902</h3>
                            <div className="mt-6 flex items-center gap-2 text-blue-600 text-[11px] font-bold italic underline">
                                98% AI accuracy rate
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Submissions (Awaiting Review)</h3>
                            <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All Submissions</button>
                        </div>
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <FileText className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium italic">No submissions awaiting manual review at this time.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
