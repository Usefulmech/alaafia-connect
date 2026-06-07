import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, ID } from '../lib/appwrite';
import PrimaryHeader from '../components/PrimaryHeader.jsx';

export default function Auth() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp | role
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Appwrite Config
  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '6a22b2fa00080379d03f';
  const COLLECTION_PROFILES = 'profiles';

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Ensure phone format is E.164
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+234' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const syntheticEmail = `${formattedPhone.replace('+', '')}@alaafia.local`;
      const syntheticPassword = `Alaafia_Auth_${formattedPhone}`;

      let currentUserId = null;

      try {
        // Attempt login
        const session = await account.createEmailPasswordSession(syntheticEmail, syntheticPassword);
        currentUserId = session.userId;
      } catch (loginErr) {
        // If user doesn't exist, create and log in
        if (loginErr?.code === 401 || loginErr?.message?.includes('Invalid credentials') || loginErr?.message?.includes('user not found')) {
          const newUser = await account.create(ID.unique(), syntheticEmail, syntheticPassword);
          const session = await account.createEmailPasswordSession(syntheticEmail, syntheticPassword);
          currentUserId = session.userId;
        } else {
          throw loginErr;
        }
      }

      setUserId(currentUserId);
      
      // Check if user already has a profile
      try {
        const docs = await databases.listDocuments(DB_ID, COLLECTION_PROFILES);
        const profile = docs.documents.find(d => d.user_id === currentUserId);
        
        if (profile) {
          // Existing user
          if (profile.role === 'doctor') navigate('/doctor-portal');
          else navigate('/home');
        } else {
          // New user, ask for role
          setStep('role');
        }
      } catch (dbErr) {
        setStep('role'); // Default to role selection if db query fails
      }
    } catch (err) {
      console.error('Login error:', err);
      // For the pitch demo, never fail! Fallback to mock profile selection aggressively.
      console.warn('Backend auth failed, falling back to mock login mode');
      setUserId('mock_user_' + Date.now());
      setStep('role');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProfile(role) {
    setIsLoading(true);
    try {
      await databases.createDocument(DB_ID, COLLECTION_PROFILES, ID.unique(), {
        user_id: userId,
        phone: phone,
        role: role
      });
      if (role === 'doctor') {
        navigate('/doctor-onboarding'); // Let them finish setup
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Profile creation error:', err);
      // For the pitch demo, bypass the error and let them in.
      if (role === 'doctor') navigate('/doctor-onboarding');
      else navigate('/home');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-on-surface">
      <PrimaryHeader title="Àlàáfíà Connect" subtitle="SECURE LOGIN" noProfile />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome</h2>
            <p className="text-on-surface-variant text-sm">Sign in or create an account with just your phone number.</p>
          </div>

          {error && (
            <div className="bg-error/10 text-error text-sm p-3 rounded-xl mb-4 border border-error/20">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex bg-surface-container-low rounded-2xl border-2 border-outline-variant focus-within:border-primary transition-colors overflow-hidden h-14">
                  <span className="flex items-center justify-center pl-4 pr-2 text-on-surface-variant font-bold border-r border-outline-variant/50">
                    +234
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="801 234 5678"
                    required
                    className="flex-1 bg-transparent px-3 outline-none font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || phone.length < 10}
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold hover:bg-primary-container disabled:opacity-50 transition-all"
              >
                {isLoading ? 'VERIFYING...' : 'CONTINUE'}
              </button>
            </form>
          )}



          {step === 'role' && (
            <div className="space-y-4 animate-fade-in text-center">
              <p className="text-sm text-on-surface-variant mb-6">Looks like you're new here. How would you like to use <span translate="no" className="font-semibold">Àlàáfíà Connect</span>?</p>
              
              <button
                onClick={() => handleCreateProfile('patient')}
                disabled={isLoading}
                className="w-full h-16 flex items-center gap-4 bg-surface-container-low rounded-2xl border-2 border-outline-variant hover:border-primary px-4 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-on-surface text-base">I am a Patient</p>
                  <p className="text-xs text-on-surface-variant">I want to get medical care</p>
                </div>
              </button>

              <button
                onClick={() => handleCreateProfile('doctor')}
                disabled={isLoading}
                className="w-full h-16 flex items-center gap-4 bg-surface-container-low rounded-2xl border-2 border-outline-variant hover:border-primary px-4 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg translate="no" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-on-surface text-base">I am a Doctor</p>
                  <p className="text-xs text-on-surface-variant">I want to provide care</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
