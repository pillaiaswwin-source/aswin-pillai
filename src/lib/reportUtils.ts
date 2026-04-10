/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Container, GateMovement } from '../types';
import { format } from 'date-fns';

export const generateDailyStockReport = (containers: Container[], movements: GateMovement[]) => {
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  
  // 1. Inventory Summary Sheet
  const inventoryData = containers.map(c => ({
    'Container Number': c.number,
    'Size': c.size,
    'Type': c.type,
    'Shipping Line': c.owner,
    'Status': c.status,
    'Condition': c.grade,
    'Location': `${c.location.block}-${c.location.row}-${c.location.tier}`,
    'Arrival Date': format(new Date(c.arrivalDate), 'dd-MMM-yyyy HH:mm'),
    'Dwell Days': c.dwellTimeDays,
    'GP Number': c.gpNumber || '-',
    'Vehicle Number': c.vehicleNumber || '-',
    'Transporter': c.transporter || '-',
    'Remarks': c.remarks || ''
  }));

  // 2. Gate Movements Today Sheet
  const todayMovements = movements.filter(m => 
    format(new Date(m.timestamp), 'yyyy-MM-dd') === dateStr
  ).map(m => ({
    'Time': format(new Date(m.timestamp), 'HH:mm'),
    'Type': m.type,
    'Container Number': m.containerNumber,
    'Driver': m.driverName,
    'Vehicle': m.vehicleNumber,
    'EIR Number': m.eirNumber,
    'GP Number': m.gpNumber || '-',
    'Transporter': m.transporter || '-',
    'Vessel/Voyage': m.vesselVoyage || '-'
  }));

  // Create Workbook
  const wb = XLSX.utils.book_new();
  
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Current Inventory');
  
  const wsMovements = XLSX.utils.json_to_sheet(todayMovements);
  XLSX.utils.book_append_sheet(wb, wsMovements, 'Today Movements');

  // Generate and Download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Daily_Stock_Report_${dateStr}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
