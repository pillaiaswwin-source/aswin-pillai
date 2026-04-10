/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Container, GateMovement, RepairWorkOrder, DashboardStats } from '@/src/types';

export const mockContainers: Container[] = [
  {
    id: '1',
    number: 'MSKU1234567',
    size: '40ft',
    type: 'Dry',
    status: 'Available',
    grade: 'A',
    owner: 'Maersk',
    location: { block: 'A', row: '01', tier: 1 },
    isReefer: false,
    arrivalDate: '2024-03-20T08:30:00Z',
    dwellTimeDays: 5,
    gpNumber: 'GP-1001',
    vehicleNumber: 'MH-01-AB-1234',
    transporter: 'FastTrack Logistics',
    cha: 'Global CHA Services',
    fromLocation: 'JNPT Port',
    vesselVoyage: 'MAERSK SEOUL / 401W',
    remarks: 'Standard gate-in'
  },
  {
    id: '2',
    number: 'HLXU9876543',
    size: '20ft',
    type: 'Reefer',
    status: 'Full',
    grade: 'B',
    owner: 'Hapag-Lloyd',
    location: { block: 'B', row: '05', tier: 2 },
    isReefer: true,
    temperature: -18.5,
    arrivalDate: '2024-03-22T14:15:00Z',
    dwellTimeDays: 3,
    gpNumber: 'GP-1002',
    vehicleNumber: 'MH-04-CD-5678',
    transporter: 'CoolChain Express',
    cha: 'Elite Customs Broker',
    fromLocation: 'Mundra Port',
    vesselVoyage: 'HAPAG HAMBURG / 223E',
    remarks: 'Priority reefer'
  },
  {
    id: '3',
    number: 'CMAU5556667',
    size: '40ft',
    type: 'Dry',
    status: 'Damaged',
    grade: 'C',
    owner: 'CMA CGM',
    location: { block: 'C', row: '02', tier: 1 },
    isReefer: false,
    arrivalDate: '2024-03-15T11:00:00Z',
    dwellTimeDays: 10,
    gpNumber: 'GP-1003',
    vehicleNumber: 'MH-02-EF-9012',
    transporter: 'HeavyLift Trans',
    cha: 'Swift Clearances',
    fromLocation: 'Pipavav Port',
    vesselVoyage: 'CMA LIBRA / 098S',
    remarks: 'Side panel dent'
  },
  {
    id: '4',
    number: 'COSU1112223',
    size: '40ft',
    type: 'Tank',
    status: 'Empty',
    grade: 'A',
    owner: 'COSCO',
    location: { block: 'A', row: '03', tier: 3 },
    isReefer: false,
    arrivalDate: '2024-03-24T16:45:00Z',
    dwellTimeDays: 1,
    gpNumber: 'GP-1004',
    vehicleNumber: 'MH-03-GH-3456',
    transporter: 'LiquidBulk Carriers',
    cha: 'Prime Logistics',
    fromLocation: 'Hazira Port',
    vesselVoyage: 'COSCO SHIPPING / 112N',
    remarks: 'Clean tank'
  },
];

export const mockMovements: GateMovement[] = [
  {
    id: 'm1',
    containerNumber: 'MSKU1234567',
    type: 'IN',
    timestamp: '2024-03-25T08:30:00Z',
    driverName: 'Rajesh Kumar',
    vehicleNumber: 'MH-01-AB-1234',
    eirNumber: 'EIR-001234',
    status: 'Completed',
  },
  {
    id: 'm2',
    containerNumber: 'HLXU9876543',
    type: 'IN',
    timestamp: '2024-03-25T09:15:00Z',
    driverName: 'Suresh Singh',
    vehicleNumber: 'MH-04-CD-5678',
    eirNumber: 'EIR-001235',
    status: 'Completed',
  },
  {
    id: 'm3',
    containerNumber: 'TEXU4445556',
    type: 'OUT',
    timestamp: '2024-03-25T10:00:00Z',
    driverName: 'Amit Patel',
    vehicleNumber: 'MH-02-EF-9012',
    eirNumber: 'EIR-001236',
    status: 'Pending',
  },
];

export const mockRepairs: RepairWorkOrder[] = [
  {
    id: 'r1',
    containerNumber: 'CMAU5556667',
    description: 'Floorboard replacement and side panel dent repair',
    estimatedCost: 450.00,
    status: 'In Progress',
    priority: 'Medium',
    createdAt: '2024-03-20T14:00:00Z',
  },
  {
    id: 'r2',
    containerNumber: 'ZIMU7778889',
    description: 'Corner post welding',
    estimatedCost: 200.00,
    status: 'Pending Approval',
    priority: 'High',
    createdAt: '2024-03-24T11:30:00Z',
  },
];

export const mockStats: DashboardStats = {
  totalContainers: 1245,
  gateInsToday: 42,
  gateOutsToday: 38,
  repairsInProgress: 15,
  yardUtilization: 78,
  reeferAlerts: 2,
};
