'use client';

import React, { useState } from 'react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { socketService } from '../services/socket';
import { 
  Play, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  BatteryCharging, 
  Zap, 
  Truck, 
  X 
} from 'lucide-react';

export function DemoScenarioWizard() {
  const isScenarioDrawerOpen = useDigitalTwinStore((s) => s.isScenarioDrawerOpen);
  const toggleScenarioDrawer = useDigitalTwinStore((s) => s.toggleScenarioDrawer);
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode);

  const [currentStep, setCurrentStep] = useState(0);

  const scenarioSteps = [
    {
      step: 1,
      title: 'Baseline State: EV-024 En Route',
      description: 'Tata Nexon EV (EV-024) driving along Boisar–Palghar Road at 64% battery. Substation operating nominal at 68%.',
      actionLabel: 'Select EV-024 & Focus Camera',
      action: () => {
        selectVehicle('veh-ev-024');
      },
    },
    {
      step: 2,
      title: 'Trigger Low Battery',
      description: 'EV-024 battery drops to 18%. EVNEXUS detects low SOC and initiates multi-factor charging hub evaluation.',
      actionLabel: 'Trigger Low Battery (18%)',
      action: () => {
        socketService.triggerLowBattery('EV-024', 18);
      },
    },
    {
      step: 3,
      title: 'Smart Routing Evaluation',
      description: 'Station A102 is congested (20 min wait, 95% load). System recommends Station B104 (4 min wait, 61% load) saving 16 minutes.',
      actionLabel: 'Execute Reroute to B104',
      action: () => {
        const target = useDigitalTwinStore.getState().stations.find(s => s.code === 'B104');
        if (target) {
          socketService.rerouteVehicle('veh-ev-024', target.id);
        }
      },
    },
    {
      step: 4,
      title: 'Trigger Station Hardware Fault',
      description: 'Charger A102-01 trips due to silicon-carbide inverter thermal limit. System flags critical fault.',
      actionLabel: 'Trip A102 Charger',
      action: () => {
        socketService.triggerFault('A102');
      },
    },
    {
      step: 5,
      title: 'Trigger Grid Energy Surge',
      description: 'Substation load surges from 68% to 91% (4.55 MW). EVNEXUS displays ⚠ GRID OVERLOAD RISK and recommends load redistribution.',
      actionLabel: 'Trigger Energy Surge',
      action: () => {
        socketService.triggerEnergySurge(true);
      },
    },
    {
      step: 6,
      title: 'Trigger EV Thermal Fault',
      description: 'EV-024 motor hits 92°C with battery at 42°C. Vehicle status transitions to FAULT DETECTED -> SERVICE REQUIRED.',
      actionLabel: 'Trip EV-024 Motor (92°C)',
      action: () => {
        socketService.triggerEVFault('EV-024');
      },
    },
    {
      step: 7,
      title: 'Automated Service Dispatch',
      description: 'EVNEXUS calculates nearest facility: S03 Tarapur EV Diagnostics (2.4 km away, 3 bays available). Vehicle dispatches.',
      actionLabel: 'Dispatch to S03 Service Center',
      action: () => {
        socketService.sendToService('veh-ev-024');
        setCameraMode('SERVICE');
      },
    },
    {
      step: 8,
      title: 'Bay Diagnosis & Repair Simulation',
      description: 'EV-024 arrives at S03 and enters Repair Bay #2. Status changes to UNDER REPAIR. Technicians initiate thermal busbar service.',
      actionLabel: 'Advance Repair to 100%',
      action: () => {
        socketService.completeRepair('EV-024');
      },
    },
    {
      step: 9,
      title: 'Return to Road Network',
      description: 'EV-024 certified HEALTHY and READY. Motor temp cools to 55°C. Vehicle drives out and rejoins the Boisar road network.',
      actionLabel: 'Return EV-024 to Road',
      action: () => {
        socketService.returnToRoad('EV-024');
        setCameraMode('CITY');
      },
    },
  ];

  if (!isScenarioDrawerOpen) return null;

  const current = scenarioSteps[currentStep] || scenarioSteps[0];

  const handleNext = () => {
    current.action();
    if (currentStep < scenarioSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    socketService.resetSimulation();
    setCurrentStep(0);
  };

  return (
    <div className="fixed bottom-20 left-64 z-40 w-96 select-none pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#111827]/98 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-500/50 text-slate-200 font-sans text-xs ring-1 ring-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Demo Scenario: End-to-End Boisar Lifecycle
            </h3>
          </div>
          <button
            onClick={() => toggleScenarioDrawer(false)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/60 font-mono text-[10px]">
          <span className="text-blue-400 font-bold">
            STEP {current.step} OF {scenarioSteps.length}
          </span>
          <span className="text-slate-400">
            {Math.round(((currentStep + 1) / scenarioSteps.length) * 100)}% Complete
          </span>
        </div>

        {/* Step Content */}
        <div className="py-3">
          <h4 className="text-xs font-bold text-white mb-1">
            {current.title}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleNext}
            className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-900/40"
          >
            <span>{current.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset Scenario"
            className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
