import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Github, 
  Code2, 
  ExternalLink,
  Terminal,
  Award,
  BarChart3,
  Search,
  Sun,
  Moon,
  Trophy,
  MessageSquare
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import StatCard from '../components/StatCard';
import ExpandableStatCard from '../components/ExpandableStatCard';
import CodingProgressChart from '../components/CodingProgressChart';
import CodingHeatmap from '../components/CodingHeatmap';
import PracticeDashboard from '../components/PracticeDashboard';
import ProgressDashboard from '../components/ProgressDashboard';
import Logo from '../components/Logo';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, activityRes] = await Promise.all([
          authService.getProfile(),
          authService.getPlatformStats(),
          authService.getActivity()
        ]);
        setProfile(profileRes.data.user);
        setPlatformStats(statsRes);
        setActivities(activityRes.data.activities || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await authService.syncPlatforms();
      setProfile(res.data.user);
      const statsRes = await authService.getPlatformStats();
      setPlatformStats(statsRes);
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#0B0F14]' : 'bg-[#f8fafc]',
    sidebar: isDarkMode ? 'bg-[#0B0F14]' : 'bg-white',
    card: isDarkMode ? 'bg-[#111827]' : 'bg-white',
    header: isDarkMode ? 'bg-[#111827]/60' : 'bg-white/80',
    text: isDarkMode ? 'text-[#E5E7EB]' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-[#9CA3AF]' : 'text-slate-500',
    border: isDarkMode ? 'border-white/5' : 'border-slate-200',
    accent: 'text-[#3B82F6]',
    input: isDarkMode ? 'bg-[#111827] border-white/10' : 'bg-slate-50 border-slate-200',
    shadow: isDarkMode ? 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'shadow-sm',
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme.bg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`w-64 ${theme.sidebar} border-r ${theme.border} flex flex-col transition-all duration-300`}>
        <div className="p-6">
          <Logo isDarkMode={isDarkMode} />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Practice', icon: Code2 },
            { name: 'My Profile', icon: User },
            { name: 'Assessments', icon: BookOpen },
            { name: 'Placement Status', icon: Briefcase },
            { name: 'Progress', icon: TrendingUp },
            { name: 'Settings', icon: Settings },
            { name: 'AI Assistant', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => item.name === 'AI Assistant' ? navigate('/ai-assistant') : setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.name 
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-l-[3px] border-[#3B82F6] rounded-none' 
                  : `${theme.textMuted} hover:bg-white/5 hover:${theme.text}`
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.name ? 2.5 : 2} className={`transition-colors duration-200 ${activeTab === item.name ? 'text-[#3B82F6]' : 'text-[#9CA3AF] group-hover:text-white'}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className={`m-4 flex items-center gap-3 px-4 py-3 ${theme.textMuted} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200 mt-auto`}
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-20 ${theme.header} backdrop-blur-xl border-b ${theme.border} px-8 flex items-center justify-between sticky top-0 z-10 transition-all duration-300`}>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome back, {profile?.name}</h1>
            <p className={`${theme.textMuted} text-sm`}>{profile?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Sync Button */}
            <button 
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${theme.border} ${theme.sidebar} ${theme.textMuted} hover:${theme.text} hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95 ${syncing ? 'opacity-50' : ''}`}
            >
              <TrendingUp size={18} className={syncing ? 'animate-bounce' : ''} />
              <span className="text-sm font-medium">{syncing ? 'Syncing...' : 'Refresh Stats'}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border ${theme.border} ${theme.sidebar} ${theme.textMuted} hover:${theme.text} hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95`}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-primary-600" />}
            </button>

            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} border ${theme.border}`}>
              <span className={`w-2 h-2 rounded-full ${profile?.placementStatus === 'Placed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              <span className="text-sm font-medium">{profile?.placementStatus || 'Not Placed'}</span>
            </div>
            <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} border-2 ${isDarkMode ? 'border-white/10' : 'border-white'} flex items-center justify-center shadow-sm overflow-hidden`}>
               {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
               ) : (
                <span className="text-lg font-bold text-[#3B82F6]">{profile?.name?.charAt(0)}</span>
               )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="CGPA" 
                  value={profile?.cgpa || '0.0'} 
                  icon={Award} 
                  color="text-amber-500" 
                  bgColor="bg-amber-500/10" 
                />
                
                <ExpandableStatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="LeetCode Solved" 
                  value={platformStats?.leetcode?.totalSolved || '0'} 
                  icon={Code2} 
                  color="text-orange-500" 
                  bgColor="bg-orange-500/10"
                  profileUrl={profile?.leetcodeUsername ? `https://leetcode.com/u/${profile.leetcodeUsername}/` : null}
                  stats={{
                    easy: platformStats?.leetcode?.easySolved || 0,
                    medium: platformStats?.leetcode?.mediumSolved || 0,
                    hard: platformStats?.leetcode?.hardSolved || 0,
                    rating: platformStats?.leetcode?.contestRating || 0,
                    ranking: platformStats?.leetcode?.ranking || 0,
                    streak: platformStats?.leetcode?.streak || 0
                  }}
                />

                <ExpandableStatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="GitHub" 
                  value={platformStats?.github?.repos || '0'} 
                  icon={Github} 
                  color="text-slate-600 dark:text-slate-300" 
                  bgColor="bg-slate-500/10"
                  profileUrl={profile?.githubUsername ? `https://github.com/${profile.githubUsername}` : null}
                  stats={{
                    repos: platformStats?.github?.repos || 0,
                    followers: platformStats?.github?.followers || 0,
                    following: platformStats?.github?.following || 0,
                    contributions: platformStats?.github?.contributions || 0,
                    language: platformStats?.github?.language || 'N/A'
                  }}
                />

                <ExpandableStatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="Codeforces" 
                  value={platformStats?.codeforces?.rating || '0'} 
                  icon={BarChart3} 
                  color="text-indigo-600" 
                  bgColor="bg-indigo-600/10"
                  profileUrl={profile?.codeforcesHandle ? `https://codeforces.com/profile/${profile.codeforcesHandle}` : null}
                  stats={{
                    rating: platformStats?.codeforces?.rating || 0,
                    maxRating: platformStats?.codeforces?.maxRating || 0,
                    rank: platformStats?.codeforces?.rank || 'N/A',
                    maxRank: platformStats?.codeforces?.maxRank || 'N/A',
                    contests: platformStats?.codeforces?.contests || 0,
                    contribution: platformStats?.codeforces?.contribution || 0
                  }}
                />

                <ExpandableStatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="CodeChef" 
                  value={platformStats?.codechef?.rating || '0'} 
                  icon={Trophy} 
                  color="text-amber-600" 
                  bgColor="bg-amber-600/10"
                  profileUrl={profile?.codechefUsername ? `https://www.codechef.com/users/${profile.codechefUsername}` : null}
                  stats={{
                    rating: platformStats?.codechef?.rating || 0,
                    stars: platformStats?.codechef?.stars || '1★',
                    globalRank: platformStats?.codechef?.globalRank || 0
                  }}
                />

                <ExpandableStatCard 
                  theme={theme} 
                  isDarkMode={isDarkMode} 
                  title="GeeksforGeeks" 
                  value={platformStats?.geeksforgeeks?.problemsSolved || '0'} 
                  icon={BookOpen} 
                  color="text-green-600" 
                  bgColor="bg-green-600/10"
                  profileUrl={profile?.geeksforgeeksUsername ? `https://auth.geeksforgeeks.org/user/${profile.geeksforgeeksUsername}` : null}
                  stats={{
                    problemsSolved: platformStats?.geeksforgeeks?.problemsSolved || 0,
                    score: platformStats?.geeksforgeeks?.score || 0,
                    institutionRank: platformStats?.geeksforgeeks?.institutionRank || 0
                  }}
                />
              </div>
            </div>
          )}
          {activeTab === 'My Profile' && (
            <ProfileSection 
              theme={theme} 
              isDarkMode={isDarkMode} 
              profile={profile} 
              setProfile={setProfile} 
            />
          )}
          {activeTab === 'Practice' && (
             <PracticeDashboard theme={theme} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Progress' && (
             <ProgressDashboard activities={activities} theme={theme} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Placement Status' && (
             <StudentPlacementTracking theme={theme} isDarkMode={isDarkMode} />
          )}

          {['Assessments', 'Settings'].includes(activeTab) && (
            <div className={`flex flex-col items-center justify-center h-full ${theme.textMuted}`}>
              <div className={`p-8 ${isDarkMode ? 'bg-slate-800/20' : 'bg-slate-100'} rounded-full mb-4`}>
                <Search size={48} />
              </div>
              <p className="text-xl font-medium">{activeTab} section coming soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProfileSection = ({ profile, setProfile, theme, isDarkMode }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    college: profile?.college || '',
    city: profile?.city || '',
    year: profile?.year || 1,
    cgpa: profile?.cgpa || 0,
    leetcodeUsername: profile?.leetcodeUsername || '',
    githubUsername: profile?.githubUsername || '',
    codeforcesHandle: profile?.codeforcesHandle || '',
    codechefUsername: profile?.codechefUsername || '',
    geeksforgeeksUsername: profile?.geeksforgeeksUsername || ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        college: profile.college || '',
        city: profile.city || '',
        year: profile.year || 1,
        cgpa: profile.cgpa || 0,
        leetcodeUsername: profile.leetcodeUsername || '',
        githubUsername: profile.githubUsername || '',
        codeforcesHandle: profile.codeforcesHandle || '',
        codechefUsername: profile.codechefUsername || '',
        geeksforgeeksUsername: profile.geeksforgeeksUsername || ''
      });
    }
  }, [profile, editing]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (formData.cgpa < 0 || formData.cgpa > 10) newErrors.cgpa = 'CGPA must be between 0 and 10';
    if (formData.year < 1 || formData.year > 4) newErrors.year = 'Year must be between 1 and 4';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.updateProfile(formData);
      setProfile(res.data.user);
      setEditing(false);
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`${theme.card} rounded-2xl p-8 border ${theme.border} shadow-sm transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
            <User className="text-primary-600" size={24} /> User Details
          </h3>
          <button 
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-xl border ${theme.border} ${theme.textMuted} hover:${theme.text} transition-all font-medium text-sm`}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ProfileField 
            label="Full Name" 
            name="name" 
            value={formData.name} 
            editing={editing} 
            onChange={(v) => setFormData({...formData, name: v})} 
            theme={theme} 
            isDarkMode={isDarkMode}
            error={errors.name}
          />
          <ProfileField 
            label="Email" 
            name="email" 
            value={formData.email} 
            editing={false} // Email typically not editable
            theme={theme} 
            isDarkMode={isDarkMode}
          />
          <ProfileField 
            label="College" 
            name="college" 
            value={formData.college} 
            editing={editing} 
            onChange={(v) => setFormData({...formData, college: v})} 
            theme={theme} 
            isDarkMode={isDarkMode}
          />
          <ProfileField 
            label="City" 
            name="city" 
            value={formData.city} 
            editing={editing} 
            onChange={(v) => setFormData({...formData, city: v})} 
            theme={theme} 
            isDarkMode={isDarkMode}
          />
          <ProfileField 
            label="Year" 
            name="year" 
            value={formData.year} 
            type="number"
            editing={editing} 
            onChange={(v) => setFormData({...formData, year: parseInt(v)})} 
            theme={theme} 
            isDarkMode={isDarkMode}
            error={errors.year}
          />
          <ProfileField 
            label="CGPA" 
            name="cgpa" 
            value={formData.cgpa} 
            type="number"
            step="0.1"
            editing={editing} 
            onChange={(v) => setFormData({...formData, cgpa: parseFloat(v)})} 
            theme={theme} 
            isDarkMode={isDarkMode}
            error={errors.cgpa}
          />
        </div>
      </div>

      <div className={`${theme.card} rounded-2xl p-8 border ${theme.border} shadow-sm transition-colors duration-300`}>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-8 flex items-center gap-2`}>
          <Terminal className="text-primary-600" size={24} /> Platform Usernames
        </h3>
        <div className="space-y-4">
          <PlatformItem 
            theme={theme}
            isDarkMode={isDarkMode}
            icon={Code2} 
            name="LeetCode" 
            username={formData.leetcodeUsername} 
            url={`https://leetcode.com/${formData.leetcodeUsername}`}
            editing={editing}
            onChange={(v) => setFormData({...formData, leetcodeUsername: v})}
            placeholder="username"
          />
          <PlatformItem 
            theme={theme}
            isDarkMode={isDarkMode}
            icon={TrendingUp} 
            name="Codeforces" 
            username={formData.codeforcesHandle} 
            url={`https://codeforces.com/profile/${formData.codeforcesHandle}`}
            editing={editing}
            onChange={(v) => setFormData({...formData, codeforcesHandle: v})}
            placeholder="handle"
          />
          <PlatformItem 
            theme={theme}
            isDarkMode={isDarkMode}
            icon={Github} 
            name="GitHub" 
            username={formData.githubUsername} 
            url={`https://github.com/${formData.githubUsername}`}
            editing={editing}
            onChange={(v) => setFormData({...formData, githubUsername: v})}
            placeholder="username"
          />
          <PlatformItem 
            theme={theme}
            isDarkMode={isDarkMode}
            icon={Trophy} 
            name="CodeChef" 
            username={formData.codechefUsername} 
            url={`https://www.codechef.com/users/${formData.codechefUsername}`}
            editing={editing}
            onChange={(v) => setFormData({...formData, codechefUsername: v})}
            placeholder="username"
          />
          <PlatformItem 
            theme={theme}
            isDarkMode={isDarkMode}
            icon={BookOpen} 
            name="GeeksforGeeks" 
            username={formData.geeksforgeeksUsername} 
            url={`https://auth.geeksforgeeks.org/user/${formData.geeksforgeeksUsername}`}
            editing={editing}
            onChange={(v) => setFormData({...formData, geeksforgeeksUsername: v})}
            placeholder="username"
          />
        </div>

        {editing && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-8 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        )}
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, editing, onChange, type = "text", step, theme, isDarkMode, error }) => (
  <div className="space-y-1.5">
    <label className={`${theme.textMuted} text-xs font-semibold uppercase tracking-wider`}>{label}</label>
    {editing ? (
      <div className="space-y-1">
        <input 
          type={type} 
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${theme.input} rounded-lg px-4 py-2.5 ${isDarkMode ? 'text-white' : 'text-slate-900'} focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all border ${error ? 'border-red-500' : theme.border}`}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    ) : (
      <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium text-lg px-4 py-2 bg-transparent border-transparent border`}>
        {value || 'Not provided'}
      </p>
    )}
  </div>
);

