import React from 'react';
import { motion } from 'framer-motion';
import { SystemState, UPSUnitState } from '../types';

interface Props {
  state: SystemState;
  onHover: (key: string | null) => void;
}

// --- ISO UTILS ---
// Simple isometric projection helper
// x: right-down, y: left-down, z: up
const iso = (x: number, y: number, z: number) => {
  const isoX = (x - y) * Math.cos(Math.PI / 6);
  const isoY = (x + y) * Math.sin(Math.PI / 6) - z;
  return `${isoX + 400},${isoY + 200}`; // Center offset
};

// --- COLORS ---
const C_OFF = '#334155'; // Slate 700
const C_MAINS = '#3b82f6'; // Blue 500
const C_BYPASS = '#f97316'; // Orange 500
const C_INV = '#22c55e'; // Green 500
const C_BAT = '#eab308'; // Yellow 500
const C_ALARM = '#ef4444'; // Red 500

const UnitBlock = ({ x, y, label, subLabel, active, color, onClick }: any) => {
  return (
    <g onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
      {/* Top Face */}
      <path d={`M${iso(x, y, 40)} L${iso(x+40, y, 40)} L${iso(x+40, y+40, 40)} L${iso(x, y+40, 40)} Z`} fill={active ? color : C_OFF} stroke="white" strokeWidth="1" fillOpacity="0.8" />
      {/* Side Face (Right) */}
      <path d={`M${iso(x+40, y, 40)} L${iso(x+40, y+40, 40)} L${iso(x+40, y+40, 0)} L${iso(x+40, y, 0)} Z`} fill={active ? color : C_OFF} stroke="none" filter="brightness(0.8)" />
      {/* Side Face (Left) */}
      <path d={`M${iso(x, y+40, 40)} L${iso(x+40, y+40, 40)} L${iso(x+40, y+40, 0)} L${iso(x, y+40, 0)} Z`} fill={active ? color : C_OFF} stroke="none" filter="brightness(0.6)" />
      
      {/* Icon/Text */}
      <text x={iso(x+20, y+20, 50).split(',')[0]} y={iso(x+20, y+20, 50).split(',')[1]} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" style={{textShadow: '1px 1px 2px black'}}>
        {label}
      </text>
       <text x={iso(x+20, y+20, 50).split(',')[0]} y={parseInt(iso(x+20, y+20, 50).split(',')[1]) + 12} textAnchor="middle" fill="white" fontSize="8" opacity="0.8">
        {subLabel}
      </text>
    </g>
  );
};

const Breaker = ({ x, y, z, closed, label, color = '#cbd5e1', onClick }: any) => {
  // Visual representation of a breaker switch
  const strokeColor = closed ? (label.includes('Q3') || label.includes('Q2') ? C_BYPASS : C_INV) : '#64748b';
  return (
    <g onClick={onClick} className="cursor-pointer group">
      <circle cx={iso(x, y, z).split(',')[0]} cy={iso(x, y, z).split(',')[1]} r="8" fill="#1e293b" stroke={strokeColor} strokeWidth="2" />
      <line 
        x1={iso(x-5, y, z).split(',')[0]} y1={iso(x-5, y, z).split(',')[1]}
        x2={iso(x+5, y, z).split(',')[0]} y2={iso(x+5, y, z).split(',')[1]}
        stroke={strokeColor} strokeWidth="2"
        transform={closed ? "" : `rotate(-45 ${iso(x, y, z).split(',').join(' ')})`}
        className="transition-transform duration-300"
      />
      <text x={iso(x, y, z).split(',')[0]} y={parseInt(iso(x, y, z).split(',')[1]) - 15} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{label}</text>
    </g>
  );
};

const Wire = ({ path, active, color, dashed = false, flow = false }: any) => {
  // path is array of [x,y,z]
  if (path.length < 2) return null;
  const d = path.map((p: number[], i: number) => (i === 0 ? 'M' : 'L') + iso(p[0], p[1], p[2])).join(' ');
  
  return (
    <>
      <path d={d} stroke="#334155" strokeWidth="4" fill="none" opacity="0.5" />
      <path 
        d={d} 
        stroke={active ? color : 'none'} 
        strokeWidth="2" 
        fill="none" 
        strokeDasharray={dashed ? "4,4" : "none"} 
      />
      {active && flow && (
        <path 
            d={d} 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="4,8" 
            strokeOpacity="0.8"
            className="animate-flow-fast" // Defined in global CSS
        />
      )}
    </>
  );
};

