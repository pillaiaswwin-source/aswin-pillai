/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GateOperations from './components/GateOperations';
import YardManagement from './components/YardManagement';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Repairs from './components/Repairs';
import ReeferMonitoring from './components/ReeferMonitoring';
import Reports from './components/Reports';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ContainerProvider } from './ContainerContext';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderContent = () => {
    // Basic role-based content protection
    const isOwner = user?.role === 'OWNER';
    const isManager = user?.role === 'MANAGER';
    const isStaff = user?.role === 'STAFF';
    const isRepairman = user?.role === 'REPAIRMAN';
    const isBilling = user?.role === 'BILLING';

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'gate':
        if (!isOwner && !isManager && !isStaff) return <Dashboard />;
        return <GateOperations />;
      case 'yard':
        if (!isOwner && !isManager && !isStaff) return <Dashboard />;
        return <YardManagement />;
      case 'inventory':
        return <Inventory />;
      case 'repairs':
        if (!isOwner && !isManager && !isRepairman) return <Dashboard />;
        return <Repairs />;
      case 'reefer':
        if (!isOwner && !isManager) return <Dashboard />;
        return <ReeferMonitoring />;
      case 'reports':
        if (!isOwner && !isBilling) return <Dashboard />;
        return <Reports />;
      case 'settings':
        if (!isOwner) return <Dashboard />;
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <h2 className="text-2xl font-bold">Module Under Construction</h2>
            <p className="text-muted-foreground">
              This feature is part of the upcoming Depot Track v2.0 release.
            </p>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContainerProvider>
        <AppContent />
      </ContainerProvider>
    </AuthProvider>
  );
}

