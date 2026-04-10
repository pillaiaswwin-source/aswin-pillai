/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Thermometer, 
  Wind, 
  Battery, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react';
import { useContainers } from '@/src/ContainerContext';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const tempHistory = [
  { time: '00:00', temp: -18.2, humidity: 85 },
  { time: '04:00', temp: -18.0, humidity: 84 },
  { time: '08:00', temp: -17.8, humidity: 86 },
  { time: '12:00', temp: -18.1, humidity: 85 },
  { time: '16:00', temp: -18.3, humidity: 83 },
  { time: '20:00', temp: -18.0, humidity: 84 },
  { time: '23:59', temp: -17.9, humidity: 85 },
];

export default function ReeferMonitoring() {
  const { containers } = useContainers();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const reeferContainers = containers.filter(c => c.isReefer || c.type === 'Reefer');
  const filteredReefers = reeferContainers.filter(c => 
    c.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reeferContainers.length,
    critical: 2,
    warning: 3,
    stable: reeferContainers.length - 5
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reefer containers..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Telemetry</Button>
          <Button>Configure Alerts</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Connected</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Alerts</p>
              <p className="text-xl font-bold text-red-500">{stats.critical}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Warnings</p>
              <p className="text-xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stable Units</p>
              <p className="text-xl font-bold text-green-500">{stats.stable}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reefer List */}
        <Card className="lg:col-span-1 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Active Units</CardTitle>
            <CardDescription>Real-time telemetry status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-3">
            {filteredReefers.map((c, i) => (
              <div key={c.id} className={cn(
                "p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                i === 0 ? "border-primary bg-primary/5" : ""
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{c.number}</span>
                  <Badge variant={i === 1 ? "destructive" : i === 2 ? "secondary" : "outline"} className="text-[10px]">
                    {i === 1 ? "CRITICAL" : i === 2 ? "WARNING" : "STABLE"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Thermometer className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">{i === 1 ? "-12.4°C" : "-18.2°C"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Wind className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">85% RH</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Battery className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Main Power</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">6.2 kW</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Telemetry Detail */}
        <Card className="lg:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Unit Telemetry: {filteredReefers[0]?.number || 'N/A'}</CardTitle>
              <CardDescription>24-hour temperature and humidity trend</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Live Connection
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card/50">
                <p className="text-xs text-muted-foreground mb-1">Current Temp</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">-18.2°C</span>
                  <span className="text-[10px] text-green-500 flex items-center mb-1">
                    <ArrowDownRight className="w-3 h-3" /> 0.2°
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-card/50">
                <p className="text-xs text-muted-foreground mb-1">Set Point</p>
                <span className="text-2xl font-bold">-18.0°C</span>
              </div>
              <div className="p-4 rounded-xl border bg-card/50">
                <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">85%</span>
                  <span className="text-[10px] text-red-500 flex items-center mb-1">
                    <ArrowUpRight className="w-3 h-3" /> 2%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempHistory}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[-20, -15]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Recent Events
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">14:20 - Defrost cycle initiated</span>
                  <span className="font-medium">System Auto</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">12:05 - Power source switched to Yard Grid</span>
                  <span className="font-medium">Manual</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
