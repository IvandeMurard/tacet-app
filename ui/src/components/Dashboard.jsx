import React, { useState, useEffect } from 'react';
import { Shield, Zap, Activity, Radio, Target, Bell, Info } from 'lucide-react';
import './Dashboard.css';

const MOCK_ALERTS = [
  {
    id: 1,
    source: "EXTREME_WEATHER (HEATWAVE)",
    severity: "CRITICAL",
    db: null,
    dist: 0,
    rec: "Activate heatwave protocol. Recommend increasing prices for AC-equipped rooms.",
    chain: ["Weather Data: Extreme Heatwave predicted. Red Alert."]
  },
  {
    id: 2,
    source: "TRANSIT_STRIKE",
    severity: "HIGH",
    db: null,
    dist: 0,
    rec: "Major transport disruption. Recommend pushing 'Staycation' packages to locals.",
    chain: ["Transit Data: RATP Metro Line 1 - Planned Strike"]
  },
  {
    id: 3,
    source: "PLANNED_CONSTRUCTION",
    severity: "MEDIUM",
    db: 47.6,
    dist: 23,
    rec: "Monitor guest sentiment. Yield impact negligible. Consider offering complimentary amenities.",
    chain: ["Base Noise: 90.0 dB", "Distance Attenuation: 23m removed 27.4 dB", "Ray-Tracing Penalty: -15.0 dB (Blocked by geometry)", "Final Predicted Impact: 47.6 dB"]
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('raw');
  const [memoryActive, setMemoryActive] = useState(false);

  // Simulate Aetherix memory loop
  useEffect(() => {
    const timer = setTimeout(() => {
      setMemoryActive(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const alertsToShow = memoryActive ? MOCK_ALERTS.slice(0, 2) : MOCK_ALERTS;

  return (
    <div className="dashboard-layout">
      {/* Sidebar: Aetherix Feed */}
      <aside className="sidebar glass-panel flex-col gap-6">
        <div className="header flex-row justify-between items-center">
          <div className="flex-row items-center gap-2">
            <Radio size={20} color="var(--accent-gold)" />
            <h1 className="text-xl">AETHERIX</h1>
          </div>
          <span className="pulse-badge"></span>
        </div>
        
        <div className="feed flex-col gap-4">
          <h2 className="text-xs text-muted">Operational Intel Feed</h2>
          
          <div className="alerts-list flex-col gap-4">
            {alertsToShow.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.severity.toLowerCase()}`}>
                <div className="alert-header flex-row justify-between items-center">
                  <span className="text-sm font-semibold">{alert.source}</span>
                  <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                </div>
                {alert.db && (
                  <div className="alert-metric text-xs text-muted mt-2">
                    Predicted Impact: <span className="highlight">{alert.db} dB</span> at {alert.dist}m
                  </div>
                )}
                <div className="alert-body text-sm mt-2">
                  <p>{alert.rec}</p>
                </div>
                <div className="alert-chain text-xs mt-3">
                  <div className="flex-row items-center gap-1 text-muted mb-1">
                    <Info size={12} /> Tacet Physics Chain
                  </div>
                  <ul>
                    {alert.chain.map((link, i) => (
                      <li key={i}>{link}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {memoryActive && (
            <div className="memory-alert glass-panel">
              <div className="flex-row items-center gap-2 mb-2 text-success">
                <Shield size={16} />
                <span className="text-sm font-semibold">Autonomous Feedback Applied</span>
              </div>
              <p className="text-xs text-muted">Aetherix observed PMS stagnation. Deduced false positive for construction. Tacet Idiosyncratic Memory updated (+15dB shielding). Alert suppressed.</p>
            </div>
          )}

        </div>
      </aside>

      {/* Main Stage: Ray-Tracing Map */}
      <main className="main-stage">
        <div className="map-container">
          {/* Abstract Map Visualization */}
          <div className="grid-overlay"></div>
          
          {/* Hotel Node */}
          <div className="node hotel-node">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="node-center">
              <Shield size={24} color="#fff" />
            </div>
            <span className="node-label">Hotel Vendôme</span>
          </div>

          {/* Construction Node */}
          <div className={`node source-node ${memoryActive ? 'suppressed' : ''}`} style={{ top: '20%', right: '20%' }}>
            <div className="node-center source">
              <Activity size={20} color="#fff" />
            </div>
            <span className="node-label">Construction</span>
            
            {/* Rays */}
            <div className="rays-container">
              <div className={`ray ${memoryActive ? 'blocked' : ''}`}></div>
            </div>
          </div>

          {/* Geometric Blocker */}
          <div className="building-blocker"></div>

          {/* Data Overlay */}
          <div className="hud-overlay top-right glass-panel">
            <h3 className="text-xs text-muted mb-2">TACET SENSORY NODE</h3>
            <div className="stat-row flex-row justify-between mb-1">
              <span className="text-sm">Buildings Analyzed</span>
              <span className="text-sm font-semibold">1,155</span>
            </div>
            <div className="stat-row flex-row justify-between mb-1">
              <span className="text-sm">Ray Traces</span>
              <span className="text-sm font-semibold">5</span>
            </div>
            <div className="stat-row flex-row justify-between">
              <span className="text-sm">Processing Time</span>
              <span className="text-sm font-semibold">15ms</span>
            </div>
          </div>

          {memoryActive && (
            <div className="hud-overlay bottom-right glass-panel memory-stats">
              <h3 className="text-xs text-muted mb-2 flex-row items-center gap-1">
                <Zap size={14} color="var(--accent-gold)" /> IDIOSYNCRATIC MEMORY
              </h3>
              <div className="stat-row flex-row justify-between">
                <span className="text-sm">Hotel Shielding Bonus</span>
                <span className="text-sm font-semibold text-success">+15.0 dB</span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
