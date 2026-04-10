/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Users,
  Ship,
  Container as ContainerIcon
} from 'lucide-react';
import { useContainers } from '@/src/ContainerContext';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const throughputData = [
  { month: 'Jan', in: 450, out: 420 },
  { month: 'Feb', in: 520, out: 480 },
  { month: 'Mar', in: 610, out: 590 },
  { month: 'Apr', in: 580, out: 610 },
  { month: 'May', in: 720, out: 680 },
  { month: 'Jun', in: 850, out: 810 },
];

export default function Reports() {
  const { containers, shippingLines } = useContainers();

  const lineDistribution = shippingLines.map(line => ({
    name: line,
    value: containers.filter(c => c.owner === line).length
  })).filter(d => d.value > 0);

  const statusDistribution = [
    { name: 'Available', value: containers.filter(c => c.status === 'Available').length },
    { name: 'Damaged', value: containers.filter(c => c.status === 'Damaged').length },
    { name: 'Under Repair', value: containers.filter(c => c.status === 'Under Repair').length },
    { name: 'Out of Service', value: containers.filter(c => c.status === 'Out of Service').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive yard performance and inventory insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Throughput Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Yard Throughput</CardTitle>
            <CardDescription>Monthly Gate-In vs Gate-Out volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="in" name="Gate In" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Gate Out" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shipping Line Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Line Distribution</CardTitle>
            <CardDescription>Inventory share by shipping line</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lineDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {lineDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4">
              {lineDistribution.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[80px]">{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Container Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Status</CardTitle>
            <CardDescription>Current state of all containers in yard</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Standard Reports</CardTitle>
            <CardDescription>Quick access to generated documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Daily Stock Report</p>
                  <p className="text-[10px] text-muted-foreground">Generated today at 08:00 AM</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Ship className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Vessel Wise Inventory</p>
                  <p className="text-[10px] text-muted-foreground">Generated yesterday at 06:30 PM</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Dwell Time Analysis</p>
                  <p className="text-[10px] text-muted-foreground">Generated 2 days ago</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
