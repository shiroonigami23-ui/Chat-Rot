import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  RotateCcw, 
  Sliders,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface QuotaData {
  currentRpm: number;
  maxRpm: number;
  dailyRequestsUsed: number;
  dailyRequestsLimit: number;
  tokensUsedToday: number;
  dailyTokenLimit: number;
  rpmHistory: number[];
  quotaResetSeconds: number;
  status: 'OPTIMAL' | 'WARNING' | 'THROTTLED';
  utilizationPct: number;
  activeRequests: number;
}

export const RateLimitGauge: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<QuotaData>({
    currentRpm: 24,
    maxRpm: 120,
    dailyRequestsUsed: 1840,
    dailyRequestsLimit: 10000,
    tokensUsedToday: 48920,
    dailyTokenLimit: 250000,
    rpmHistory: [14, 18, 22, 29, 35, 42, 28, 21, 31, 24],
    quotaResetSeconds: 2450,
    status: 'OPTIMAL',
    utilizationPct: 20,
    activeRequests: 48,
  });

  const [isSpiking, setIsSpiking] = useState<boolean>(false);

  const fetchQuotas = async () => {
    try {
      const res = await fetch('/api/v1/telemetry/quotas');
      const json = await res.json();
      if (json.success && json.telemetry) {
        setData(json.telemetry);
      }
    } catch (err) {
      console.error('Failed to fetch quota telemetry:', err);
    }
  };

  useEffect(() => {
    fetchQuotas();
    const interval = setInterval(fetchQuotas, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSpike = async () => {
    setIsSpiking(true);
    try {
      await fetch('/api/v1/telemetry/simulate-spike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spikeAmount: 35 }),
      });
      await fetchQuotas();
    } catch (err) {
      console.error('Failed to simulate spike:', err);
    } finally {
      setTimeout(() => setIsSpiking(false), 500);
    }
  };

  const handleResetQuota = () => {
    setData((prev) => ({
      ...prev,
      currentRpm: 18,
      status: 'OPTIMAL',
      utilizationPct: 15,
      rpmHistory: [10, 12, 14, 15, 18, 20, 19, 16, 17, 18],
    }));
  };

  const utilizationColor =
    data.status === 'THROTTLED'
      ? 'text-rose-500 bg-rose-500'
      : data.status === 'WARNING'
      ? 'text-amber-500 bg-amber-500'
      : 'text-emerald-500 bg-emerald-500';

  const maxHistoryValue = Math.max(...data.rpmHistory, data.maxRpm, 50);

  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-2xl border transition-colors shadow-xl ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono mb-1">
            <Activity className="w-4 h-4" />
            <span className="font-bold tracking-wider">LIVE TRAFFIC &amp; RATE LIMIT TELEMETRY</span>
          </div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Real-Time Quota &amp; Concurrency Monitor
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Protects against API starvation, provides load visualization, and enforces per-tier limits.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Health status badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center space-x-1.5 ${
            data.status === 'OPTIMAL'
              ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : data.status === 'WARNING'
              ? isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
              : isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${data.status === 'OPTIMAL' ? 'bg-emerald-500 animate-pulse' : data.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500 animate-ping'}`} />
            <span>{data.status} ({data.utilizationPct}% CAPACITY)</span>
          </span>

          {/* Spike Simulation button */}
          <button
            onClick={handleSimulateSpike}
            disabled={isSpiking}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Simulate burst traffic to test rate limiter reaction"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isSpiking ? 'Spiking...' : 'Simulate Spike'}</span>
          </button>

          <button
            onClick={handleResetQuota}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Reset telemetry counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Metric 1: Real-time RPM Gauge */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Requests / Minute (RPM)</span>
              <span className="font-bold text-indigo-500">{data.currentRpm} / {data.maxRpm} RPM</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-800/40 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.utilizationPct > 85 ? 'bg-rose-500' : data.utilizationPct > 65 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, data.utilizationPct)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Buffer Headroom: {Math.max(0, data.maxRpm - data.currentRpm)} RPM</span>
            <span className={data.utilizationPct > 85 ? 'text-rose-400' : 'text-emerald-400'}>
              {100 - data.utilizationPct}% Available
            </span>
          </div>
        </div>

        {/* Metric 2: Daily Requests Quota */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>24-Hour Request Quota</span>
              <span className="font-bold text-indigo-500">{data.dailyRequestsUsed.toLocaleString()} / {data.dailyRequestsLimit.toLocaleString()}</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (data.dailyRequestsUsed / data.dailyRequestsLimit) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Resets in: ~41 min</span>
            <span className="text-emerald-400">{Math.round((data.dailyRequestsUsed / data.dailyRequestsLimit) * 100)}% Used</span>
          </div>
        </div>

        {/* Metric 3: Token Consumption */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Daily Token Allowance</span>
              <span className="font-bold text-indigo-500">{data.tokensUsedToday.toLocaleString()} / {data.dailyTokenLimit.toLocaleString()}</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (data.tokensUsedToday / data.dailyTokenLimit) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Estimated Cost: $0.00 (Free Capstone Tier)</span>
            <span className="text-violet-400">{Math.round((data.tokensUsedToday / data.dailyTokenLimit) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Real-Time Request Velocity Sparkline (Last 10 Intervals) */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Traffic Velocity (Requests / Interval over Last 10 Minutes)</span>
          </span>
          <span className="text-[11px] text-slate-400">Sample window: 60s per bar</span>
        </div>

        <div className="h-24 flex items-end justify-between gap-2 pt-2 px-1">
          {data.rpmHistory.map((val, idx) => {
            const heightPct = Math.max(12, Math.round((val / maxHistoryValue) * 100));
            const isSpike = val >= 40;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 px-1.5 py-0.5 rounded bg-black text-[9px] text-white font-mono pointer-events-none z-10 whitespace-nowrap">
                  {val} RPM
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isSpike ? 'bg-indigo-500 shadow-md shadow-indigo-500/30' : 'bg-slate-700/60 hover:bg-slate-600'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-1">-{10 - idx}m</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
