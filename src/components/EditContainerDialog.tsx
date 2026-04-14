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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Container, ContainerSize, ContainerType, ConditionGrade, ContainerStatus } from '@/src/types';
import { useContainers } from '@/src/ContainerContext';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface EditContainerDialogProps {
  container: Container | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditContainerDialog({ container, open, onOpenChange }: EditContainerDialogProps) {
  const { updateContainer, shippingLines } = useContainers();
  const [formData, setFormData] = React.useState<Container | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (container) {
      setFormData({ ...container });
    }
  }, [container]);

  if (!formData) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, damageImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateContainer(formData);
    toast.success(`Container ${formData.number} updated successfully`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Customize Container: {container?.number}</DialogTitle>
            <DialogDescription>Modify container specifications, location, and metadata.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 pt-2">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-number">Container Number</Label>
                    <Input 
                      id="edit-number" 
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-size">Size</Label>
                    <Select 
                      value={formData.size} 
                      onValueChange={(val: ContainerSize) => setFormData({...formData, size: val})}
                    >
                      <SelectTrigger id="edit-size">
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
                    <Label htmlFor="edit-type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(val: ContainerType) => setFormData({
                        ...formData, 
                        type: val,
                        isReefer: val === 'Reefer'
                      })}
                    >
                      <SelectTrigger id="edit-type">
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
                    <Label htmlFor="edit-owner">Shipping Line</Label>
                    <Select 
                      value={formData.owner} 
                      onValueChange={(val) => setFormData({...formData, owner: val})}
                    >
                      <SelectTrigger id="edit-owner">
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val: ContainerStatus) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                        <SelectItem value="Under Repair">Under Repair</SelectItem>
                        <SelectItem value="Reserved">Reserved</SelectItem>
                        <SelectItem value="Empty">Empty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-grade">Grade</Label>
                    <Select 
                      value={formData.grade} 
                      onValueChange={(val: ConditionGrade) => setFormData({...formData, grade: val})}
                    >
                      <SelectTrigger id="edit-grade">
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
                </div>
              </div>

              {formData.status === 'Damaged' && (
                <>
                  <Separator />
                  <div 
                    className="space-y-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <h4 className="text-sm font-bold uppercase tracking-wider">Damage Report</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="damage-desc">Damage Description</Label>
                      <Textarea 
                        id="damage-desc"
                        placeholder="Describe the damage in detail..."
                        value={formData.damageDescription || ''}
                        onChange={(e) => setFormData({...formData, damageDescription: e.target.value})}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Damage Photos (Optional)</Label>
                      <div className="flex flex-wrap gap-4">
                        {formData.damageImage ? (
                          <div className="relative group w-32 h-32 rounded-lg overflow-hidden border">
                            <img 
                              src={formData.damageImage} 
                              alt="Damage" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFormData({...formData, damageImage: undefined})}
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                          >
                            <Camera className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Upload Photo</span>
                          </button>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Location Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Location Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-block">Block</Label>
                    <Input 
                      id="edit-block" 
                      value={formData.location.block}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location, block: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-row">Row</Label>
                    <Input 
                      id="edit-row" 
                      value={formData.location.row}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location, row: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tier">Tier</Label>
                    <Input 
                      id="edit-tier" 
                      type="number"
                      value={formData.location.tier}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location, tier: parseInt(e.target.value) || 1 }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Advanced Metadata */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Advanced Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-gp">GP Number</Label>
                    <Input 
                      id="edit-gp" 
                      value={formData.gpNumber || ''}
                      onChange={(e) => setFormData({...formData, gpNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vehicle">Vehicle Number</Label>
                    <Input 
                      id="edit-vehicle" 
                      value={formData.vehicleNumber || ''}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-transporter">Transporter</Label>
                    <Input 
                      id="edit-transporter" 
                      value={formData.transporter || ''}
                      onChange={(e) => setFormData({...formData, transporter: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cha">CHA</Label>
                    <Input 
                      id="edit-cha" 
                      value={formData.cha || ''}
                      onChange={(e) => setFormData({...formData, cha: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vessel">Vessel/Voyage</Label>
                    <Input 
                      id="edit-vessel" 
                      value={formData.vesselVoyage || ''}
                      onChange={(e) => setFormData({...formData, vesselVoyage: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-from">From Location</Label>
                    <Input 
                      id="edit-from" 
                      value={formData.fromLocation || ''}
                      onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-remarks">Remarks</Label>
                    <Input 
                      id="edit-remarks" 
                      value={formData.remarks || ''}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