const SingleUnitView = ({ state, unit, onHover }: { state: SystemState, unit: UPSUnitState, onHover: any }) => {
    // Layout Coordinates
    // Input Left
    // Output Right
    
    // Mains Path
    const pMains = [[-100,0,0], [0,0,0]]; // To Q1
    const pQ1ToRect = [[0,0,0], [50,0,0]];
    const pRectToInv = [[100,0,0], [150,0,0]]; // DC Bus
    const pInvToOut = [[200,0,0], [250,0,0]];
    const pOutToQ4 = [[250,0,0], [300,0,0]];
    const pQ4ToLoad = [[300,0,0], [400,0,0]];

    // Bypass Path
    const pBypassIn = [[-100,80,0], [0,80,0]]; // To Q2
    const pQ2ToStatic = [[0,80,0], [200,80,0]];
    const pStaticToOut = [[200,80,0], [250,80,0], [250,0,0]]; // Merges after Static SW

    // Battery Path
    const pBatToBreaker = [[125,150,0], [125,100,0]];
    const pBreakerToBus = [[125,100,0], [125,0,0]]; // Merges at DC Bus (approx x=125)

    // Maint Bypass Path (Wrap around)
    const pMaintIn = [[-100, -80, 0], [0, -80, 0]]; // To Q3
    const pQ3ToLoad = [[0, -80, 0], [350, -80, 0], [350, 0, 0]]; // Merges after Q4

    // Determine Load Color based on source
    const loadColor = state.loadSource === 'INVERTER' ? C_INV : (state.loadSource === 'BYPASS' || state.loadSource === 'MAINT') ? C_BYPASS : '#475569';

    return (
        <>
             {/* --- WIRES --- */}
             {/* Mains */}
             <Wire path={pMains} active={state.mainsAvailable} color={C_MAINS} flow={state.mainsAvailable} />
             <Wire path={pQ1ToRect} active={state.mainsAvailable && unit.q1Input} color={C_MAINS} flow={state.mainsAvailable && unit.q1Input} />
             
             {/* DC Bus */}
             <Wire path={pRectToInv} active={unit.rectifierOn} color={C_INV} flow={unit.rectifierOn} />
             <Wire path={pBatToBreaker} active={true} color={C_BAT} />
             <Wire path={pBreakerToBus} active={unit.q5Battery && (unit.rectifierOn || unit.batteryConnected)} color={C_BAT} flow={unit.q5Battery && !unit.rectifierOn} />

             {/* Inverter Out */}
             <Wire path={pInvToOut} active={unit.inverterOn} color={C_INV} flow={unit.inverterOn} />
             <Wire path={pOutToQ4} active={unit.inverterOn} color={C_INV} flow={unit.inverterOn} />

             {/* Bypass */}
             <Wire path={pBypassIn} active={state.mainsAvailable} color={C_BYPASS} />
             <Wire path={pQ2ToStatic} active={state.mainsAvailable && unit.q2Bypass} color={C_BYPASS} flow={state.mainsAvailable && unit.q2Bypass} />
             <Wire path={pStaticToOut} active={unit.staticBypassOn} color={C_BYPASS} flow={unit.staticBypassOn} />

             {/* Maint Bypass */}
             <Wire path={pMaintIn} active={state.mainsAvailable} color={C_BYPASS} dashed />
             <Wire path={pQ3ToLoad} active={state.mainsAvailable && state.q3MaintBypass} color={C_BYPASS} flow={state.mainsAvailable && state.q3MaintBypass} />

             {/* Load */}
             {/* Q4 to Load logic: Powered if Q4 is closed AND (Inverter is On OR Static Bypass is On) OR Maint Bypass is On */}
             <Wire path={pQ4ToLoad} active={(unit.q4Output && (unit.inverterOn || unit.staticBypassOn)) || (state.q3MaintBypass && state.mainsAvailable)} color={loadColor} flow={state.loadPowered} />


             {/* --- COMPONENTS --- */}
             <Breaker x={0} y={0} z={10} closed={unit.q1Input} label="Q1 Input" onClick={() => onHover('Q1')} />
             <UnitBlock x={50} y={-20} label="RECT" subLabel="AC/DC" active={unit.rectifierOn} color={C_INV} onClick={() => onHover('RECTIFIER')} />
             
             <Breaker x={125} y={100} z={10} closed={unit.q5Battery} label="Q5 Bat" onClick={() => onHover('Q5')} />
             <UnitBlock x={105} y={140} label="BATTERY" subLabel="DC Source" active={true} color={C_BAT} onClick={() => onHover('BATTERY')} />
             
             <UnitBlock x={150} y={-20} label="INV" subLabel="DC/AC" active={unit.inverterOn} color={C_INV} onClick={() => onHover('INVERTER')} />
             
             <Breaker x={0} y={80} z={10} closed={unit.q2Bypass} label="Q2 Byp" onClick={() => onHover('Q2')} />
             <UnitBlock x={200} y={60} label="STS" subLabel="SCR" active={unit.staticBypassOn} color={C_BYPASS} onClick={() => onHover('STATIC_SW')} />

             <Breaker x={0} y={-80} z={10} closed={state.q3MaintBypass} label="Q3 Maint" onClick={() => onHover('Q3')} />

             <Breaker x={300} y={0} z={10} closed={unit.q4Output} label="Q4 Out" onClick={() => onHover('Q4')} />

             {/* Load Block */}
             <g transform={`translate(${iso(400,0,0)})`} onClick={() => onHover('LOAD')}>
                <path d="M0,0 L40,20 L0,40 L-40,20 Z" fill={state.loadPowered ? loadColor : '#475569'} stroke="white" strokeWidth="2" />
                <path d="M0,0 L0,-40" stroke={state.loadPowered ? loadColor : '#475569'} strokeWidth="4" />
                <text y="-50" textAnchor="middle" fill="white" fontWeight="bold">LOAD</text>
             </g>
        </>
    )
}

