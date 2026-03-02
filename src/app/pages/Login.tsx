import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';

/**
 * প্রিভিউ এনভায়রনমেন্টে চালানোর জন্য মক এপিআই ফাংশন।
 * আপনার লোকাল প্রজেক্টে এগুলোকে '../utils/api' থেকে ইমপোর্ট করা ফাংশন দিয়ে রিপ্লেস করবেন।
 */
const mockLogin = async (username, password) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // নেটওয়ার্ক ল্যাগ সিমুলেশন
  if (username === 'anoy_ssf' && password === '123456') {
    return { success: true, user: { name: 'Anoy' }, isAdmin: false };
  } else if (username === 'blocked_user') {
    return { success: false, error: 'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।' };
  }
  return { success: false, error: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।' };
};

const mockSubmitAppeal = async (username, message) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');

  // আপনার দেওয়া লোগো এবং টেক্সট ইমেজ লিঙ্ক
  const logoUrl = "https://i.ibb.co.com/7NrCcJLB/3458025-splash.png";
  const titleImageUrl = "https://i.ibb.co/R4BCPZ0B/20250130-143124.png";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await mockLogin(username, password);
      
      if (result.success) {
        console.log('লগইন সফল');
        setError('লগইন সফল হয়েছে! (সিস্টেম ডেমো মোডে আছে)');
      } else {
        setError(result.error);
        if (result.error.includes('ব্লক')) {
          setShowAppeal(true);
        }
      }
    } catch (err) {
      setError('লগইন করতে সমস্যা হয়েছে');
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
      const result = await mockSubmitAppeal(username, appealMessage);
      if (result.success) {
        setError('আপনার আবেদন পাঠানো হয়েছে। অনুমোদনের অপেক্ষায় রয়েছে।');
        setShowAppeal(false);
        setAppealMessage('');
      } else {
        setError('আবেদন পাঠাতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setError('আবেদন পাঠাতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f0f0] p-4 font-sans text-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            {/* লোগো সেকশন */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-[#fff5f5]">
              <img 
                src={logoUrl} 
                alt="SSF Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80?text=SSF";
                }}
              />
            </div>
            
            {/* টেক্সট এর পরিবর্তে ইমেজ টাইটেল */}
            <div className="flex justify-center mb-2">
              <img 
                src={titleImageUrl} 
                alt="সমাজতান্ত্রিক ছাত্র ফ্রন্ট" 
                className="h-12 md:h-14 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <p className="text-gray-500 font-bold text-sm tracking-wider uppercase">প্রগ্রেস ট্র্যাকিং সিস্টেম</p>
          </div>

          {!showAppeal ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                  ইউজারনেম
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#eff5ff] border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-800 font-medium"
                    placeholder="anoy_ssf"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#eff5ff] border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-800"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className={`flex items-start gap-2 p-4 rounded-xl ${error.includes('পাঠানো') || error.includes('সফল') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#e60000] text-white font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200 text-lg"
              >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-[#e60000] hover:text-red-800 font-bold text-base transition-colors"
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-sm text-gray-700 font-bold leading-relaxed">
                  আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।<br/>আপনি একবার আবেদন করতে পারবেন।
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  আপনার আবেদন লিখুন
                </label>
                <textarea
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  className="w-full px-4 py-4 bg-[#eff5ff] border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="কেন আপনার অ্যাকাউন্ট আনব্লক করা উচিত তা লিখুন..."
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAppeal}
                  className="w-full py-4 bg-[#e60000] text-white font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-200"
                >
                  আবেদন পাঠান
                </button>
                <button
                  onClick={() => {
                      setShowAppeal(false);
                      setError('');
                  }}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
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
