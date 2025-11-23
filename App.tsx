import React, { useState, useMemo } from 'react';
import SystemVisualizer from './components/SystemVisualizer';
import InfoPanel from './components/InfoPanel';
import ProcessFlowchart from './components/ProcessFlowchart';
import { LESSONS } from './constants';
import { Menu, ChevronRight, ChevronLeft, PlayCircle, Activity, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<string>(LESSONS[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLesson = useMemo(() => LESSONS.find(l => l.id === activeLessonId) || LESSONS[0], [activeLessonId]);
  const currentStep = activeLesson.steps[currentStepIndex];

  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    setCurrentStepIndex(0);
    setSelectedComponent(null);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const nextStep = () => {
    if (currentStepIndex < activeLesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans text-slate-200 bg-[#0b1121]">
      
      {/* Sidebar Navigation */}
      <div className={`${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col z-50 fixed md:relative h-full`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between h-16">
          <span className={`font-bold text-blue-400 text-lg tracking-wider ${!sidebarOpen && 'md:hidden'}`}>PRO<span className="text-white">UPS</span></span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
           {sidebarOpen ? (
             <>
               <div className="px-5 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theory 理论基础</div>
               {LESSONS.filter(l => l.category === 'principle').map(l => (
                 <button 
                   key={l.id}
                   onClick={() => handleLessonChange(l.id)}
                   className={`w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition border-l-2 ${activeLessonId === l.id ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400'}`}
                 >
                   <Activity size={16} />
                   <span className="text-sm">{l.title}</span>
                 </button>
               ))}
               
               <div className="px-5 mt-8 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Ops 实操演练</div>
               {LESSONS.filter(l => l.category === 'operation').map(l => (
                 <button 
                   key={l.id}
                   onClick={() => handleLessonChange(l.id)}
                   className={`w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition border-l-2 ${activeLessonId === l.id ? 'bg-slate-800 border-orange-500 text-white' : 'border-transparent text-slate-400'}`}
                 >
                   <PlayCircle size={16} />
                   <span className="text-sm">{l.title}</span>
                 </button>
               ))}
             </>
           ) : (
              <div className="flex flex-col items-center gap-6 mt-4">
                  <Activity size={24} className="text-slate-500" />
                  <PlayCircle size={24} className="text-slate-500" />
              </div>
           )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <div className="bg-slate-900 p-4 md:hidden flex items-center justify-between border-b border-slate-800">
            <h1 className="font-bold text-slate-200 truncate pr-4">{activeLesson.title}</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="text-slate-400"/></button>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden relative">
            
            {/* Left: Visualizer & Controls */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-w-[300px] custom-scrollbar">
                
                {/* Visualizer Area */}
                <div className="flex-shrink-0">
                    <SystemVisualizer 
                        state={currentStep.systemState} 
                        onHover={setSelectedComponent} 
                    />
                </div>

                {/* Controls & Instruction */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex-1 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${activeLesson.category === 'principle' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-orange-900/50 text-orange-400 border border-orange-800'}`}>
                                {activeLesson.category === 'principle' ? 'PRINCIPLE' : 'OPERATION'}
                            </span>
                            <span className="text-slate-500 text-sm font-mono">STEP {currentStepIndex + 1} / {activeLesson.steps.length}</span>
                        </div>
                        <div className="flex gap-3">
                             <button 
                                onClick={prevStep}
                                disabled={currentStepIndex === 0}
                                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-sm font-medium transition flex items-center gap-2"
                             >
                                <ChevronLeft size={16} /> PREV
                             </button>
                             <button 
                                onClick={nextStep}
                                disabled={currentStepIndex === activeLesson.steps.length - 1}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:bg-slate-700 text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-blue-900/20"
                             >
                                NEXT <ChevronRight size={16} />
                             </button>
                        </div>
                    </div>

                    {/* Flowchart for multi-step ops */}
                    {activeLesson.steps.length > 1 && (
                      <ProcessFlowchart steps={activeLesson.steps} currentStepIndex={currentStepIndex} />
                    )}

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 mt-2">{currentStep.title}</h2>
                    <p className="text-slate-300 leading-8 text-base md:text-lg max-w-4xl">{currentStep.description}</p>
                    
                    {currentStep.warning && (
                        <div className="mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm flex gap-3 items-start animate-pulse">
                            <AlertTriangle className="flex-shrink-0" />
                            <span className="font-bold">{currentStep.warning}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Info Panel */}
            <div className="w-full lg:w-96 flex-shrink-0 h-[500px] lg:h-auto">
                <InfoPanel 
                    selectedComponent={selectedComponent} 
                    onClose={() => setSelectedComponent(null)}
                    context={`Lesson: ${activeLesson.title}. Step: ${currentStep.title}. Description: ${currentStep.description}`}
                />
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;