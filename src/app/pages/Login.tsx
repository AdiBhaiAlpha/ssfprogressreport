import { useState } from 'react';
import { useNavigate } from 'react-router';
import { login, submitAppeal } from '../utils/api';
import { User, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isAdmin', result.isAdmin.toString());
        
        if (result.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
        
        // If blocked, show appeal option
        if (result.error.includes('ব্লক')) {
          setShowAppeal(true);
        }
      }
    } catch (err) {
      setError('লগইন করতে সমস্যা হয়েছে');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async () => {
    if (!appealMessage.trim()) {
      setError('অনুগ্রহ করে আপনার আবেদন লিখুন');
      return;
    }

    try {
      const result = await submitAppeal(username, appealMessage);
      if (result.success) {
        alert('আপনার আবেদন পাঠানো হয়েছে। অনুমোদনের অপেক্ষায় রয়েছে।');
        setShowAppeal(false);
        setAppealMessage('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('আবেদন পাঠাতে সমস্যা হয়েছে');
      console.error('Appeal error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <img 
                src="https://i.ibb.co.com/7NrCcJLB/3458025-splash.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="mb-2 flex justify-center">
              <img 
                src="https://i.ibb.co/R4BCPZ0B/20250130-143124.png" 
                alt="সমাজতান্ত্রিক ছাত্র ফ্রন্ট" 
                className="h-12 object-contain"
              />
            </div>
            <p className="text-gray-600">প্রগ্রেস ট্র্যাকিং সিস্টেম</p>
          </div>

          {!showAppeal ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ইউজারনেম
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="আপনার ইউজারনেম লিখুন"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">
                  আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। আপনি একবার আবেদন করতে পারবেন।
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  আপনার আবেদন লিখুন
                </label>
                <textarea
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  placeholder="কেন আপনার অ্যাকাউন্ট আনব্লক করা উচিত তা লিখুন..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAppeal}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  আবেদন পাঠান
                </button>
                <button
                  onClick={() => setShowAppeal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
