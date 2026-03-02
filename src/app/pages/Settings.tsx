import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { updateAdmin, uploadProfile } from '../utils/api';
import { ArrowLeft, Camera, Lock, Save, X } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    const admin = localStorage.getItem('isAdmin');
    if (!user) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    setIsAdmin(admin === 'true');
    setProfilePicture(userData.profilePicture || '');
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setUploading(true);
        try {
          const result = await uploadProfile(currentUser.username, base64);
          if (result.success) {
            setProfilePicture(result.url);
            const updatedUser = { ...currentUser, profilePicture: result.url };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('ছবি আপলোড সফল হয়েছে');
            setTimeout(() => setMessage(''), 3000);
          }
        } catch (err) {
          console.error('Upload error:', err);
          setMessage('ছবি আপলোড করতে সমস্যা হয়েছে');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (confirm('আপনি কি নিশ্চিত যে ছবি মুছে দিতে চান?')) {
      setProfilePicture('');
      const updatedUser = { ...currentUser, profilePicture: '' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('প্রোফাইল ছবি মুছে দেওয়া হয়েছে');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (!password) {
      setMessage('পাসওয়ার্ড লিখুন');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (password.length < 6) {
      setMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setSaving(true);
    try {
      const result = await updateAdmin(currentUser.role, password);
      if (result.success) {
        const updatedUser = { ...currentUser, password };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setPassword('');
        setConfirmPassword('');
        setMessage('পাসওয়ার্ড আপডেট সফল হয়েছে');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setMessage('পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const DefaultAvatar = () => (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            ফিরে যান
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">সেটিংস</h1>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
              {message}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">প্রোফাইল ছবি</h2>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                {profilePicture ? (
                  <img src={profilePicture} alt={currentUser?.name} className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar />
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    {uploading ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন করুন'}
                  </button>
                  
                  {profilePicture && (
                    <button
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      ছবি মুছুন
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  JPG, PNG বা GIF ফরম্যাটে ছবি আপলোড করুন
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">অ্যাকাউন্টের তথ্য</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">নাম:</span>
                <span className="font-semibold text-gray-900">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ইউজারনেম:</span>
                <span className="font-semibold text-gray-900">@{currentUser?.username}</span>
              </div>
              {isAdmin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">রোল:</span>
                  <span className="font-semibold text-red-600">
                    {currentUser?.role === 'president' ? 'সভাপতি' : 'সাধারণ সম্পাদক'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section - Only for Admins */}
          {isAdmin && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                পাসওয়ার্ড পরিবর্তন করুন
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নতুন পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পাসওয়ার্ড নিশ্চিত করুন
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="পাসওয়ার্ড আবার লিখুন"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                </button>

                <p className="text-sm text-gray-600">
                  বিঃদ্রঃ এই ডিভাইস থেকে লগইন করা থাকলে পুরাতন পাসওয়ার্ডের প্রয়োজন নেই
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
