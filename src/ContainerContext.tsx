/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Container, GateMovement, RepairWorkOrder } from './types';
import { mockContainers, mockMovements } from './lib/mockData';

interface ContainerContextType {
  containers: Container[];
  movements: GateMovement[];
  shippingLines: string[];
  addContainers: (newContainers: Container[]) => void;
  addContainer: (container: Container) => void;
  addMovements: (newMovements: GateMovement[]) => void;
  addMovement: (movement: GateMovement) => void;
  addShippingLine: (name: string) => void;
  deleteContainers: (ids: Set<string>) => void;
  updateContainerLine: (ids: Set<string>, newLine: string) => void;
  updateContainer: (updatedContainer: Container) => void;
  repairOrders: RepairWorkOrder[];
  addRepairOrder: (order: RepairWorkOrder) => void;
  updateRepairStatus: (id: string, status: RepairWorkOrder['status']) => void;
  saveData: () => void;
}

const ContainerContext = createContext<ContainerContextType | undefined>(undefined);

export function ContainerProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<Container[]>(() => {
    const saved = localStorage.getItem('depot_containers');
    return saved ? JSON.parse(saved) : mockContainers;
  });
  const [movements, setMovements] = useState<GateMovement[]>(() => {
    const saved = localStorage.getItem('depot_movements');
    return saved ? JSON.parse(saved) : mockMovements;
  });
  const [shippingLines, setShippingLines] = useState<string[]>(() => {
    const saved = localStorage.getItem('depot_shipping_lines');
    return saved ? JSON.parse(saved) : ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'COSCO'];
  });
  const [repairOrders, setRepairOrders] = useState<RepairWorkOrder[]>(() => {
    const saved = localStorage.getItem('depot_repairs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'RO-001',
        containerNumber: 'MSKU9876543',
        description: 'Side panel dent repair and welding',
        estimatedCost: 450,
        status: 'In Progress',
        priority: 'Medium',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'RO-002',
        containerNumber: 'HLXU1234567',
        description: 'Chemical wash for chemical residue',
        estimatedCost: 120,
        status: 'Pending Approval',
        priority: 'Low',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  });

  const addContainers = (newContainers: Container[]) => {
    setContainers(prev => [...newContainers, ...prev]);
    
    // Automatically create Gate In movements for bulk uploaded containers
    const newMovements: GateMovement[] = newContainers.map(c => ({
      id: `mvt-${Date.now()}-${c.id}`,
      containerNumber: c.number,
      type: 'IN',
      timestamp: c.arrivalDate || new Date().toISOString(),
      driverName: 'Bulk Upload',
      vehicleNumber: c.vehicleNumber || 'SYSTEM',
      eirNumber: `EIR-${Math.floor(Math.random() * 1000000)}`,
      status: 'Completed',
      gpNumber: c.gpNumber,
      transporter: c.transporter,
      cha: c.cha,
      fromLocation: c.fromLocation,
      vesselVoyage: c.vesselVoyage,
      remarks: c.remarks
    }));
    
    setMovements(prev => [...newMovements, ...prev]);
  };

  const addContainer = (container: Container) => {
    setContainers(prev => [container, ...prev]);
  };

  const addMovements = (newMovements: GateMovement[]) => {
    setMovements(prev => [...newMovements, ...prev]);
  };

  const addMovement = (movement: GateMovement) => {
    setMovements(prev => [movement, ...prev]);
  };

  const addShippingLine = (name: string) => {
    setShippingLines(prev => {
      if (prev.includes(name)) return prev;
      return [...prev, name].sort();
    });
  };

  const deleteContainers = (ids: Set<string>) => {
    setContainers(prev => prev.filter(c => !ids.has(c.id)));
  };

  const updateContainerLine = (ids: Set<string>, newLine: string) => {
    setContainers(prev => prev.map(c => 
      ids.has(c.id) ? { ...c, owner: newLine } : c
    ));
  };

  const updateContainer = (updatedContainer: Container) => {
    setContainers(prev => prev.map(c => 
      c.id === updatedContainer.id ? updatedContainer : c
    ));
  };

  const addRepairOrder = (order: RepairWorkOrder) => {
    setRepairOrders(prev => [order, ...prev]);
  };

  const updateRepairStatus = (id: string, status: RepairWorkOrder['status']) => {
    setRepairOrders(prev => prev.map(ro => 
      ro.id === id ? { ...ro, status } : ro
    ));
  };

  const saveData = () => {
    localStorage.setItem('depot_containers', JSON.stringify(containers));
    localStorage.setItem('depot_movements', JSON.stringify(movements));
    localStorage.setItem('depot_shipping_lines', JSON.stringify(shippingLines));
    localStorage.setItem('depot_repairs', JSON.stringify(repairOrders));
  };

  return (
    <ContainerContext.Provider value={{ 
      containers, 
      movements, 
      shippingLines,
      addContainers, 
      addContainer,
      addMovements, 
      addMovement,
      addShippingLine,
      deleteContainers, 
      updateContainerLine,
      updateContainer,
      repairOrders,
      addRepairOrder,
      updateRepairStatus,
      saveData
    }}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainers() {
  const context = useContext(ContainerContext);
  if (context === undefined) {
    throw new Error('useContainers must be used within a ContainerProvider');
  }
  return context;
}
