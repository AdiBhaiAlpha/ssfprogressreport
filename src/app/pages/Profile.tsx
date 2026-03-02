import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getUsers } from '../utils/api';
import { ArrowLeft, Calendar, TrendingUp, Award, MessageSquare } from 'lucide-react';

interface User {
  username: string;
  name: string;
  profilePicture?: string;
  attendance: { present: number; total: number };
  understanding: number[];
  comment?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [rank, setRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [username]);

  const loadUser = async () => {
    try {
      const result = await getUsers();
      if (result.success) {
        const usersWithScores = result.users.map((u: User) => ({
          ...u,
          score: calculateScore(u)
        }));
        usersWithScores.sort((a: any, b: any) => b.score - a.score);
        
        const foundUser = usersWithScores.find((u: User) => u.username === username);
        if (foundUser) {
          setUser(foundUser);
          setRank(usersWithScores.findIndex((u: User) => u.username === username) + 1);
          setTotalUsers(usersWithScores.length);
        }
      }
    } catch (err) {
      console.error('Load user error:', err);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ইউজার পাওয়া যায়নি</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            ফিরে যান
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 h-32"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
              
              {rank === 1 && (
                <div className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">শীর্ষ পারফরমার</span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">উপস্থিতি</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {getAttendancePercentage(user)}%
                </div>
                <p className="text-gray-600">
                  {user.attendance.present} / {user.attendance.total} দিন
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">বোঝাপড়া স্কোর</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {getUnderstandingProgress(user)}
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-green-600 h-full transition-all duration-500"
                    style={{ width: `${Math.min(getUnderstandingProgress(user) * 2, 100)}%` }}
                  />
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {user.understanding.length} মাসের রেকর্ড
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">র‍্যাংক</h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  #{rank}
                </div>
                <p className="text-gray-600">
                  {totalUsers} সদস্যের মধ্যে
                </p>
              </div>
            </div>

            {/* Monthly Progress */}
            {user.understanding.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  মাসিক বোঝাপড়া প্রগতি
                </h3>
                <div className="space-y-3">
                  {user.understanding.map((score, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16">মাস {index + 1}</span>
                      <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-600 h-full transition-all duration-500"
                          style={{ width: `${(score / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-600 w-8">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            {user.comment && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-yellow-600" />
                  সংগঠনের মন্তব্য
                </h3>
                <p className="text-gray-700">{user.comment}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
