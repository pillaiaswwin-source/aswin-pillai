/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Container, ContainerSize, ContainerType, ContainerStatus, ConditionGrade } from '@/src/types';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (containers: Container[]) => void;
}

export default function BulkUploadDialog({ open, onOpenChange, onUpload }: BulkUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds the 100MB limit.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the format.');
          return;
        }
        setParsedData(results.data);
      },
      error: (err) => {
        setIsParsing(false);
        setError(`Error: ${err.message}`);
      }
    });
  };

  const handleConfirm = () => {
    if (parsedData.length === 0) return;

    // Map CSV data to Container type
    const newContainers: Container[] = parsedData.map((row, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      number: row.number || row.container_number || `CONT${Math.floor(Math.random() * 1000000)}`,
      size: (row.size || '40ft') as ContainerSize,
      type: (row.type || 'Dry') as ContainerType,
      status: (row.status || 'Available') as ContainerStatus,
      grade: (row.grade || 'A') as ConditionGrade,
      owner: row.owner || 'Unknown',
      location: {
        block: row.block || 'A',
        row: row.row || '01',
        tier: parseInt(row.tier) || 1
      },
      isReefer: row.type?.toLowerCase().includes('reefer') || false,
      arrivalDate: row.arrival_date || row.arrivalDate || new Date().toISOString(),
      dwellTimeDays: 0,
      gpNumber: row.gp_number || row.gpNumber || '',
      vehicleNumber: row.vehicle_number || row.vehicleNumber || '',
      transporter: row.transporter || '',
      cha: row.cha || '',
      fromLocation: row.from_location || row.fromLocation || '',
      vesselVoyage: row.vessel_voyage || row.vesselVoyage || '',
      remarks: row.remarks || ''
    }));

    onUpload(newContainers);
    toast.success(`Successfully uploaded ${newContainers.length} containers`);
    reset();
    onOpenChange(false);
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Bulk Container Upload</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing container details. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileChange({ target: { files: [droppedFile] } } as any);
              }}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">CSV files only (max 100MB)</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Parsing data...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Preview ({parsedData.length} records)</h4>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Validated
                    </Badge>
                  </div>
                  <ScrollArea className="h-[250px] rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left font-medium">Container #</th>
                          <th className="p-2 text-left font-medium">Size</th>
                          <th className="p-2 text-left font-medium">Type</th>
                          <th className="p-2 text-left font-medium">Owner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsedData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono">{row.number || row.container_number}</td>
                            <td className="p-2">{row.size}</td>
                            <td className="p-2">{row.type}</td>
                            <td className="p-2">{row.owner}</td>
                          </tr>
                        ))}
                        {parsedData.length > 10 && (
                          <tr>
                            <td colSpan={4} className="p-2 text-center text-muted-foreground italic">
                              + {parsedData.length - 10} more records...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!file || parsedData.length === 0 || isParsing}
          >
            Confirm Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
