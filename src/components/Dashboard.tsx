/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Container as ContainerIcon, 
  ArrowLeftRight, 
  Wrench, 
  Thermometer,
  Activity,
  ArrowDownLeft,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockStats } from '@/src/lib/mockData';
import { useContainers } from '@/src/ContainerContext';
import { format } from 'date-fns';
import { generateDailyStockReport } from '@/src/lib/reportUtils';
import { toast } from 'sonner';

import { useAuth } from '@/src/AuthContext';

const data = [
  { name: 'Mon', in: 40, out: 24 },
  { name: 'Tue', in: 30, out: 13 },
  { name: 'Wed', in: 20, out: 98 },
  { name: 'Thu', in: 27, out: 39 },
  { name: 'Fri', in: 18, out: 48 },
  { name: 'Sat', in: 23, out: 38 },
  { name: 'Sun', in: 34, out: 43 },
];

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  description?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, description }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <div className="flex items-center mt-1">
              {trend.positive ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={trend.positive ? "text-green-500" : "text-red-500"}>
                {trend.value}
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last week</span>
            </div>
          )}
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { containers, movements } = useContainers();

  // Auto-download at 6 AM logic
  React.useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      // Check if it's exactly 6:00 AM (within a 1-minute window)
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        const lastDownload = localStorage.getItem('last_6am_report_date');
        const todayStr = now.toDateString();
        
        if (lastDownload !== todayStr) {
          generateDailyStockReport(containers, movements);
          localStorage.setItem('last_6am_report_date', todayStr);
          toast.info('Scheduled 6 AM Daily Stock Report downloaded automatically.');
        }
      }
    };

    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [containers, movements]);

  const handleManualDownload = () => {
    generateDailyStockReport(containers, movements);
    toast.success('Daily Stock Report generated successfully.');
  };

  const totalContainers = containers.length;
  const gateInsToday = movements.filter(m => m.type === 'IN' && new Date(m.timestamp).toDateString() === new Date().toDateString()).length;
  const gateOutsToday = movements.filter(m => m.type === 'OUT' && new Date(m.timestamp).toDateString() === new Date().toDateString()).length;

  const typeDistribution = containers.reduce((acc: any, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value: value as number }));

  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Generate chart data from movements
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const movementChartData = last7Days.map(dateStr => {
    const dayMovements = movements.filter(m => new Date(m.timestamp).toDateString() === dateStr);
    return {
      name: format(new Date(dateStr), 'EEE'),
      in: dayMovements.filter(m => m.type === 'IN').length,
      out: dayMovements.filter(m => m.type === 'OUT').length
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h2>
          <p className="text-muted-foreground">
            Here's what's happening in the yard today as <span className="font-semibold text-primary">{user?.role}</span>.
          </p>
        </div>
        <Button 
          onClick={handleManualDownload}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download Daily Stock Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Containers" 
          value={totalContainers} 
          icon={ContainerIcon}
          trend={{ value: "12%", positive: true }}
        />
        <StatCard 
          title="Gate Movements" 
          value={gateInsToday + gateOutsToday} 
          icon={ArrowLeftRight}
          description={`${gateInsToday} In / ${gateOutsToday} Out today`}
        />
        <StatCard 
          title="Yard Utilization" 
          value={`${Math.min(100, Math.round((totalContainers / 2000) * 100))}%`} 
          icon={Activity}
          trend={{ value: "5%", positive: false }}
        />
        <StatCard 
          title="Active Repairs" 
          value={mockStats.repairsInProgress} 
          icon={Wrench}
          description="5 pending approval"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Movement Trends</CardTitle>
            <CardDescription>Daily gate-in vs gate-out volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="in" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Gate In" />
                <Bar dataKey="out" fill="#10b981" radius={[4, 4, 0, 0]} name="Gate Out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Mix</CardTitle>
            <CardDescription>Container distribution by type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-8">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-medium">{entry.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Reefer Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Gate Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMovements.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      m.type === 'IN' ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {m.type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{m.containerNumber}</p>
                      <p className="text-xs text-muted-foreground">{m.driverName} • {m.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{m.type === 'IN' ? 'Gate In' : 'Gate Out'}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(m.timestamp), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reefer Alerts</CardTitle>
            <Thermometer className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-destructive">TEMP DEVIATION</span>
                  <Badge variant="outline" className="text-[10px] h-4">Critical</Badge>
                </div>
                <p className="text-sm font-bold">HLXU9876543</p>
                <p className="text-xs text-muted-foreground">Current: -12.4°C (Target: -18.0°C)</p>
              </div>
              <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yellow-600">POWER FAILURE</span>
                  <Badge variant="outline" className="text-[10px] h-4">Warning</Badge>
                </div>
                <p className="text-sm font-bold">COSU1112223</p>
                <p className="text-xs text-muted-foreground">Disconnected for 15 mins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
