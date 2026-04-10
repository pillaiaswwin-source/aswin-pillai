/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, ZoomIn, ZoomOut, Maximize2, Info, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useContainers } from '@/src/ContainerContext';
import EditContainerDialog from './EditContainerDialog';
import { Container } from '@/src/types';

const BLOCKS = ['A', 'B', 'C', 'D'];
const ROWS = Array.from({ length: 10 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const TIERS = [1, 2, 3, 4];

interface SlotProps {
  block: string;
  row: string;
  tier: number;
  container?: {
    number: string;
    type: string;
    status: string;
  };
  onClick?: () => void;
  key?: string;
}

const YardSlot = ({ block, row, tier, container, onClick }: SlotProps) => {
  const isOccupied = !!container;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              onClick={onClick}
              className={cn(
                "w-8 h-8 rounded-sm border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer",
                isOccupied
                  ? "bg-primary text-primary-foreground border-primary/50 hover:scale-110"
                  : "bg-muted/50 border-dashed border-muted-foreground/20 hover:bg-muted"
              )}
            />
          }
        >
          {isOccupied ? container.number.slice(-4) : ""}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-bold">{isOccupied ? container.number : 'Empty Slot'}</p>
            <p className="text-xs text-muted-foreground">Location: {block}-{row}-{tier}</p>
            {isOccupied && (
              <>
                <p className="text-xs">Type: {container.type}</p>
                <p className="text-xs">Status: {container.status}</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function YardManagement() {
  const { containers } = useContainers();
  const [selectedBlock, setSelectedBlock] = React.useState('A');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingContainer, setEditingContainer] = React.useState<Container | null>(null);

  const getContainerAt = (block: string, row: string, tier: number) => {
    return containers.find(c => 
      c.location.block === block && 
      c.location.row === row && 
      c.location.tier === tier
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Yard Controls */}
        <Card className="lg:w-64 shrink-0 h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Yard Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select Block</label>
              <div className="grid grid-cols-2 gap-2">
                {BLOCKS.map(block => (
                  <Button 
                    key={block}
                    variant={selectedBlock === block ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBlock(block)}
                  >
                    Block {block}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <label className="text-xs font-medium text-muted-foreground">Legend</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-sm" />
                  <span className="text-xs">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted border border-dashed rounded-sm" />
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
                  <span className="text-xs">Reefer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-xs">Damaged</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yard Grid View */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between bg-card border rounded-lg p-3">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">Block {selectedBlock}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Viewing Rows 01-10, Tiers 1-4</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><ZoomIn className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><Maximize2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-6 overflow-auto">
              <div className="min-w-[800px]">
                {/* Tier Labels */}
                <div className="flex mb-2">
                  <div className="w-12 shrink-0" />
                  {ROWS.map(row => (
                    <div key={row} className="w-8 text-center text-[10px] font-medium text-muted-foreground">
                      {row}
                    </div>
                  ))}
                </div>

                {/* Grid Rows */}
                <div className="space-y-4">
                  {TIERS.reverse().map(tier => (
                    <div key={tier} className="flex items-center gap-0">
                      <div className="w-12 shrink-0 text-xs font-bold text-muted-foreground">
                        Tier {tier}
                      </div>
                      <div className="flex gap-2">
                        {ROWS.map(row => {
                          const container = getContainerAt(selectedBlock, row, tier);
                          return (
                            <YardSlot 
                              key={`${row}-${tier}`}
                              block={selectedBlock}
                              row={row}
                              tier={tier}
                              container={container ? {
                                number: container.number,
                                type: `${container.size} ${container.type}`,
                                status: container.status
                              } : undefined}
                              onClick={() => {
                                if (container) {
                                  setEditingContainer(container);
                                  setIsEditDialogOpen(true);
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
                  Bay View: Block {selectedBlock} (Longitudinal Section)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditContainerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        container={editingContainer}
      />
    </div>
  );
}
