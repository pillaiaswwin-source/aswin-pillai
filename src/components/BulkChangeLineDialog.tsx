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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { Plus, Ship } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { useContainers } from '@/src/ContainerContext';

interface BulkChangeLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newLine: string) => void;
  onAddNewLine?: () => void;
  selectedCount: number;
}

export default function BulkChangeLineDialog({ open, onOpenChange, onConfirm, onAddNewLine, selectedCount }: BulkChangeLineDialogProps) {
  const { shippingLines } = useContainers();
  const [selectedLine, setSelectedLine] = React.useState('');

  const handleConfirm = () => {
    if (!selectedLine) {
      toast.error('Please select a shipping line');
      return;
    }
    onConfirm(selectedLine);
    onOpenChange(false);
    setSelectedLine('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Shipping Line</DialogTitle>
          <DialogDescription>
            Update the owner/shipping line for {selectedCount} selected containers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="line">New Shipping Line</Label>
            <Select 
              value={selectedLine} 
              onValueChange={(val) => {
                if (val === 'ADD_NEW') {
                  onAddNewLine?.();
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Update {selectedCount} Containers</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
