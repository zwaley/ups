import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Battery, Zap, AlertTriangle, Settings, Power } from 'lucide-react';

interface IsoDiagramProps {
  state: {
    mainsInput: boolean;
    rectifier: boolean;
    battery: boolean;
    inverter: boolean;
    staticBypass: boolean;
    maintBypass: boolean;
    output: boolean;
    breakers: { Q1: boolean; Q2: boolean; Q3: boolean; Q4: boolean; Q5: boolean; }
  };
  onComponentClick: (key: string) => void;
}

const IsoDiagram: React.FC<IsoDiagramProps> = ({ state, onComponentClick }) => {
  
  // Helper for conditional stroke color
  const getLineColor = (active: boolean) => active ? '#22c55e' : '#94a3b8'; // green-500 : slate-400
  const getFlowClass = (active: boolean) => active ? 'animate-flow' : '';

  return (
    <div className="relative w-full h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center perspective-[1200px] select-none shadow-inner">
      
      {/* 2.5D Container */}
      <div className="relative w-[800px] h-[400px]" style={{ transform: 'rotateX(30deg) rotateY(0deg) scale(0.9)' }}>
        
        {/* SVG Layer for Connections (Underneath blocks) */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ transform: 'translateZ(-10px)' }}>
           
           {/* Mains (Q1) -> Rectifier */}
           <path d="M100,100 L200,100" stroke={getLineColor(state.mainsInput)} strokeWidth="6" className={getFlowClass(state.mainsInput)} strokeDasharray="10 5" fill="none" />
           
           {/* Bypass Input (Q2) -> Static Bypass */}
           <path d="M100,200 L350,200 L350,150" stroke={getLineColor(state.staticBypass)} strokeWidth="4" className={getFlowClass(state.staticBypass)} strokeDasharray="10 5" fill="none" />
           
           {/* Rectifier -> DC Bus -> Inverter */}
           <path d="M300,100 L400,100" stroke={getLineColor(state.rectifier)} strokeWidth="6" className={getFlowClass(state.rectifier)} strokeDasharray="10 5" fill="none" />
           
           {/* Battery -> DC Bus */}
           <path d="M350,300 L350,100" stroke={getLineColor(state.battery)} strokeWidth="6" className={getFlowClass(state.battery)} strokeDasharray="10 5" fill="none" />

           {/* Inverter -> Static Switch */}
           <path d="M500,100 L550,100 L550,150" stroke={getLineColor(state.inverter)} strokeWidth="6" className={getFlowClass(state.inverter)} strokeDasharray="10 5" fill="none" />

           {/* Static Switch -> Output (Q4) */}
           <path d="M550,200 L650,200" stroke={getLineColor(state.output)} strokeWidth="6" className={getFlowClass(state.output)} strokeDasharray="10 5" fill="none" />
           
           {/* Maintenance Bypass (Q3) Path - OVER RIDE */}
           <path d="M100,50 L650,50 L650,200" stroke={getLineColor(state.maintBypass)} strokeWidth="8" strokeOpacity="0.5" className={getFlowClass(state.maintBypass)} strokeDasharray="15 5" fill="none" />

        </svg>

        {/* --- BLOCKS (Z-Indexed for 3D feel) --- */}

        {/* Input Mains */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[70px] left-[20px] w-20 h-20 flex flex-col items-center justify-center rounded-lg shadow-lg border-2 z-10 cursor-pointer bg-white ${state.breakers.Q1 ? 'border-green-500' : 'border-gray-400'}`}
            onClick={() => onComponentClick("Q1")}
        >
            <Power size={24} className={state.breakers.Q1 ? 'text-green-600' : 'text-gray-400'} />
            <span className="text-xs font-bold mt-1">市电 Q1</span>
        </motion.div>

        {/* Rectifier */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[60px] left-[200px] w-24 h-24 flex flex-col items-center justify-center rounded-xl shadow-xl border-b-4 z-20 cursor-pointer transition-colors ${state.rectifier ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-100 border-gray-400 text-gray-400'}`}
            onClick={() => onComponentClick("rectifier")}
        >
            <Settings size={32} className="mb-1" />
            <span className="text-xs font-bold">整流器</span>
            <span className="text-[10px]">AC-DC</span>
        </motion.div>

        {/* Battery */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[280px] left-[300px] w-24 h-20 flex flex-col items-center justify-center rounded-xl shadow-xl border-b-4 z-20 cursor-pointer transition-colors ${state.battery && !state.mainsInput ? 'bg-amber-50 border-amber-500 text-amber-600' : state.battery ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-100 border-gray-400 text-gray-400'}`}
            onClick={() => onComponentClick("battery")}
        >
            <Battery size={32} className="mb-1" />
            <span className="text-xs font-bold">电池组 Q5</span>
        </motion.div>

        {/* Inverter */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[60px] left-[400px] w-24 h-24 flex flex-col items-center justify-center rounded-xl shadow-xl border-b-4 z-20 cursor-pointer transition-colors ${state.inverter ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-gray-100 border-gray-400 text-gray-400'}`}
            onClick={() => onComponentClick("inverter")}
        >
            <Activity size={32} className="mb-1" />
            <span className="text-xs font-bold">逆变器</span>
            <span className="text-[10px]">DC-AC</span>
        </motion.div>

        {/* Static Bypass Switch */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[160px] left-[520px] w-20 h-20 flex flex-col items-center justify-center rounded-lg shadow-lg border-2 z-10 cursor-pointer bg-white ${state.staticBypass ? 'border-orange-500 shadow-orange-200' : 'border-gray-300'}`}
            onClick={() => onComponentClick("staticBypass")}
        >
            <Zap size={24} className={state.staticBypass ? 'text-orange-500' : 'text-gray-300'} />
            <span className="text-xs font-bold mt-1 text-center">静态<br/>旁路</span>
        </motion.div>

        {/* Maintenance Bypass (Q3) */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[-20px] left-[350px] w-32 h-16 flex flex-row items-center justify-center rounded-lg shadow-lg border-2 z-30 cursor-pointer bg-white ${state.breakers.Q3 ? 'border-red-600 bg-red-50' : 'border-gray-300'}`}
            onClick={() => onComponentClick("maintBypass")}
        >
            <AlertTriangle size={20} className={state.breakers.Q3 ? 'text-red-600' : 'text-gray-400'} />
            <span className="text-xs font-bold ml-2">维修旁路 Q3</span>
        </motion.div>

        {/* Output Load */}
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`absolute top-[170px] left-[650px] w-28 h-28 flex flex-col items-center justify-center rounded-full shadow-2xl border-4 z-20 cursor-pointer transition-colors ${state.output ? 'bg-green-100 border-green-500 text-green-800' : 'bg-gray-200 border-gray-400 text-gray-500'}`}
            onClick={() => onComponentClick("load")}
        >
            <div className={`w-3 h-3 rounded-full mb-2 ${state.output ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-black">负载</span>
            <span className="text-xs">Q4 输出</span>
        </motion.div>

      </div>

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-2 rounded text-xs text-slate-500">
        点击组件查看详情
      </div>
    </div>
  );
};

export default IsoDiagram;