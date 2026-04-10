/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShippingLine } from '@/src/types';

interface ShippingLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (line: ShippingLine) => void;
}

export default function ShippingLineDialog({ open, onOpenChange, onAdd }: ShippingLineDialogProps) {
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleAdd = () => {
    if (!name || !code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newLine: ShippingLine = {
      id: `line-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      contactEmail: email,
      active: true
    };

    onAdd(newLine);
    toast.success(`Shipping line ${name} added successfully`);
    reset();
    onOpenChange(false);
  };

  const reset = () => {
    setName('');
    setCode('');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Shipping Line</DialogTitle>
          <DialogDescription>
            Register a new shipping line partner in the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Shipping Line Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g. Maersk Line" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Line Code (SCAC) *</Label>
            <Input 
              id="code" 
              placeholder="e.g. MAEU" 
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="ops@shippingline.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Save Shipping Line</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
