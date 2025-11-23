import { Lesson, SystemState } from './types';

const DEFAULT_UNIT_OFF: any = {
  rectifierOn: false, inverterOn: false, batteryConnected: false, staticBypassOn: false,
  q1Input: false, q2Bypass: false, q5Battery: false, q4Output: false
};

const DEFAULT_UNIT_NORMAL: any = {
  rectifierOn: true, inverterOn: true, batteryConnected: true, staticBypassOn: false,
  q1Input: true, q2Bypass: true, q5Battery: true, q4Output: true
};

export const COMPONENT_INFO: Record<string, string> = {
  "RECTIFIER": "整流器 (Rectifier/PFC): 将交流电(AC)转换为稳定的直流电(DC)。在双变换UPS中，它还负责输入功率因数校正(PFC)，使输入PF值接近0.99，减少对电网的谐波污染。",
  "INVERTER": "逆变器 (Inverter): 核心心脏。采用IGBT（绝缘栅双极型晶体管）高速开关技术，将直流电(DC)逆变为纯净的正弦波交流电(AC)。无论市电电压、频率如何波动，逆变器输出始终锁定在 220V/50Hz，为负载提供纯净电源。",
  "BATTERY": "电池组 (Battery String): 储能单元。市电正常时处于浮充状态；市电故障时，无缝衔接为逆变器提供直流能量。通常由铅酸蓄电池串联组成，电压范围 192V-480V 不等。",
  "STATIC_SW": "静态旁路开关 (Static Transfer Switch - STS): 由反并联的晶闸管(SCR)组成。特点是无触点、切换快（<4ms）。当逆变器过载或故障时，逻辑电路驱动SCR导通，将负载无缝切换至旁路电源。",
  "Q1": "Q1 主路输入开关: 控制整流器的三相交流输入电源。",
  "Q2": "Q2 旁路输入开关: 为静态旁路回路提供电源。在双路供电系统中，Q2通常连接至另一路独立市电。",
  "Q3": "Q3 维修旁路开关: 手动机械隔离开关。闭合后，市电直接供给负载，UPS内部完全断电（除输入端子外），用于工程师安全的停机维护。",
  "Q4": "Q4 输出开关: 隔离开关，用于切断UPS输出与负载母线的连接。",
  "Q5": "Q5 电池开关: 直流断路器，连接电池组与UPS直流母线，具备过流和短路保护功能。",
  "LOAD": "关键负载 (Critical Load): 数据中心服务器、医疗设备、工业PLC等。对电源质量要求极高，不允许中断。",
  "SYSTEM_BUS": "并机输出母线: 多台UPS输出端并联汇流的铜排，实现容量叠加或N+1冗余。"
};

