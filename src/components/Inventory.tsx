/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  History, 
  Upload, 
  X, 
  Ship, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import BulkUploadDialog from './BulkUploadDialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Container, ContainerSize, ContainerType, ConditionGrade } from '@/src/types';
import ShippingLineDialog from './ShippingLineDialog';
import BulkChangeLineDialog from './BulkChangeLineDialog';
import EditContainerDialog from './EditContainerDialog';
import { useContainers } from '@/src/ContainerContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { useAuth } from '@/src/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  const { containers, addContainers, addContainer, deleteContainers, updateContainerLine, updateContainer, addShippingLine, shippingLines } = useContainers();
  
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'STAFF';
  const canDelete = user?.role === 'OWNER';
  const canAddLine = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const canBulkChange = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isLineDialogOpen, setIsLineDialogOpen] = React.useState(false);
  const [isBulkChangeOpen, setIsBulkChangeOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingContainer, setEditingContainer] = React.useState<Container | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'number' | 'dwell'>('date');

  // Advanced Filters
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [gradeFilter, setGradeFilter] = React.useState<string>('all');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');

  // Add Form State
  const [formData, setFormData] = React.useState({
    number: '',
    size: '40ft' as ContainerSize,
    type: 'Dry' as ContainerType,
    owner: '',
    grade: 'A' as ConditionGrade,
    block: 'A',
    row: '01',
    tier: 1,
    remarks: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newContainer: Container = {
      id: `cont-${Date.now()}`,
      number: formData.number,
      size: formData.size,
      type: formData.type,
      status: 'Available',
      grade: formData.grade,
      owner: formData.owner,
      location: {
        block: formData.block,
        row: formData.row,
        tier: formData.tier
      },
      isReefer: formData.type === 'Reefer',
      arrivalDate: new Date().toISOString(),
      dwellTimeDays: 0,
      remarks: formData.remarks
    };

    addContainer(newContainer);
    toast.success(`Container ${formData.number} added to inventory`);
    setIsAddDialogOpen(false);
    setFormData({
      number: '',
      size: '40ft',
      type: 'Dry',
      owner: '',
      grade: 'A',
      block: 'A',
      row: '01',
      tier: 1,
      remarks: ''
    });
  };

  // Sort containers
  const sortedContainers = React.useMemo(() => {
    return [...containers].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime();
      if (sortBy === 'number') return a.number.localeCompare(b.number);
      if (sortBy === 'dwell') return b.dwellTimeDays - a.dwellTimeDays;
      return 0;
    });
  }, [containers, sortBy]);

  const filteredContainers = sortedContainers.filter(c => {
    const matchesSearch = c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || c.grade === gradeFilter;
    
    const arrivalDate = new Date(c.arrivalDate);
    const matchesStartDate = !startDate || arrivalDate >= new Date(startDate);
    const matchesEndDate = !endDate || arrivalDate <= new Date(endDate + 'T23:59:59');
    
    return matchesSearch && matchesStatus && matchesGrade && matchesStartDate && matchesEndDate;
  });

  const groupedContainers = React.useMemo(() => {
    const groups: Record<string, Container[]> = { all: filteredContainers };
    shippingLines.forEach(line => {
      groups[line] = filteredContainers.filter(c => c.owner === line);
    });
    return groups;
  }, [filteredContainers, shippingLines]);

  const handleBulkUpload = (newContainers: Container[]) => {
    addContainers(newContainers);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContainers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContainers.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    deleteContainers(selectedIds);
    toast.success(`Deleted ${selectedIds.size} containers`);
    setSelectedIds(new Set());
  };

  const handleBulkChangeLine = (newLine: string) => {
    updateContainerLine(selectedIds, newLine);
    toast.success(`Updated shipping line for ${selectedIds.size} containers`);
    setSelectedIds(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Full': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Damaged': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Under Repair': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return '';
    }
  };

  const ContainerTable = ({ data }: { data: Container[] }) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectedIds.size === data.length && data.length > 0}
                onCheckedChange={() => {
                  if (selectedIds.size === data.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(data.map(c => c.id)));
                  }
                }}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Container Number</TableHead>
            <TableHead>Size/Type</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>GP Number</TableHead>
            <TableHead>Vehicle #</TableHead>
            <TableHead>Transporter</TableHead>
            <TableHead>CHA</TableHead>
            <TableHead>From</TableHead>
            <TableHead>Vessel/Voyage</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Dwell Time</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={16} className="h-32 text-center text-muted-foreground">
                No containers found in this category.
              </TableCell>
            </TableRow>
          ) : (
            data.map((c) => (
              <TableRow key={c.id} className={cn(selectedIds.has(c.id) && "bg-muted/50")}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.has(c.id)}
                    onCheckedChange={() => toggleSelect(c.id)}
                    aria-label={`Select ${c.number}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold">{c.number}</p>
                    <p className="text-[10px] text-muted-foreground">Grade: {c.grade}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{c.size}</Badge>
                    <span className="text-sm">{c.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{c.owner}</TableCell>
                <TableCell className="font-mono text-xs">{c.gpNumber || '-'}</TableCell>
                <TableCell className="font-mono text-xs">{c.vehicleNumber || '-'}</TableCell>
                <TableCell className="text-xs max-w-[120px] truncate">{c.transporter || '-'}</TableCell>
                <TableCell className="text-xs max-w-[120px] truncate">{c.cha || '-'}</TableCell>
                <TableCell className="text-xs">{c.fromLocation || '-'}</TableCell>
                <TableCell className="text-xs max-w-[150px] truncate">{c.vesselVoyage || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(c.arrivalDate), 'dd MMM yyyy')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(c.arrivalDate), 'HH:mm')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("font-medium", getStatusColor(c.status))}>
                      {c.status}
                    </Badge>
                    {c.status === 'Damaged' && c.damageDescription && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger render={<div className="cursor-help text-red-500 hover:text-red-600 transition-colors" />}>
                            <AlertCircle className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] p-3">
                            <div className="space-y-2">
                              <p className="font-bold text-xs uppercase tracking-wider">Damage Report</p>
                              <p className="text-xs leading-relaxed">{c.damageDescription}</p>
                              {c.damageImage && (
                                <div className="mt-2 rounded-md overflow-hidden border">
                                  <img src={c.damageImage} alt="Damage" className="w-full h-auto" referrerPolicy="no-referrer" />
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {c.location.block}-{c.location.row}-{c.location.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      c.dwellTimeDays > 7 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {c.dwellTimeDays} days
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs max-w-[150px] truncate italic text-muted-foreground">
                  {c.remarks || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="w-4 h-4 mr-2" /> Movement History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setEditingContainer(c);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Info
                      </DropdownMenuItem>
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => {
                            deleteContainers(new Set([c.id]));
                            toast.success(`Container ${c.number} deleted`);
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-8 relative pb-20">
      {/* Shipping Line Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-primary/10",
            activeTab === 'all' ? "ring-2 ring-primary bg-primary/5" : "bg-card/50"
          )}
          onClick={() => setActiveTab('all')}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Inventory</CardTitle>
            <LayoutGrid className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{containers.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Across all shipping lines</p>
          </CardContent>
        </Card>

        {shippingLines.map(line => {
          const count = containers.filter(c => c.owner === line).length;
          const damaged = containers.filter(c => c.owner === line && c.status === 'Damaged').length;
          
          return (
            <Card 
              key={line}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-primary/10",
                activeTab === line ? "ring-2 ring-primary bg-primary/5" : "bg-card/50"
              )}
              onClick={() => setActiveTab(line)}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{line}</CardTitle>
                <Ship className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{count}</div>
                  {damaged > 0 && (
                    <Badge variant="destructive" className="text-[8px] h-4 px-1 leading-none">
                      {damaged} Damaged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground">Active units</p>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by container # or owner..." 
              className="pl-9 bg-muted/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[160px] bg-muted/30">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Arrival Date</SelectItem>
                <SelectItem value="number">Container #</SelectItem>
                <SelectItem value="dwell">Dwell Time</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" className={cn("bg-muted/30", (statusFilter !== 'all' || gradeFilter !== 'all' || startDate || endDate) && "border-primary text-primary")} />}>
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
                        setStatusFilter('all');
                        setGradeFilter('all');
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
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Full">Full</SelectItem>
                          <SelectItem value="Damaged">Damaged</SelectItem>
                          <SelectItem value="Under Repair">Under Repair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="grade-filter">Grade</Label>
                      <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger id="grade-filter">
                          <SelectValue placeholder="All Grades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                          <SelectItem value="D">Grade D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Arrival Date Range</Label>
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
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {canAddLine && (
            <Button variant="outline" size="sm" onClick={() => setIsLineDialogOpen(true)} className="whitespace-nowrap">
              <Ship className="w-4 h-4 mr-2" />
              New Line
            </Button>
          )}
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)} className="whitespace-nowrap">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          )}
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button size="sm" className="whitespace-nowrap" />}>
                Add Container
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleAddSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Container</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="number">Container Number</Label>
                      <Input 
                        id="number" 
                        placeholder="e.g. MSKU1234567" 
                        value={formData.number}
                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Select 
                        value={formData.size} 
                        onValueChange={(val: ContainerSize) => setFormData({...formData, size: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20ft">20ft</SelectItem>
                          <SelectItem value="40ft">40ft</SelectItem>
                          <SelectItem value="45ft">45ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(val: ContainerType) => setFormData({...formData, type: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dry">Dry</SelectItem>
                          <SelectItem value="Reefer">Reefer</SelectItem>
                          <SelectItem value="Flat Rack">Flat Rack</SelectItem>
                          <SelectItem value="Open Top">Open Top</SelectItem>
                          <SelectItem value="Tank">Tank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Shipping Line</Label>
                      <Select 
                        value={formData.owner} 
                        onValueChange={(val) => setFormData({...formData, owner: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select line" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingLines.map(line => (
                            <SelectItem key={line} value={line}>{line}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select 
                        value={formData.grade} 
                        onValueChange={(val: ConditionGrade) => setFormData({...formData, grade: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                          <SelectItem value="D">Grade D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="block">Block</Label>
                      <Input 
                        id="block" 
                        value={formData.block}
                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="row">Row</Label>
                      <Input 
                        id="row" 
                        value={formData.row}
                        onChange={(e) => setFormData({...formData, row: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Add to Inventory</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm font-medium"
            >
              All Inventory
            </TabsTrigger>
            {shippingLines.map(line => (
              <TabsTrigger 
                key={line} 
                value={line}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-sm font-medium"
              >
                {line}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <List className="w-3 h-3" />
            Showing {groupedContainers[activeTab]?.length || 0} units
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <ContainerTable data={filteredContainers} />
        </TabsContent>

        {shippingLines.map(line => (
          <TabsContent key={line} value={line} className="mt-0">
            <ContainerTable data={groupedContainers[line] || []} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-2xl border border-primary/20"
          >
            <div className="flex items-center gap-2 pr-6 border-r border-primary-foreground/20">
              <div className="w-6 h-6 rounded-full bg-primary-foreground text-primary flex items-center justify-center text-xs font-bold">
                {selectedIds.size}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">Containers Selected</span>
            </div>
            
            <div className="flex items-center gap-3">
              {canBulkChange && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsBulkChangeOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Change Shipping Line
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-red-500/20 hover:text-red-200"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BulkUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
        onUpload={handleBulkUpload} 
      />

      <ShippingLineDialog 
        open={isLineDialogOpen} 
        onOpenChange={setIsLineDialogOpen} 
        onAdd={(line) => addShippingLine(line.name)} 
      />

      <BulkChangeLineDialog
        open={isBulkChangeOpen}
        onOpenChange={setIsBulkChangeOpen}
        onConfirm={handleBulkChangeLine}
        onAddNewLine={() => setIsLineDialogOpen(true)}
        selectedCount={selectedIds.size}
      />

      <EditContainerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        container={editingContainer}
      />
    </div>
  );
}


