'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import {
  User,
  Mail,
  Shield,
  Link2,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Connected accounts
  const [providers, setProviders] = useState<string[]>([]);
  const [isOAuthOnly, setIsOAuthOnly] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (user) {
      const identities = user.identities || [];
      const providerList = identities.map((i: { provider: string }) => i.provider);
      setProviders(providerList);
      // If user signed up only via OAuth (no email provider), they don't have a password yet
      const hasEmailProvider = providerList.includes('email');
      setIsOAuthOnly(!hasEmailProvider);
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);

    await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    await refreshProfile();
    setProfileSaved(true);
    setSavingProfile(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: isOAuthOnly ? 'Password created successfully! You can now sign in with email + password.' : 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setIsOAuthOnly(false);
    }
    setSavingPassword(false);
  };

  const handleConnectGoogle = async () => {
    await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  const handleConnectDiscord = async () => {
    await supabase.auth.linkIdentity({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  const handleConnectTwitter = async () => {
    await supabase.auth.linkIdentity({
      provider: 'twitter',
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const providerLabel = (p: string) => {
    switch (p) {
      case 'google': return 'Google';
      case 'discord': return 'Discord';
      case 'twitter': return 'X (Twitter)';
      case 'email': return 'Email';
      default: return p;
    }
  };

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, password, and connected accounts</p>
      </div>

      {/* Profile Section */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-[#22c55e]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-[#1a1a1a]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <User size={24} className="text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-white font-medium">{firstName} {lastName}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">Email</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a]">
            <Mail size={14} className="text-gray-500" />
            <span className="text-sm text-gray-400">{email}</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-1">Email cannot be changed here</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {profileSaved ? <Check size={14} /> : <Save size={14} />}
            {savingProfile ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={18} className="text-[#22c55e]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {isOAuthOnly ? 'Set Password' : 'Change Password'}
          </h2>
        </div>

        {isOAuthOnly && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-[#015608]/10 border border-[#015608]/20">
            <AlertCircle size={14} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-300">
              You signed up with an OAuth provider. Set a password to also sign in with email + password.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
            />
          </div>

          {passwordMsg && (
            <div className={`text-sm px-4 py-3 rounded-lg ${
              passwordMsg.type === 'success'
                ? 'bg-[#015608]/10 border border-[#015608]/20 text-[#22c55e]'
                : 'bg-red-400/10 border border-red-400/20 text-red-400'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Shield size={14} />
            {savingPassword ? 'Saving...' : isOAuthOnly ? 'Set Password' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link2 size={18} className="text-[#22c55e]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Connected Accounts</h2>
        </div>

        <div className="space-y-3">
          {/* Google */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Google</p>
                {providers.includes('google') && <p className="text-[11px] text-gray-500">Connected</p>}
              </div>
            </div>
            {providers.includes('google') ? (
              <span className="flex items-center gap-1 text-xs text-[#22c55e]"><Check size={12} /> Connected</span>
            ) : (
              <button onClick={handleConnectGoogle} className="px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs text-gray-400 hover:text-white hover:border-[#333333] transition-colors">
                Connect
              </button>
            )}
          </div>

          {/* Discord */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Discord</p>
                {providers.includes('discord') && <p className="text-[11px] text-gray-500">Connected</p>}
              </div>
            </div>
            {providers.includes('discord') ? (
              <span className="flex items-center gap-1 text-xs text-[#22c55e]"><Check size={12} /> Connected</span>
            ) : (
              <button onClick={handleConnectDiscord} className="px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs text-gray-400 hover:text-white hover:border-[#333333] transition-colors">
                Connect
              </button>
            )}
          </div>

          {/* X (Twitter) */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">X (Twitter)</p>
                {providers.includes('twitter') && <p className="text-[11px] text-gray-500">Connected</p>}
              </div>
            </div>
            {providers.includes('twitter') ? (
              <span className="flex items-center gap-1 text-xs text-[#22c55e]"><Check size={12} /> Connected</span>
            ) : (
              <button onClick={handleConnectTwitter} className="px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs text-gray-400 hover:text-white hover:border-[#333333] transition-colors">
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
