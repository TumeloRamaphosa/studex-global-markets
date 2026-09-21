'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Agent {
  role: string;
  name: string;
  vertical: string;
  status: 'online' | 'degraded' | 'offline';
  activity: string[];
}

const AGENTS: Agent[] = [
  {
    role: 'MEAT',
    name: 'Wagyu Trading',
    vertical: 'MEAT',
    status: 'online',
    activity: ['> [MEAT] scan.buyers()', '> [MEAT] price.adjust()'],
  },
  {
    role: 'COFFEE',
    name: 'Specialty Trading',
    vertical: 'COFFEE',
    status: 'online',
    activity: ['> [COFFEE] lot.broker()', '> [COFFEE] farm.connect()'],
  },
  {
    role: 'WHEAT',
    name: 'Commodity Trade',
    vertical: 'WHEAT',
    status: 'online',
    activity: ['> [WHEAT] harvest.log()', '> [WHEAT] silo.check()'],
  },
  {
    role: 'PRICING',
    name: 'Dynamic Pricing',
    vertical: 'PRICING',
    status: 'online',
    activity: ['> [PRICING] market.sync()', '> [PRICING] tier.adjust()'],
  },
  {
    role: 'COMPLIANCE',
    name: 'Legal & Certs',
    vertical: 'COMPLIANCE',
    status: 'online',
    activity: ['> [COMPLIANCE] halaal.verify()', '> [COMPLIANCE] cert.check()'],
  },
  {
    role: 'DISCOVERY',
    name: 'Buyer Matching',
    vertical: 'DISCOVERY',
    status: 'online',
    activity: ['> [DISCOVERY] buyer.scan()', '> [DISCOVERY] match.score()'],
  },
];

