import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { BookOpen, Trophy, Clock, Play, BarChart3, LogOut, ChevronRight } from 'lucide-react';

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-12 sticky top-0 z-50 shadow-sm shadow-slate-900/5">
                <div className="flex items-center gap-12">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                        LetsCrack <span className="text-blue-600">IELTS</span>
                    </h1>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" className="font-bold text-blue-600 border-b-2 border-blue-600 py-6 text-sm">Practice</a>
                        <a href="#" className="font-bold text-slate-400 hover:text-slate-900 transition-colors py-6 text-sm">Study Plan</a>
                        <a href="#" className="font-bold text-slate-400 hover:text-slate-900 transition-colors py-6 text-sm">Mock Tests</a>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600">1,420 XP</span>
                    </div>
                    <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                         <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center font-bold text-indigo-600 transition-all hover:bg-white hover:shadow-md cursor-pointer">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 space-y-12">
                {/* Greeting Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
                            Welcome back, <span className="text-blue-600">{user?.firstName}!</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-medium">Ready to hit your Band 8.0 target today?</p>
                    </div>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-black px-10 py-5 rounded-[24px] shadow-2xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-3">
                        Start Full Mock Test <Play className="w-5 h-5 fill-current" />
                    </button>
                </div>

                {/* Performance Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Tests Taken', val: '12', icon: BookOpen, color: 'blue' },
                        { label: 'Study Hours', val: '4.5h', icon: Clock, color: 'purple' },
                        { label: 'Avg Band', val: '9.5', icon: BarChart3, color: 'emerald' },
                        { label: 'Global Rank', val: 'Top 5%', icon: Trophy, color: 'amber' }
                    ].map((s) => (
                        <div key={s.label} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:translate-y-[-4px] duration-300">
                            <div className={`w-14 h-14 bg-${s.color}-50 rounded-2xl flex items-center justify-center`}>
                                <s.icon className={`w-7 h-7 text-${s.color}-600`} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                                <h4 className="text-2xl font-black text-slate-900 leading-tight">{s.val}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Action area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Recent Progress (Left Column) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                            <button className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">View All History</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="group bg-white p-6 rounded-[28px] border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900 transition-colors">
                                            8.5
                                        </div>
                                        <div>
                                            <h5 className="text-lg font-black text-slate-900">Speaking Mock Test #0{i}</h5>
                                            <p className="text-slate-400 text-sm font-medium">Completed on Feb {10 + i}, 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:block text-right">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Result</div>
                                            <div className="text-xs font-bold text-emerald-500">Graded by AI</div>
                                        </div>
                                        <button className="p-4 bg-slate-50 group-hover:bg-blue-600 rounded-[20px] transition-all text-slate-300 group-hover:text-white">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upsell / Side Column (Right) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/10 blur-[60px] rounded-full group-hover:scale-110 transition-transform duration-700" />
                            <h4 className="text-2xl font-black text-white mb-4 leading-tight">Master Speaking with AI Grading</h4>
                            <p className="text-blue-50/80 mb-8 font-medium text-sm leading-relaxed">Experience examiner-grade feedback on your voice responses in real-time.</p>
                            <button className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                Start Practice
                            </button>
                        </div>
                        
                        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
                            <h4 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Latest Study Tips</h4>
                            <ul className="space-y-5">
                                {[
                                    '5 common speaking mistakes',
                                    'Improving your writing flow',
                                    'Reading under time pressure'
                                ].map(tip => (
                                    <li key={tip} className="text-sm font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-3 group">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-blue-500 transition-colors" /> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