export const LESSONS: Lesson[] = [
  // --- PRINCIPLES & KNOWLEDGE ---
  {
    id: 'principle-online',
    title: '原理：正常工作模式 (Normal)',
    category: 'principle',
    difficulty: 'basic',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "市电逆变模式 (Double Conversion)",
        description: "这是双变换在线式UPS的标准工作状态。市电经过整流器(AC-DC)变换为直流，再经过逆变器(DC-AC)变换为稳压稳频的交流电供给负载。\n\n关键点：\n1. 负载电力100%由逆变器产生，波形纯净。\n2. 彻底隔离市电的尖峰、浪涌、频率波动。\n3. 电池处于浮充状态。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },
  {
    id: 'principle-battery',
    title: '原理：电池工作模式 (Battery)',
    category: 'principle',
    difficulty: 'basic',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "市电中断/超限",
        description: "当检测到市电输入中断或电压超出允许范围（如±15%）时，整流器关闭。电池组通过 Q5 瞬间释放直流能量维持直流母线电压。\n\n关键点：\n1. 逆变器持续工作，不需要切换，**切换时间为真正的 0ms**。\n2. 负载完全无感知。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: false, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, q1Input: true, rectifierOn: false, id: 'A' } 
        }
      }
    ]
  },
  {
    id: 'principle-bypass',
    title: '原理：静态旁路模式 (Static Bypass)',
    category: 'principle',
    difficulty: 'advanced',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "自动切换条件",
        description: "当发生以下情况时，UPS会自动切换到旁路：\n1. **逆变器过载**：如负载瞬间冲击超过125%-150%。\n2. **逆变器故障**：IGBT过温或驱动电路故障。\n\n此时，逻辑电路立刻封锁逆变器，同时触发静态开关(STS)导通。",
        warning: "旁路模式下，负载直接连接市电，无稳压稳频保护！",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, staticBypassOn: true, id: 'A' }
        }
      },
      {
        id: 2,
        title: "自动恢复",
        description: "若是因'过载'导致的切换，当负载降低到正常范围后（通常等待几秒至几分钟），UPS会自动重新启动逆变器，并将负载无缝切回逆变模式。若是'故障'，则需要人工干预。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },
  {
    id: 'principle-eco',
    title: '原理：经济运行模式 (ECO Mode)',
    category: 'principle',
    difficulty: 'expert',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "节能优先",
        description: "在市电质量极好的数据中心，可开启ECO模式。此时UPS默认由旁路(Static Bypass)供电，整流器和逆变器处于待机状态。整机效率可达99%（普通模式为94-96%）。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, staticBypassOn: true, rectifierOn: false, id: 'A' }
        }
      },
      {
        id: 2,
        title: "毫秒级切换",
        description: "一旦检测到市电微小波动，UPS在 <4ms 内（通常为2ms）极速启动逆变器并切回双变换模式，确保负载安全。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },
  {
    id: 'theory-indicators',
    title: '知识：状态指示灯与告警',
    category: 'principle',
    difficulty: 'basic',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "面板状态解读",
        description: "标准 UPS 面板包含模拟流程图 LED 指示灯：\n1. **LINE (市电)**: 绿色常亮表示输入正常。\n2. **INV (逆变)**: 绿色常亮表示带载运行。\n3. **BYP (旁路)**: 黄色常亮表示旁路供电（警示状态）。\n4. **FAULT (故障)**: 红色亮起表示机器故障。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },
  {
    id: 'theory-maintenance',
    title: '知识：维护保养常识',
    category: 'principle',
    difficulty: 'basic',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "预防性维护 (PM)",
        description: "1. **电容更换**: 直流母线电容(DC Caps)和交流滤波电容(AC Caps)通常寿命为5-7年，老化会导致纹波增大甚至爆炸。\n2. **风扇更换**: 3-5年更换，防止散热不良导致IGBT过温。\n3. **深度除尘**: 导电粉尘是电路板短路的主要杀手。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },

  // --- OPERATIONS (SINGLE) ---
  {
    id: 'op-single-start',
    title: '单机：标准开机流程',
    category: 'operation',
    difficulty: 'advanced',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "1. 闭合输入开关",
        description: "依次闭合旁路输入 Q2 和主路输入 Q1。系统上电，整流器启动，进行自检。此时负载由静态旁路供电。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, rectifierOn: true, staticBypassOn: true, q4Output: true, id: 'A' } // Assume Q4 closed for single unit typical start or closed later
        }
      },
      {
        id: 2,
        title: "2. 闭合电池开关",
        description: "闭合电池断路器 Q5。整流器开始对电池进行充电（均充/浮充）。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, rectifierOn: true, staticBypassOn: true, q4Output: true, id: 'A' }
        }
      },
      {
        id: 3,
        title: "3. 启动逆变器 (ON)",
        description: "在面板按 'ON' 键持续 2 秒。逆变器启动，逐步建立交流电压。当逆变输出与旁路电压相位同步后，静态开关动作，负载无缝切至逆变器。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' }
        }
      }
    ]
  },
  {
    id: 'op-single-maint',
    title: '单机：切维修旁路 (Maintenance)',
    category: 'operation',
    difficulty: 'advanced',
    viewMode: 'SINGLE',
    steps: [
      {
        id: 1,
        title: "1. 切至电子旁路",
        description: "通过面板菜单执行 'Transfer to Bypass' 或按 'OFF' 键。确认面板显示旁路LED点亮，负载由市电直接供电。",
        warning: "必须先切到电子旁路！如果在逆变模式下直接闭合维修开关，会造成逆变器输出短路炸机。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, staticBypassOn: true, id: 'A' }
        }
      },
      {
        id: 2,
        title: "2. 闭合维修开关 Q3",
        description: "闭合 Q3。此时电子旁路(STS)与维修旁路(Q3)并联，因同源同相，无环流。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: true, mainsAvailable: true, loadPowered: true, loadSource: 'MAINT',
          unitA: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, staticBypassOn: true, id: 'A' }
        }
      },
      {
        id: 3,
        title: "3. 断开内部开关",
        description: "依次断开 Q4(输出)、Q5(电池)、Q1(整流输入)、Q2(旁路输入)。此时 UPS 主机内部完全断电，负载由 Q3 继续供电。",
        systemState: {
          viewMode: 'SINGLE', q3MaintBypass: true, mainsAvailable: true, loadPowered: true, loadSource: 'MAINT',
          unitA: { ...DEFAULT_UNIT_OFF, id: 'A' }
        }
      }
    ]
  },

  // --- OPERATIONS (PARALLEL) ---
  {
    id: 'op-parallel-start',
    title: '并机：1+1 冗余开机',
    category: 'operation',
    difficulty: 'advanced',
    viewMode: 'PARALLEL',
    steps: [
      {
        id: 1,
        title: "上电前检查",
        description: "检查所有开关处于断开位置。测量输入电压是否正常，零火线是否正确。检查并机通信线环路完整。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: false, loadSource: 'NONE',
          unitA: { ...DEFAULT_UNIT_OFF, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, id: 'B' }
        }
      },
      {
        id: 2,
        title: "整流启动",
        description: "闭合 Unit A 和 Unit B 的 Q1、Q2。系统上电初始化，整流器启动。此时负载仍无电。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: false, loadSource: 'NONE',
          unitA: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, rectifierOn: true, staticBypassOn: true, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, rectifierOn: true, staticBypassOn: true, id: 'B' }
        }
      },
      {
        id: 3,
        title: "投入电池",
        description: "闭合 Unit A 和 Unit B 的 Q5。直流母线连接电池。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: false, loadSource: 'NONE',
          unitA: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, rectifierOn: true, staticBypassOn: true, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, rectifierOn: true, staticBypassOn: true, id: 'B' }
        }
      },
      {
        id: 4,
        title: "并联旁路供电",
        description: "闭合 Unit A Q4，再闭合 Unit B Q4。此时两台机器通过旁路并联给负载供电。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'BYPASS',
          unitA: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, q4Output: true, rectifierOn: true, staticBypassOn: true, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, q4Output: true, rectifierOn: true, staticBypassOn: true, id: 'B' }
        }
      },
      {
        id: 5,
        title: "启动逆变器",
        description: "在面板上执行开机命令。两台机器逆变器同步启动，锁相后，同时切换至在线模式，均分负载。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, id: 'B' }
        }
      }
    ]
  },
  {
    id: 'op-parallel-exit',
    title: '并机：单机退服维修',
    category: 'operation',
    difficulty: 'expert',
    viewMode: 'PARALLEL',
    steps: [
      {
        id: 1,
        title: "状态确认",
        description: "假设 UPS-B 故障需维修。确认 UPS-A 负载率低于 50% (若只有两台)，确保单台机器能承担所有负载。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, id: 'B' }
        }
      },
      {
        id: 2,
        title: "单机软关机",
        description: "操作 UPS-B 面板执行 'OFF'。UPS-B 逆变器停止，负载平滑转移至 UPS-A。注意：此时 UPS-B 内部仍带电。",
        warning: "操作前再次确认负载量！",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, staticBypassOn: false, id: 'B' }
        }
      },
      {
        id: 3,
        title: "断开输出 Q4",
        description: "断开 UPS-B 的 Q4。此时 B 机与并机母线物理隔离。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, inverterOn: false, q4Output: false, id: 'B' }
        }
      },
      {
        id: 4,
        title: "全隔离",
        description: "断开 UPS-B 的输入 Q1, 旁路 Q2, 电池 Q5。UPS-B 完全断电，工程师可安全作业。UPS-A 保持在线运行。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, id: 'B' }
        }
      }
    ]
  },
  {
    id: 'op-parallel-rejoin',
    title: '并机：维修后重新投入',
    category: 'operation',
    difficulty: 'expert',
    viewMode: 'PARALLEL',
    steps: [
      {
        id: 1,
        title: "初始状态",
        description: "UPS-A 在线带载。UPS-B 维修完毕，准备重新加入并机系统。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, id: 'B' }
        }
      },
      {
        id: 2,
        title: "UPS-B 上电",
        description: "闭合 UPS-B 的输入 Q1 和 旁路 Q2。等待屏幕亮起，系统初始化完毕。确认此时无故障报警。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, rectifierOn: true, staticBypassOn: true, id: 'B' }
        }
      },
      {
        id: 3,
        title: "闭合电池 Q5",
        description: "闭合 UPS-B 电池开关 Q5。检查直流母线电压是否正常。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_OFF, q1Input: true, q2Bypass: true, q5Battery: true, rectifierOn: true, staticBypassOn: true, id: 'B' }
        }
      },
      {
        id: 4,
        title: "启动逆变器",
        description: "在 UPS-B 面板按 'ON'。UPS-B 逆变器启动，通过并机卡侦测母线（UPS-A）的频率和相位，进行自动追踪同步。",
        warning: "此时先不要闭合Q4！先让逆变器运行并同步。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, q4Output: false, id: 'B' } // Inverter ON, but Q4 still OPEN
        }
      },
      {
        id: 5,
        title: "闭合输出 Q4 (并入)",
        description: "确认 UPS-B 显示 'Inverter ON' 且与主机同步后，闭合 Q4。UPS-B 瞬间并入母线，系统自动进行负载均分，恢复 1+1 冗余状态。",
        systemState: {
          viewMode: 'PARALLEL', q3MaintBypass: false, mainsAvailable: true, loadPowered: true, loadSource: 'INVERTER',
          unitA: { ...DEFAULT_UNIT_NORMAL, id: 'A' },
          unitB: { ...DEFAULT_UNIT_NORMAL, id: 'B' }
        }
      }
    ]
  }
];