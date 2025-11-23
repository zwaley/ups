export type ViewMode = 'SINGLE' | 'PARALLEL';

export interface BreakerState {
  isOpen: boolean; // true = Disconnected (OFF), false = Connected (ON)
  id: string;
  label: string;
}

export interface UPSUnitState {
  id: string;
  rectifierOn: boolean;
  inverterOn: boolean;
  batteryConnected: boolean;
  staticBypassOn: boolean;
  // Internal Breakers
  q1Input: boolean;    // Mains Input
  q2Bypass: boolean;   // Bypass Input
  q5Battery: boolean;  // Battery Breaker
  q4Output: boolean;   // Unit Output
}

export interface SystemState {
  viewMode: ViewMode;
  // External/System Breakers
  q3MaintBypass: boolean; // External System Maintenance Bypass
  
  // Units
  unitA: UPSUnitState;
  unitB?: UPSUnitState; // Only for parallel

  // Flow Status (Calculated for visualization)
  mainsAvailable: boolean;
  loadPowered: boolean;
  loadSource: 'INVERTER' | 'BYPASS' | 'MAINT' | 'NONE';
}

export interface LessonStep {
  id: number;
  title: string;
  description: string;
  warning?: string; // Safety warnings
  systemState: SystemState;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'principle' | 'operation';
  difficulty: 'basic' | 'advanced' | 'expert';
  viewMode: ViewMode;
  steps: LessonStep[];
}
