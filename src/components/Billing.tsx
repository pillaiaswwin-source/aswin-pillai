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
import { Search, Plus, FileText, Download, Printer, DollarSign, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { useContainers } from '@/src/ContainerContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Billing() {
  const { containers, shippingLines, invoices, addInvoice } = useContainers();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    customerName: '',
    containerNumber: '',
    amount: '',
    type: 'Storage' as any,
    dueDate: format(new Date(Date.now() + 86400000 * 14), 'yyyy-MM-dd')
  });

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newInvoice = {
      id: `INV-2024-${Math.floor(Math.random() * 900 + 100)}`,
      customerName: formData.customerName,
      containerNumber: formData.containerNumber || 'N/A',
      amount: Number(formData.amount),
      status: 'Draft' as const,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      type: formData.type
    };

    addInvoice(newInvoice);
    toast.success('Invoice draft created');
    setIsAddOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.containerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>;
      case 'Unpaid': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Unpaid</Badge>;
      case 'Overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'Draft': return <Badge variant="outline">Draft</Badge>;
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
              placeholder="Search by Invoice#, Customer, or Container..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Statement
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddInvoice}>
                <DialogHeader>
                  <DialogTitle>Generate New Invoice</DialogTitle>
                  <DialogDescription>Create a storage, handling, or repair invoice for a shipping line.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customer">Customer (Shipping Line)</Label>
                    <Select onValueChange={(val) => setFormData({...formData, customerName: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingLines.map(line => (
                          <SelectItem key={line} value={line}>{line}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Invoice Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(val: any) => setFormData({...formData, type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Storage">Storage</SelectItem>
                        <SelectItem value="Handling">Handling</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Reefer">Reefer Power</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="container">Container Number (Optional)</Label>
                    <Input 
                      id="container" 
                      placeholder="e.g. MSKU1234567" 
                      value={formData.containerNumber}
                      onChange={(e) => setFormData({...formData, containerNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="due">Due Date</Label>
                    <Input 
                      id="due" 
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit">Generate Invoice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> $2,100 Overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid this Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,200.00</div>
            <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Container</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-bold">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.customerName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{inv.type}</Badge>
                </TableCell>
                <TableCell className="text-xs">{inv.containerNumber}</TableCell>
                <TableCell className="font-bold">${inv.amount.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(inv.dueDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>{getStatusBadge(inv.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
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