const ParallelView = ({ state, onHover }: { state: SystemState, onHover: any }) => {
  // Simplified representation for 2 units
  // Unit A: x=0, y=0. Unit B: x=0, y=100
  
  const uA = state.unitA;
  const uB = state.unitB!; // Assume exists in parallel mode

  const activeA = uA.q4Output && (uA.inverterOn || uA.staticBypassOn);
  const activeB = uB.q4Output && (uB.inverterOn || uB.staticBypassOn);
  
  const loadColor = state.loadSource === 'INVERTER' ? C_INV : (state.loadSource === 'BYPASS' || state.loadSource === 'MAINT') ? C_BYPASS : '#475569';

  return (
    <>
       {/* Common Input Bus */}
       <Wire path={[[-100, 50, 0], [-50, 50, 0]]} active={state.mainsAvailable} color={C_MAINS} />
       {/* Split to A & B */}
       <Wire path={[[-50, 50, 0], [-50, 0, 0], [0, 0, 0]]} active={state.mainsAvailable} color={C_MAINS} flow={state.mainsAvailable} />
       <Wire path={[[-50, 50, 0], [-50, 100, 0], [0, 100, 0]]} active={state.mainsAvailable} color={C_MAINS} flow={state.mainsAvailable} />

       {/* Unit A Block */}
       <UnitBlock x={0} y={-20} label="UPS A" subLabel={uA.inverterOn ? "Online" : "Bypass/Off"} active={uA.inverterOn} color={uA.inverterOn ? C_INV : uA.staticBypassOn ? C_BYPASS : C_OFF} onClick={() => onHover('RECTIFIER')} />
       <Breaker x={-20} y={0} z={0} closed={uA.q1Input} label="Q1" />
       <Breaker x={70} y={0} z={0} closed={uA.q4Output} label="Q4" />
       
       {/* Unit B Block */}
       <UnitBlock x={0} y={80} label="UPS B" subLabel={uB.inverterOn ? "Online" : "Bypass/Off"} active={uB.inverterOn} color={uB.inverterOn ? C_INV : uB.staticBypassOn ? C_BYPASS : C_OFF} onClick={() => onHover('RECTIFIER')} />
       <Breaker x={-20} y={100} z={0} closed={uB.q1Input} label="Q1" />
       <Breaker x={70} y={100} z={0} closed={uB.q4Output} label="Q4" />

       {/* Output Bus */}
       <Wire path={[[70,0,0], [150,0,0], [150,50,0]]} active={activeA} color={loadColor} flow={activeA} />
       <Wire path={[[70,100,0], [150,100,0], [150,50,0]]} active={activeB} color={loadColor} flow={activeB} />
       
       {/* Load Feed */}
       <Wire path={[[150,50,0], [250,50,0]]} active={activeA || activeB} color={loadColor} flow={state.loadPowered} />

       {/* Load */}
       <g transform={`translate(${iso(250,50,0)})`}>
            <path d="M0,0 L40,20 L0,40 L-40,20 Z" fill={state.loadPowered ? loadColor : '#475569'} stroke="white" strokeWidth="2" />
            <text y="-20" textAnchor="middle" fill="white" fontWeight="bold">LOAD</text>
       </g>
    </>
  )
}

const SystemVisualizer: React.FC<Props> = ({ state, onHover }) => {
  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative select-none shadow-2xl">
      <div className="absolute top-4 left-4 text-slate-400 text-xs font-mono">
        <div>SYSTEM STATUS: {state.loadPowered ? <span className="text-green-400">NORMAL</span> : <span className="text-red-500">CRITICAL</span>}</div>
        <div>SOURCE: {state.loadSource}</div>
        <div>VIEW: {state.viewMode}</div>
      </div>

      <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <defs>
           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="2" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
           </filter>
        </defs>
        
        {/* Grid Background */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
           <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform="translate(0, 50)">
            {state.viewMode === 'SINGLE' ? (
                <SingleUnitView state={state} unit={state.unitA} onHover={onHover} />
            ) : (
                <ParallelView state={state} onHover={onHover} />
            )}
        </g>
      </svg>
      
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs text-slate-500">
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div>Mains</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>Inverter</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div>Bypass</div>
      </div>
    </div>
  );
};

export default SystemVisualizer;