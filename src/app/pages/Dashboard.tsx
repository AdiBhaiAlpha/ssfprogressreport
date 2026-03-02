import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getUsers } from '../utils/api';
import { LogOut, Settings, TrendingUp, Calendar, Award } from 'lucide-react';

interface User {
  username: string;
  name: string;
  profilePicture?: string;
  attendance: { present: number; total: number };
  understanding: number[];
  comment?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await getUsers();
      if (result.success) {
        // Calculate scores and sort
        const usersWithScores = result.users.map((u: User) => ({
          ...u,
          score: calculateScore(u)
        }));
        usersWithScores.sort((a: any, b: any) => b.score - a.score);
        setUsers(usersWithScores);
      }
    } catch (err) {
      console.error('Load users error:', err);
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

  const currentUserData = users.find(u => u.username === currentUser?.username);
  const topUser = users[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সমাজতান্ত্রিক ছাত্র ফ্রন্ট</h1>
            <p className="text-sm text-gray-600">প্রগ্রেস ড্যাশবোর্ড</p>
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
        {/* Current User Card */}
        {currentUserData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                {currentUserData.profilePicture ? (
                  <img src={currentUserData.profilePicture} alt={currentUserData.name} className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{currentUserData.name}</h2>
                <p className="text-gray-600">@{currentUserData.username}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">উপস্থিতি</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {getAttendancePercentage(currentUserData)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentUserData.attendance.present} / {currentUserData.attendance.total} দিন
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">বোঝাপড়া</h3>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min(getUnderstandingProgress(currentUserData) * 2, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {getUnderstandingProgress(currentUserData)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentUserData.understanding.length} মাসের রেকর্ড
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">র‍্যাংক</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  #{users.findIndex(u => u.username === currentUserData.username) + 1}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {users.length} সদস্যের মধ্যে
                </p>
              </div>
            </div>

            {currentUserData.comment && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-2">সংগঠনের মন্তব্য</h3>
                <p className="text-gray-700">{currentUserData.comment}</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">সদস্য র‍্যাংকিং</h2>
          
          <div className="space-y-4">
            {users.map((user: any, index) => (
              <div
                key={user.username}
                onClick={() => navigate(`/profile/${user.username}`)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  index === 0 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 hover:border-red-300'
                } ${user.username === currentUser?.username ? 'ring-2 ring-red-400' : ''}`}
              >
                <div className="flex items-center gap-4">
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

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">উপস্থিতি</div>
                    <div className="font-bold text-blue-600">{getAttendancePercentage(user)}%</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">বোঝাপড়া</div>
                    <div className="font-bold text-green-600">{getUnderstandingProgress(user)}</div>
                  </div>
                </div>

                {index === 0 && (
                  <div className="mt-2 flex items-center gap-2 text-yellow-700">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-semibold">শীর্ষ পারফরমার</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
