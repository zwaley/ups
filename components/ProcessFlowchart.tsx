import React from 'react';
import { Check, Circle, ChevronRight } from 'lucide-react';
import { LessonStep } from '../types';

interface Props {
  steps: LessonStep[];
  currentStepIndex: number;
}

const ProcessFlowchart: React.FC<Props> = ({ steps, currentStepIndex }) => {
  return (
    <div className="w-full overflow-x-auto py-4 mb-4 custom-scrollbar bg-slate-900/50 rounded-lg border border-slate-800">
      <div className="flex items-center min-w-max px-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Connector Line */}
              {idx > 0 && (
                <div className={`w-8 h-0.5 mx-2 ${isPending ? 'bg-slate-700' : 'bg-blue-500/50'}`} />
              )}

              {/* Step Node */}
              <div className={`relative flex flex-col items-center group min-w-[120px]`}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                    ${isCompleted ? 'bg-blue-900 border-blue-500 text-blue-400' : ''}
                    ${isCurrent ? 'bg-blue-600 border-white text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : ''}
                    ${isPending ? 'bg-slate-800 border-slate-600 text-slate-500' : ''}
                  `}
                >
                  {isCompleted ? <Check size={14} /> : isCurrent ? <Circle size={10} fill="currentColor"/> : <span className="text-xs">{idx + 1}</span>}
                </div>
                
                <div className={`absolute top-10 text-center w-32 transition-colors duration-300 px-1
                    ${isCurrent ? 'text-blue-200 font-bold' : 'text-slate-500 font-medium'}
                `}>
                    <span className="text-[10px] uppercase tracking-wider block mb-1 opacity-70">Step {idx + 1}</span>
                    <span className="text-xs leading-tight block">{step.title}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessFlowchart;