import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  getUsers, 
  getPendingUsers, 
  verifyUser, 
  rejectUser, 
  updateProgress,
  getPendingAppeals,
  approveAppeal
} from '../utils/api';
import { 
  LogOut, 
  Settings, 
  Users, 
  UserCheck, 
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface User {
  username: string;
  name: string;
  profilePicture?: string;
  attendance: { present: number; total: number };
  understanding: number[];
  comment?: string;
}

const understandingLevels = [
  { label: 'সামান্য', value: 1 },
  { label: 'একটু ভালো', value: 2 },
  { label: 'মোটামুটি ভালোই', value: 3 },
  { label: 'যথেষ্ট ভালো', value: 4 },
  { label: 'তুলনামূলক উন্নত', value: 5 },
  { label: 'অনেকটা উন্নত', value: 6 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'appeals'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingAppeals, setPendingAppeals] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editAttendance, setEditAttendance] = useState({ present: 0, total: 0 });
  const [editUnderstanding, setEditUnderstanding] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    if (!user || isAdmin !== 'true') {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes, appealsRes] = await Promise.all([
        getUsers(),
        getPendingUsers(),
        getPendingAppeals()
      ]);
      
      if (usersRes.success) {
        const usersWithScores = usersRes.users.map((u: User) => ({
          ...u,
          score: calculateScore(u)
        }));
        usersWithScores.sort((a: any, b: any) => b.score - a.score);
        setUsers(usersWithScores);
      }
      
      if (pendingRes.success) {
        setPendingUsers(pendingRes.users);
      }
      
      if (appealsRes.success) {
        setPendingAppeals(appealsRes.appeals);
      }
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (user: User) => {
    const attendanceScore = user.attendance.total > 0 
      ? (user.attendance.present / user.attendance.total) * 100 
      : 0;
    const understandingScore = user.understanding.reduce((sum, val) => sum + val, 0);
    return attendanceScore + understandingScore;
  };

  const getAttendancePercentage = (user: User) => {
    if (user.attendance.total === 0) return 0;
    return Math.round((user.attendance.present / user.attendance.total) * 100);
  };

  const getUnderstandingProgress = (user: User) => {
    return user.understanding.reduce((sum, val) => sum + val, 0);
  };

  const handleVerify = async (username: string) => {
    try {
      const result = await verifyUser(username);
      if (result.success) {
        await loadData();
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleReject = async (username: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ইউজারকে প্রত্যাখ্যান করতে চান?')) {
      try {
        const result = await rejectUser(username);
        if (result.success) {
          await loadData();
        }
      } catch (err) {
        console.error('Reject error:', err);
      }
    }
  };

  const handleApproveAppeal = async (username: string) => {
    try {
      const result = await approveAppeal(username);
      if (result.success) {
        await loadData();
        alert('আবেদন অনুমোদন করা হয়েছে');
      }
    } catch (err) {
      console.error('Approve appeal error:', err);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditAttendance(user.attendance);
    setEditUnderstanding(0);
    setEditComment(user.comment || '');
  };

  const handleSaveProgress = async () => {
    if (!editingUser) return;

    try {
      const newUnderstanding = editUnderstanding > 0 
        ? [...editingUser.understanding, editUnderstanding]
        : editingUser.understanding;

      const result = await updateProgress(editingUser.username, {
        attendance: editAttendance,
        understanding: newUnderstanding,
        comment: editComment
      });

      if (result.success) {
        setEditingUser(null);
        await loadData();
      }
    } catch (err) {
      console.error('Update progress error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const DefaultAvatar = () => (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অ্যাডমিন প্যানেল</h1>
            <p className="text-sm text-gray-600">{currentUser?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="সেটিংস"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'users' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            সদস্য তালিকা
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'pending' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            যাচাই অপেক্ষা
            {pendingUsers.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'appeals' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            আবেদন তালিকা
            {pendingAppeals.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingAppeals.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">সক্রিয় সদস্যদের তালিকা</h2>
            
            <div className="space-y-4">
              {users.map((user: any, index) => (
                <div
                  key={user.username}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <DefaultAvatar />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>

                    <button
                      onClick={() => openEditModal(user)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      আপডেট করুন
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">উপস্থিতি</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {getAttendancePercentage(user)}%
                      </div>
                      <p className="text-xs text-gray-600">
                        {user.attendance.present} / {user.attendance.total} দিন
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">বোঝাপড়া</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(getUnderstandingProgress(user) * 2, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {getUnderstandingProgress(user)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {user.understanding.length} মাসের রেকর্ড
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">মন্তব্য</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {user.comment || 'কোন মন্তব্য নেই'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">যাচাই অপেক্ষায় থাকা সদস্য</h2>
            
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">কোন যাচাই অপেক্ষায় থাকা সদস্য নেই</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.username} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          রেজিস্টার: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(user.username)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => handleReject(user.username)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appeals' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">আবেদন তালিকা</h2>
            
            {pendingAppeals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">কোন নতুন আবেদন নেই</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAppeals.map((appeal) => (
                  <div key={appeal.username} className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">@{appeal.username}</h3>
                        <p className="text-sm text-gray-700 mt-2">{appeal.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          আবেদনের তারিখ: {new Date(appeal.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApproveAppeal(appeal.username)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        অনুমোদন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingUser.name} এর প্রগ্রেস আপডেট করুন
              </h2>

              <div className="space-y-6">
                {/* Attendance */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    উপস্থিতি
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">উপস্থিত দিন</label>
                      <input
                        type="number"
                        value={editAttendance.present}
                        onChange={(e) => setEditAttendance({
                          ...editAttendance,
                          present: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">মোট দিন</label>
                      <input
                        type="number"
                        value={editAttendance.total}
                        onChange={(e) => setEditAttendance({
                          ...editAttendance,
                          total: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    বর্তমান: {editAttendance.total > 0 ? Math.round((editAttendance.present / editAttendance.total) * 100) : 0}%
                  </p>
                </div>

                {/* Understanding */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    এই মাসের বোঝাপড়া
                  </h3>
                  <select
                    value={editUnderstanding}
                    onChange={(e) => setEditUnderstanding(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="0">নতুন মাসের রেটিং যোগ করুন (ঐচ্ছিক)</option>
                    {understandingLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} ({level.value})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    বর্তমান মোট স্কোর: {getUnderstandingProgress(editingUser)}
                    {editUnderstanding > 0 && ` → ${getUnderstandingProgress(editingUser) + editUnderstanding}`}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    সংগঠনের মন্তব্য
                  </h3>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="মন্তব্য লিখুন..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProgress}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
