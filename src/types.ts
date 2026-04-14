/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'OWNER' | 'MANAGER' | 'REPAIRMAN' | 'BILLING' | 'STAFF';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
}

export type ContainerSize = '20ft' | '40ft' | '45ft';
export type ContainerType = 'Dry' | 'Reefer' | 'Flat Rack' | 'Open Top' | 'Tank';
export type ContainerStatus = 'Empty' | 'Full' | 'Damaged' | 'Under Repair' | 'Available' | 'Reserved';
export type ConditionGrade = 'A' | 'B' | 'C' | 'D';

export interface Container {
  id: string;
  number: string;
  size: ContainerSize;
  type: ContainerType;
  status: ContainerStatus;
  grade: ConditionGrade;
  owner: string;
  location: {
    block: string;
    row: string;
    tier: number;
  };
  lastInspectionDate?: string;
  isReefer: boolean;
  temperature?: number;
  arrivalDate: string;
  dwellTimeDays: number;
  // New fields from image
  gpNumber?: string;
  vehicleNumber?: string;
  transporter?: string;
  cha?: string;
  fromLocation?: string;
  vesselVoyage?: string;
  remarks?: string;
  damageDescription?: string;
  damageImage?: string;
}

export interface GateMovement {
  id: string;
  containerNumber: string;
  type: 'IN' | 'OUT';
  timestamp: string;
  driverName: string;
  vehicleNumber: string;
  eirNumber: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  gpNumber?: string;
  transporter?: string;
  cha?: string;
  fromLocation?: string;
  vesselVoyage?: string;
  remarks?: string;
}

export interface RepairWorkOrder {
  id: string;
  containerNumber: string;
  description: string;
  estimatedCost: number;
  status: 'Pending Approval' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface YardSlot {
  id: string;
  block: string;
  row: string;
  tier: number;
  containerId?: string;
  isOccupied: boolean;
}

export interface DashboardStats {
  totalContainers: number;
  gateInsToday: number;
  gateOutsToday: number;
  repairsInProgress: number;
  yardUtilization: number;
  reeferAlerts: number;
}

export interface ShippingLine {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  active: boolean;
}

