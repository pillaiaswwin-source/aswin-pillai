/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Wrench, CheckCircle2, Clock, AlertTriangle, MoreVertical } from 'lucide-react';
import { useContainers } from '@/src/ContainerContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RepairWorkOrder } from '@/src/types';

export default function Repairs() {
  const { containers, repairOrders, addRepairOrder, updateRepairStatus } = useContainers();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    containerNumber: '',
    type: 'Structural',
    description: '',
    estimatedCost: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const handleAddRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.containerNumber || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newOrder: RepairWorkOrder = {
      id: `RO-${Math.floor(Math.random() * 900 + 100)}`,
      containerNumber: formData.containerNumber,
      description: formData.description,
      estimatedCost: Number(formData.estimatedCost) || 0,
      status: 'Pending Approval',
      priority: formData.priority,
      createdAt: new Date().toISOString()
    };

    addRepairOrder(newOrder);
    toast.success('Repair order created successfully');
    setIsAddOpen(false);
    setFormData({
      containerNumber: '',
      type: 'Structural',
      description: '',
      estimatedCost: '',
      priority: 'Medium'
    });
  };

  const updateStatus = (id: string, newStatus: RepairWorkOrder['status']) => {
    updateRepairStatus(id, newStatus);
    toast.success(`Order ${id} status updated to ${newStatus}`);
  };

  const filteredOrders = repairOrders.filter(ro => 
    ro.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ro.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: RepairWorkOrder['status']) => {
    switch (status) {
      case 'Completed': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'In Progress': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>;
      case 'Pending Approval': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Awaiting Approval</Badge>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: RepairWorkOrder['priority']) => {
    switch (priority) {
      case 'High': return <Badge variant="destructive">High</Badge>;
      case 'Medium': return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Medium</Badge>;
      case 'Low': return <Badge variant="outline">Low</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by RO# or Container..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" />
            New Repair Order
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddRepair}>
              <DialogHeader>
                <DialogTitle>Create Repair Work Order</DialogTitle>
                <DialogDescription>Enter details for the container repair or maintenance task.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="container">Container Number</Label>
                  <Select 
                    onValueChange={(val) => setFormData({...formData, containerNumber: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select container" />
                    </SelectTrigger>
                    <SelectContent>
                      {containers.map(c => (
                        <SelectItem key={c.id} value={c.number}>{c.number} ({c.owner})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Repair Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Structural">Structural</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Floor">Floor</SelectItem>
                      <SelectItem value="Painting">Painting</SelectItem>
                      <SelectItem value="Reefer Unit">Reefer Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(val: any) => setFormData({...formData, priority: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input 
                    id="cost" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="desc">Description of Work</Label>
                  <Input 
                    id="desc" 
                    placeholder="Detailed repair instructions..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit">Create Order</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairOrders.filter(ro => ro.status === 'Pending Approval').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairOrders.filter(ro => ro.status === 'In Progress').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairOrders.filter(ro => ro.status === 'Completed').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Container #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Est. Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((ro) => (
              <TableRow key={ro.id}>
                <TableCell className="font-mono font-bold">{ro.id}</TableCell>
                <TableCell className="font-medium">{ro.containerNumber}</TableCell>
                <TableCell>{ro.type}</TableCell>
                <TableCell>{getPriorityBadge(ro.priority)}</TableCell>
                <TableCell>{getStatusBadge(ro.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(ro.createdAt), 'dd MMM, HH:mm')}
                </TableCell>
                <TableCell className="font-medium">${ro.estimatedCost}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {ro.status === 'In Progress' && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(ro.id, 'Completed')}>
                        Complete
                      </Button>
                    )}
                    {ro.status === 'Pending Approval' && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(ro.id, 'In Progress')}>
                        Approve & Start
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