export default function NexusDashboard() {
  const { data: session } = useSession();
  const [positions, setPositions] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [clock, setClock] = useState('--:--:-- SAST');
  const [activities, setActivities] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    // Calculate positions in a circle around center
    const centerX = 720;
    const centerY = 540;
    const n = AGENTS.length;
    const newPositions = [];

    for (let i = 0; i < n; i++) {
      const angle = (-90 + i * (360 / n)) * (Math.PI / 180);
      const radius = i % 2 === 0 ? 380 : 440;
      newPositions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    setPositions(newPositions);

    // Initialize activities
    const initialActivities: Record<string, string[]> = {};
    AGENTS.forEach((agent) => {
      initialActivities[agent.role] = [...agent.activity];
    });
    setActivities(initialActivities);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const sast = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
      const hh = String(sast.getHours()).padStart(2, '0');
      const mm = String(sast.getMinutes()).padStart(2, '0');
      const ss = String(sast.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss} SAST`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onlineCount = AGENTS.filter((a) => a.status === 'online').length;
  const degradedCount = AGENTS.filter((a) => a.status === 'degraded').length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E8DDBA] overflow-x-hidden">
      <style>{`
        :root {
          --gold: #C9A84C;
          --obsidian: #050505;
          --cream: #E8DDBA;
          --mute: #6a6250;
          --ok: #6BCF7F;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(201, 168, 76, 0.09) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .agent {
          position: absolute;
          width: 220px;
          background: linear-gradient(180deg, #14110c 0%, #08060a 100%);
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 16px rgba(201,168,76,0.08);
          animation: float 7s ease-in-out infinite;
          font-family: 'Space Mono', monospace;
        }

        .agent-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(201,168,76,0.2);
        }

        .agent-role {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--gold);
        }

        .agent-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--ok);
          box-shadow: 0 0 8px var(--ok);
        }

        .agent-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          color: var(--cream);
          margin-top: 4px;
          letter-spacing: 1px;
        }

        .agent-screen {
          background: #020202;
          margin-top: 10px;
          height: 100px;
          border-radius: 5px;
          padding: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          color: #FFB000;
          line-height: 1.6;
          overflow: hidden;
        }

        .agent-screen div {
          opacity: 0.9;
          margin-top: 2px;
        }

        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* HEADER */}
      <header className="border-b border-[rgba(201,168,76,0.15)] px-[60px] py-[24px] flex justify-between items-end relative z-10">
        <div>
          <div className="font-[Bebas_Neue] text-[52px] tracking-[14px] text-[#C9A84C] leading-none">
            STUDEX GLOBAL
          </div>
          <div className="font-[Space_Mono] text-[10px] tracking-[5px] text-[#6a6250] mt-[10px] uppercase">
            Markets · Trading Command · Nexus v0.1
          </div>
        </div>
        <div className="flex gap-9 items-end">
          <div className="text-right">
            <div className="font-[Space_Mono] text-[9px] text-[#6a6250] tracking-[3px] uppercase">
              Agents Online
            </div>
            <div className="font-[Bebas_Neue] text-[26px] text-[#C9A84C] tracking-[2px]">
              {onlineCount}
            </div>
          </div>
          <div className="text-right">
            <div className="font-[Space_Mono] text-[9px] text-[#6a6250] tracking-[3px] uppercase">
              Degraded
            </div>
            <div className="font-[Bebas_Neue] text-[26px] text-[#C9A84C] tracking-[2px]">
              {degradedCount}
            </div>
          </div>
          <div className="font-[Space_Mono] text-[13px] text-[#C9A84C] tracking-[2px]">
            {clock}
          </div>
        </div>
      </header>

      {/* AGENTS CONSTELLATION */}
      <section className="relative h-[1080px] py-5 z-[2]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 1080">
          {/* Web lines connecting agents to center */}
          {positions.map((pos, i) => (
            <path
              key={`line-${i}`}
              d={`M720,540 Q${(720 + pos.x) / 2},${(540 + pos.y) / 2 + 36} ${pos.x},${pos.y}`}
              stroke="rgba(201,168,76,0.22)"
              strokeWidth="1"
              fill="none"
            />
          ))}
          {/* Pulse dots on lines */}
          {positions.map((pos, i) => (
            <circle
              key={`pulse-${i}`}
              r="2.5"
              fill="#C9A84C"
              opacity="0.7"
            >
              <animateMotion
                dur={`${3 + Math.random() * 3}s`}
                repeatCount="indefinite"
                begin={`${Math.random() * 3}s`}
              >
                <mpath href={`#line-${i}`} />
              </animateMotion>
            </circle>
          ))}
        </svg>

        {/* CENTRAL MAINFRAME */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] bg-gradient-to-b from-[#1a1611] to-[#0a0805] border-2 border-[#C9A84C] rounded-[14px] p-[18px] shadow-[0_0_80px_rgba(201,168,76,0.35)] z-5">
          <div className="font-[Bebas_Neue] text-[13px] tracking-[5px] text-[#C9A84C] text-center pb-[10px] border-b border-[rgba(201,168,76,0.3)]">
            ◆ GLOBAL MARKETS NEXUS ◆
          </div>
          <div className="bg-[#030303] mt-[14px] h-[210px] rounded-[8px] p-4 font-[Space_Mono] text-[10px] text-[#FFB000] overflow-hidden">
            <div className="font-[Cormorant_Garamond] text-[30px] text-[#C9A84C] text-center tracking-[4px]">
              {session?.user?.name || 'MARKETS'}
            </div>
            <div className="font-[Space_Mono] text-[9px] text-[#6a6250] text-center tracking-[4px] mt-[4px]">
              FOUNDER · TRADING COMMAND
            </div>
            <div className="mt-[18px] pt-[12px] border-t border-dashed border-[rgba(255,176,0,0.25)] text-[9px] leading-[1.7]">
              <div>&gt; markets.boot ok</div>
              <div>&gt; agents: {onlineCount} online</div>
              <div>&gt; commodities: streaming</div>
              <div>&gt; awaiting directive_</div>
            </div>
          </div>
        </div>

        {/* AGENT SEATS */}
        {AGENTS.map((agent, i) => {
          const pos = positions[i] || { x: 720, y: 540 };
          return (
            <div
              key={agent.role}
              className="agent"
              style={{
                left: `calc(${(pos.x / 1440) * 100}% - 110px)`,
                top: `${pos.y - 90}px`,
                animationDelay: `${-i * 0.55}s`,
              }}
            >
              <div className="agent-head">
                <span className="agent-role">{agent.role}</span>
                <span className="agent-status"></span>
              </div>
              <div className="agent-name">{agent.name}</div>
              <div className="agent-screen">
                {(activities[agent.role] || agent.activity).map((line, j) => (
                  <div key={j}>{line}</div>
                ))}
              </div>
              <div className="flex justify-between text-[7.5px] text-[#6a6250] tracking-[1px] mt-[8px] uppercase">
                <span>seat · {agent.vertical}</span>
                <span>{agent.status}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* COMMAND CENTER */}
      <section className="px-[60px] py-[40px] border-t border-[rgba(201,168,76,0.15)] relative z-3">
        <h2 className="font-[Bebas_Neue] text-[20px] tracking-[8px] text-[#C9A84C] mb-[20px]">
          ◈ TRADING OPERATIONS · COMMAND CENTER
        </h2>

        <div className="grid grid-cols-4 gap-6">
          {/* Active Trades */}
          <div className="bg-[rgba(20,17,12,0.7)] border border-[rgba(201,168,76,0.25)] rounded-[8px] p-[22px] backdrop-blur-[4px]">
            <div className="pb-[12px] border-b border-[rgba(201,168,76,0.18)] mb-[14px] flex justify-between">
              <span className="font-[Bebas_Neue] text-[14px] tracking-[4px] text-[#C9A84C]">
                ◆ LIVE TRADES
              </span>
              <span className="font-[Space_Mono] text-[10px] text-[#6a6250] tracking-[2px]">
                12 active
              </span>
            </div>
            <div className="space-y-3 text-[11px] font-[Space_Mono]">
              <div className="border-b border-[rgba(201,168,76,0.08)] pb-2">
                <div className="text-[#E8DDBA]">Wagyu · 50kg @ $45.50</div>
                <div className="text-[9px] text-[#6a6250] mt-1">buyer: engage tier</div>
              </div>
            </div>
          </div>

          {/* Market Pulse */}
          <div className="bg-[rgba(20,17,12,0.7)] border border-[rgba(201,168,76,0.25)] rounded-[8px] p-[22px] backdrop-blur-[4px]">
            <div className="pb-[12px] border-b border-[rgba(201,168,76,0.18)] mb-[14px] flex justify-between">
              <span className="font-[Bebas_Neue] text-[14px] tracking-[4px] text-[#C9A84C]">
                ◆ PRICING PULSE
              </span>
              <span className="font-[Space_Mono] text-[10px] text-[#6a6250] tracking-[2px]">
                real-time
              </span>
            </div>
            <div className="space-y-3 text-[11px] font-[Space_Mono]">
              <div className="border-b border-[rgba(201,168,76,0.08)] pb-2">
                <div className="text-[#E8DDBA]">MEAT: +2.3%</div>
                <div className="text-[9px] text-[#6a6250] mt-1">market demand up</div>
              </div>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="bg-[rgba(20,17,12,0.7)] border border-[rgba(201,168,76,0.25)] rounded-[8px] p-[22px] backdrop-blur-[4px]">
            <div className="pb-[12px] border-b border-[rgba(201,168,76,0.18)] mb-[14px] flex justify-between">
              <span className="font-[Bebas_Neue] text-[14px] tracking-[4px] text-[#C9A84C]">
                ◆ USERS · TIERS
              </span>
              <span className="font-[Space_Mono] text-[10px] text-[#6a6250] tracking-[2px]">
                123 total
              </span>
            </div>
            <div className="space-y-3 text-[11px] font-[Space_Mono]">
              <div className="flex justify-between">
                <span className="text-[#E8DDBA]">Aspire</span>
                <span className="text-[#6a6250]">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8DDBA]">Scale</span>
                <span className="text-[#C9A84C]">28</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[rgba(20,17,12,0.7)] border border-[rgba(201,168,76,0.25)] rounded-[8px] p-[22px] backdrop-blur-[4px]">
            <div className="pb-[12px] border-b border-[rgba(201,168,76,0.18)] mb-[14px] flex justify-between">
              <span className="font-[Bebas_Neue] text-[14px] tracking-[4px] text-[#C9A84C]">
                ◆ SYSTEM ALERTS
              </span>
              <span className="font-[Space_Mono] text-[10px] text-[#6a6250] tracking-[2px]">
                clear
              </span>
            </div>
            <div className="text-[11px] font-[Space_Mono] text-[#6BCF7F]">
              &gt; all systems nominal
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-[30px] font-[Space_Mono] text-[9px] text-[#4a4638] tracking-[4px] border-t border-[rgba(201,168,76,0.1)] relative z-3">
        MARKETS · GLOBAL TRADING NEXUS · AGENT COMMAND · STUDEX GROUP
      </footer>
    </div>
  );
}
