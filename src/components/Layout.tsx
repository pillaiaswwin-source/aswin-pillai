/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Ship, 
  Container as ContainerIcon, 
  ArrowLeftRight, 
  Wrench, 
  Thermometer, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/src/AuthContext';
import { useContainers } from '@/src/ContainerContext';
import { UserRole } from '@/src/types';
import { toast } from 'sonner';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  key?: string;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-md" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "group-hover:text-primary")} />
    <span className="flex-1 text-sm font-medium text-left">{label}</span>
    {badge && (
      <Badge variant={active ? "secondary" : "default"} className="px-1.5 py-0 text-[10px]">
        {badge}
      </Badge>
    )}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout } = useAuth();
  const { saveData } = useContainers();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleSave = () => {
    saveData();
    toast.success('All data saved successfully to local storage');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'REPAIRMAN', 'BILLING', 'STAFF'] },
    { id: 'gate', label: 'Gate Operations', icon: ArrowLeftRight, badge: '12', roles: ['OWNER', 'MANAGER', 'STAFF'] },
    { id: 'yard', label: 'Yard Management', icon: Ship, roles: ['OWNER', 'MANAGER', 'STAFF'] },
    { id: 'inventory', label: 'Inventory', icon: ContainerIcon, roles: ['OWNER', 'MANAGER', 'REPAIRMAN', 'BILLING', 'STAFF'] },
    { id: 'repairs', label: 'Repairs & Maintenance', icon: Wrench, badge: '5', roles: ['OWNER', 'MANAGER', 'REPAIRMAN'] },
    { id: 'reefer', label: 'Reefer Monitoring', icon: Thermometer, roles: ['OWNER', 'MANAGER'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['OWNER', 'BILLING'] },
  ];

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role as UserRole)
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300 ease-in-out z-30",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
              <Ship className="w-8 h-8" />
              <span>DEPOT TRACK</span>
            </div>
          ) : (
            <Ship className="w-8 h-8 text-primary mx-auto" />
          )}
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {filteredItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                badge={isSidebarOpen ? item.badge : undefined}
              />
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-1 py-2">
            {user?.role === 'OWNER' && (
              <SidebarItem 
                icon={Settings} 
                label={isSidebarOpen ? 'Settings' : ''} 
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <Avatar className="w-9 h-9 border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">
                  {user?.role}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:flex hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold capitalize">
              {menuItems.find(i => i.id === activeTab)?.label || activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Data
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium">Depot: ICD Mumbai North</p>
                <p className="text-[10px] text-muted-foreground">Status: Operational</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Live
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </div>
      </main>
    </div>
  );
}
