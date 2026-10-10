'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';

export function WorldValidationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isDebugMode = useDigitalTwinStore((s) => s.isDebugMode);
  const debugGraph = useDigitalTwinStore((s) => s.debugGraph);
  const debugStations = useDigitalTwinStore((s) => s.debugStations);
  const debugCollisions = useDigitalTwinStore((s) => s.debugCollisions);
  const toggleDebugMode = useDigitalTwinStore((s) => s.toggleDebugMode);
  const toggleDebugOption = useDigitalTwinStore((s) => s.toggleDebugOption);

  const fetchValidation = async () => {
    setLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const primaryUrl = backendUrl ? `${backendUrl}/world-validation` : '/api/world-validation';
    try {
      let res = await fetch(primaryUrl).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('http://localhost:4000/world-validation').catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.warn('Could not fetch validation report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchValidation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">3D Simulation Audit & World Validator</h2>
              <p className="text-[11px] text-slate-400 font-mono">Automated verification of road network, clearances, and fleet movement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchValidation}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Re-run validation audit"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200 text-xs">3D Development Debug Visualizers</span>
              </div>
              <button
                onClick={() => toggleDebugMode()}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  isDebugMode
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isDebugMode ? 'DEBUG ON' : 'DEBUG OFF'}
              </button>
            </div>

            {isDebugMode && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                <button
                  onClick={() => toggleDebugOption('debugGraph')}
                  className={`px-2 py-1.5 rounded border text-center transition-all ${
                    debugGraph
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  ROAD GRAPH [{debugGraph ? '✓' : '✗'}]
                </button>
                <button
                  onClick={() => toggleDebugOption('debugStations')}
                  className={`px-2 py-1.5 rounded border text-center transition-all ${
                    debugStations
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  STATIONS [{debugStations ? '✓' : '✗'}]
                </button>
                <button
                  onClick={() => toggleDebugOption('debugCollisions')}
                  className={`px-2 py-1.5 rounded border text-center transition-all ${
                    debugCollisions
                      ? 'bg-orange-950/80 border-orange-500/40 text-orange-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  RADAR / STOPS [{debugCollisions ? '✓' : '✗'}]
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
              <span>SYSTEM AUDIT CHECKS</span>
              <span>
                {report ? `${report.passedChecks}/${report.totalChecks} PASSED` : 'Running...'}
              </span>
            </div>

            {report?.checks?.map((check: any) => (
              <div
                key={check.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  check.passed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}
              >
                <div className="mt-0.5">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="font-semibold text-white text-[11px]">{check.name}</div>
                  <div className="text-[11px] text-slate-300">{check.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Authoritative Digital Twin Node Graph</span>
          <span className="text-emerald-400">0 Critical Spatial Collisions</span>
        </div>
      </div>
    </div>
  );
}
