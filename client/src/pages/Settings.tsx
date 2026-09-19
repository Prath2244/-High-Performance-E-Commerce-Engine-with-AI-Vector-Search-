import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Save, User, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '', // ✅ phone from user
        address: user.address || { street: '', city: '', state: '', zipCode: '', country: '' },
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // --- Profile ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfileForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setProfileForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      };
      await apiClient.put('/auth/profile', payload);
      toast.success('Profile updated successfully');
      // Refetch user data to reflect changes
      const response = await apiClient.get('/auth/me');
      const updatedUser = response.data.data;
      // Update local user state via auth slice if needed – will be reflected on next page reload
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Password ---
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'profile') handleProfileSubmit(e);
    else if (activeTab === 'security') handlePasswordSubmit(e);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your account and application settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
              </div>
              <div className="card-body space-y-4">
                {activeTab === 'profile' && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-2xl">
                        {profileForm.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profileForm.name}</p>
                        <p className="text-sm text-gray-500">{profileForm.email}</p>
                        <p className="text-xs text-gray-400">Role: {user?.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="input-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          className="input"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="input-label">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        value={profileForm.address?.street || ''}
                        onChange={handleProfileChange}
                        className="input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={profileForm.address?.city || ''}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="input-label">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={profileForm.address?.state || ''}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Zip Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={profileForm.address?.zipCode || ''}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="input-label">Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={profileForm.address?.country || ''}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-3">
                    {['Email notifications', 'Order updates', 'Promotional emails', 'System alerts'].map((item) => (
                      <label key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Password requirements:</p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        <li>At least 6 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-md flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}