const PlatformItem = ({ icon: Icon, name, username, url, editing, onChange, placeholder, theme, isDarkMode }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50'} border ${theme.border}`}>
    <div className="flex items-center gap-4 flex-1">
      <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm'} flex items-center justify-center text-primary-600`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className={`text-xs ${theme.textMuted} font-medium`}>{name}</p>
        {editing ? (
          <input 
            type="text" 
            value={username}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-transparent border-none text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} focus:outline-none p-0 h-auto w-full`}
          />
        ) : (
          <div className="flex items-center gap-1">
            {username ? (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`text-base font-semibold ${isDarkMode ? 'text-white hover:text-[#3B82F6]' : 'text-slate-900 hover:text-[#3B82F6]'} transition-colors flex items-center gap-1`}
              >
                {username}
                <ExternalLink size={14} className={theme.textMuted} />
              </a>
            ) : (
              <p className={`text-base font-semibold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Not Connected
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  </div>
);

const StudentPlacementTracking = ({ theme, isDarkMode }) => {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getPlacements()
            .then(res => setPlacements(res.data.placements))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-8 text-blue-500"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Placement Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {placements.map(p => (
                    <div key={p._id} className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-sm group hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full mix-blend-screen opacity-10 blur-2xl ${p.status === 'Selected' ? 'bg-green-500' : p.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{p.company?.name || 'Company'}</h3>
                        <p className="text-blue-500 font-medium mb-4 text-sm">{p.company?.role || 'Role'}</p>
                        
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between"><span className={theme.textMuted}>Package</span><span className={`font-semibold ${theme.text}`}>{p.company?.package}</span></div>
                            <div className="flex justify-between"><span className={theme.textMuted}>Eligibility</span><span className={`font-semibold ${theme.text}`}>{p.company?.eligibility}</span></div>
                        </div>

                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                            <span className={theme.textMuted}>Current Status:</span>
                            <span className={`font-bold px-3 py-1 rounded-full ${
                                p.status === 'Selected' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                p.status === 'Rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>{p.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            {placements.length === 0 && (
                <div className={`${theme.card} text-center p-12 text-slate-500 border ${theme.border} rounded-2xl shadow-sm`}>
                    <p>No placements tracked yet.</p>
                    <p className="text-sm mt-2 opacity-70">Company applications will appear here once recorded by the admin.</p>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
