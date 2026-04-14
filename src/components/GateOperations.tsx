/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Search, Filter, Printer, Download, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ShippingLineDialog from './ShippingLineDialog';
import { Ship, Calendar, Clock } from 'lucide-react';
import { useContainers } from '@/src/ContainerContext';
import { toast } from 'sonner';

import { useAuth } from '@/src/AuthContext';

export default function GateOperations() {
  const { user } = useAuth();
  const { movements, shippingLines, addShippingLine, addMovement, addContainer } = useContainers();
  
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'STAFF';
  const canAddLine = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLineDialogOpen, setIsLineDialogOpen] = React.useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = React.useState(false);
  const [selectedLine, setSelectedLine] = React.useState<string | undefined>();

  // Advanced Filters
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [lineFilter, setLineFilter] = React.useState<string>('all');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');

  // Form State
  const [formData, setFormData] = React.useState({
    type: 'IN' as 'IN' | 'OUT',
    containerNumber: '',
    size: '40HC',
    condition: 'Sound',
    driverName: '',
    vehicleNumber: '',
    remarks: ''
  });

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.containerNumber || !formData.driverName || !formData.vehicleNumber || !selectedLine) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMovement = {
      id: `mvt-${Date.now()}`,
      containerNumber: formData.containerNumber,
      type: formData.type,
      timestamp: new Date().toISOString(),
      driverName: formData.driverName,
      vehicleNumber: formData.vehicleNumber,
      eirNumber: `EIR-${Math.floor(Math.random() * 1000000)}`,
      status: 'Completed' as const,
      remarks: formData.remarks
    };

    addMovement(newMovement);

    // If it's a Gate In, also add to inventory
    if (formData.type === 'IN') {
      addContainer({
        id: `cont-${Date.now()}`,
        number: formData.containerNumber,
        size: formData.size.includes('20') ? '20ft' : '40ft',
        type: formData.size.includes('RF') ? 'Reefer' : 'Dry',
        status: 'Available',
        grade: 'A',
        owner: selectedLine,
        location: { block: 'A', row: '01', tier: 1 },
        isReefer: formData.size.includes('RF'),
        arrivalDate: new Date().toISOString(),
        dwellTimeDays: 0
      });
    }

    toast.success(`Gate ${formData.type === 'IN' ? 'In' : 'Out'} processed successfully`);
    setIsEntryDialogOpen(false);
    setFormData({
      type: 'IN',
      containerNumber: '',
      size: '40HC',
      condition: 'Sound',
      driverName: '',
      vehicleNumber: '',
      remarks: ''
    });
  };

  // Sort movements by timestamp (newest first)
  const sortedMovements = [...movements].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredMovements = sortedMovements.filter(m => {
    const matchesSearch = m.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    
    // For line filter, we need to find the container's owner if it's not in the movement record
    // In this mock, movements don't store owner directly, but we can assume it's linked
    // However, for simplicity, let's just filter by type and date for now as per request
    // If I wanted to filter by line, I'd need to join with containers or store line in movement
    
    const movementDate = new Date(m.timestamp);
    const matchesStartDate = !startDate || movementDate >= new Date(startDate);
    const matchesEndDate = !endDate || movementDate <= new Date(endDate + 'T23:59:59');
    
    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search container, driver, or vehicle..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className={cn((typeFilter !== 'all' || startDate || endDate) && "border-primary text-primary")} />}>
              <Filter className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Advanced Filters</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setTypeFilter('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type-filter">Movement Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type-filter">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="IN">Gate In</SelectItem>
                        <SelectItem value="OUT">Gate Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs"
                      />
                      <Input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {canAddLine && (
            <Button variant="outline" onClick={() => setIsLineDialogOpen(true)}>
              <Ship className="w-4 h-4 mr-2" />
              New Shipping Line
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canManage && (
            <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
              <DialogTrigger render={<Button />}>
                <Plus className="w-4 h-4 mr-2" />
                New Gate Entry
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleEntrySubmit}>
                  <DialogHeader>
                    <DialogTitle>New Gate Entry (EIR Generation)</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Movement Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(val: 'IN' | 'OUT') => setFormData({...formData, type: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">Gate In</SelectItem>
                          <SelectItem value="OUT">Gate Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="container">Container Number</Label>
                      <Input 
                        id="container" 
                        placeholder="e.g. MSKU1234567" 
                        value={formData.containerNumber}
                        onChange={(e) => setFormData({...formData, containerNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size & Type</Label>
                      <Select 
                        value={formData.size} 
                        onValueChange={(val) => setFormData({...formData, size: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20GP">20ft GP</SelectItem>
                          <SelectItem value="40GP">40ft GP</SelectItem>
                          <SelectItem value="40HC">40ft HC</SelectItem>
                          <SelectItem value="20RF">20ft Reefer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(val) => setFormData({...formData, condition: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sound">Sound</SelectItem>
                          <SelectItem value="Damaged">Damaged</SelectItem>
                          <SelectItem value="Dirty">Dirty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver">Driver Name</Label>
                      <Input 
                        id="driver" 
                        placeholder="Full Name" 
                        value={formData.driverName}
                        onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle Number</Label>
                      <Input 
                        id="vehicle" 
                        placeholder="MH-01-AB-1234" 
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="line">Shipping Line</Label>
                      <Select 
                        value={selectedLine} 
                        onValueChange={(val) => {
                          if (val === 'ADD_NEW') {
                            setIsLineDialogOpen(true);
                            return;
                          }
                          setSelectedLine(val);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shipping line" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingLines.map(line => (
                            <SelectItem key={line} value={line}>{line}</SelectItem>
                          ))}
                          <Separator className="my-1" />
                          <SelectItem value="ADD_NEW" className="text-primary font-medium">
                            <Plus className="w-4 h-4 mr-2 inline" />
                            Add New Shipping Line...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Input 
                        id="remarks" 
                        placeholder="Optional remarks" 
                        value={formData.remarks}
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsEntryDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Process & Print EIR</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Container #</TableHead>
              <TableHead>GP Number</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Driver / Vehicle</TableHead>
              <TableHead>Transporter</TableHead>
              <TableHead>CHA</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Vessel/Voyage</TableHead>
              <TableHead>EIR Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-full",
                      m.type === 'IN' ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {m.type === 'IN' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-medium">{m.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold">{m.containerNumber}</TableCell>
                <TableCell className="font-mono text-xs">{m.gpNumber || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(m.timestamp), 'dd MMM yyyy')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(m.timestamp), 'HH:mm')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{m.driverName}</p>
                    <p className="text-xs text-muted-foreground">{m.vehicleNumber}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs max-w-[120px] truncate">{m.transporter || '-'}</TableCell>
                <TableCell className="text-xs max-w-[120px] truncate">{m.cha || '-'}</TableCell>
                <TableCell className="text-xs">{m.fromLocation || '-'}</TableCell>
                <TableCell className="text-xs max-w-[150px] truncate">{m.vesselVoyage || '-'}</TableCell>
                <TableCell className="font-mono text-xs">{m.eirNumber}</TableCell>
                <TableCell>
                  <Badge variant={m.status === 'Completed' ? 'secondary' : 'outline'} className={cn(
                    m.status === 'Completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : ""
                  )}>
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs max-w-[150px] truncate italic text-muted-foreground">
                  {m.remarks || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Printer className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ShippingLineDialog 
        open={isLineDialogOpen} 
        onOpenChange={setIsLineDialogOpen} 
        onAdd={(line) => addShippingLine(line.name)} 
      />
    </div>
  );
}

