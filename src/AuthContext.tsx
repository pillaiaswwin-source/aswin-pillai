/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  addUser: (newUser: User, pass: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (updatedUser: User) => void;
  resetUserPassword: (username: string, newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const DEMO_USERS: Record<string, { user: User; pass: string }> = {
  'owner': { 
    pass: 'owner123', 
    user: { id: '1', username: 'owner', role: 'OWNER', name: 'Yard Owner', email: 'owner@depottrack.com', phone: '+91 98765 43210' } 
  },
  'manager': { 
    pass: 'manager123', 
    user: { id: '2', username: 'manager', role: 'MANAGER', name: 'Operations Manager', email: 'manager@depottrack.com' } 
  },
  'repair': { 
    pass: 'repair123', 
    user: { id: '3', username: 'repair', role: 'REPAIRMAN', name: 'Lead Repairman' } 
  },
  'billing': { 
    pass: 'billing123', 
    user: { id: '4', username: 'billing', role: 'BILLING', name: 'Billing Officer' } 
  },
  'staff': { 
    pass: 'staff123', 
    user: { id: '5', username: 'staff', role: 'STAFF', name: 'Gate Staff' } 
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('yard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('yard_all_users');
    if (saved) return JSON.parse(saved);
    return Object.values(DEMO_USERS).map(u => u.user);
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('yard_passwords');
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, string> = {};
    Object.entries(DEMO_USERS).forEach(([key, val]) => {
      initial[key] = val.pass;
    });
    return initial;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    const lowerUsername = username.toLowerCase();
    const foundUser = users.find(u => u.username.toLowerCase() === lowerUsername);
    const currentPass = passwords[lowerUsername];
    
    if (foundUser && currentPass === password) {
      setUser(foundUser);
      localStorage.setItem('yard_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yard_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('yard_user', JSON.stringify(updatedUser));
    
    // Also update in DEMO_USERS for the session (optional, but good for consistency)
    if (DEMO_USERS[user.username.toLowerCase()]) {
      DEMO_USERS[user.username.toLowerCase()].user = updatedUser;
    }
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not authenticated' };
    
    const currentPass = passwords[user.username.toLowerCase()];
    if (currentPass !== oldPass) {
      return { success: false, message: 'Current password is incorrect' };
    }

    const newPasswords = { ...passwords, [user.username.toLowerCase()]: newPass };
    setPasswords(newPasswords);
    localStorage.setItem('yard_passwords', JSON.stringify(newPasswords));
    
    return { success: true, message: 'Password changed successfully' };
  };

  const addUser = (newUser: User, pass: string) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('yard_all_users', JSON.stringify(updatedUsers));
    
    const updatedPasswords = { ...passwords, [newUser.username.toLowerCase()]: pass };
    setPasswords(updatedPasswords);
    localStorage.setItem('yard_passwords', JSON.stringify(updatedPasswords));
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('yard_all_users', JSON.stringify(updatedUsers));
    
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      const updatedPasswords = { ...passwords };
      delete updatedPasswords[userToDelete.username.toLowerCase()];
      setPasswords(updatedPasswords);
      localStorage.setItem('yard_passwords', JSON.stringify(updatedPasswords));
    }
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('yard_all_users', JSON.stringify(updatedUsers));
    
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
      localStorage.setItem('yard_user', JSON.stringify(updatedUser));
    }
  };

  const resetUserPassword = (username: string, newPass: string) => {
    const updatedPasswords = { ...passwords, [username.toLowerCase()]: newPass };
    setPasswords(updatedPasswords);
    localStorage.setItem('yard_passwords', JSON.stringify(updatedPasswords));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      updateProfile, 
      changePassword,
      addUser,
      deleteUser,
      updateUser,
      resetUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
