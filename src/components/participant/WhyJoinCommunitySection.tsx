import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WhyJoinCommunitySectionProps {
  onRegisterClick?: () => void;
  showCta?: boolean;
}

/**
 * Custom SVG Icon 1: 1-Tap Live Attendance
 * Stylized digital check-in tablet with QR scanner beam and emerald pulse
 */
const LiveAttendanceCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="44" height="48" rx="10" fill="#0E2A24" stroke="#35C8A8" strokeWidth="2.5" />
    {/* Screen bezel */}
    <rect x="16" y="14" width="32" height="32" rx="6" fill="#081816" stroke="#1F5649" strokeWidth="1.5" />
    {/* QR Grid pattern */}
    <rect x="20" y="18" width="8" height="8" rx="2" fill="#35C8A8" />
    <rect x="22" y="20" width="4" height="4" fill="#081816" />
    <rect x="36" y="18" width="8" height="8" rx="2" fill="#35C8A8" />
    <rect x="38" y="20" width="4" height="4" fill="#081816" />
    <rect x="20" y="34" width="8" height="8" rx="2" fill="#35C8A8" />
    <rect x="22" y="36" width="4" height="4" fill="#081816" />
    <path d="M34 32H38V36H34V32Z" fill="#35C8A8" />
    <path d="M38 38H44V42H38V38Z" fill="#35C8A8" />
    <path d="M32 38H36V42H32V38Z" fill="#35C8A8" />
    {/* Laser scan beam */}
    <line x1="16" y1="30" x2="48" y2="30" stroke="#35C8A8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
    {/* Tablet home bar */}
    <rect x="26" y="50" width="12" height="2.5" rx="1.25" fill="#35C8A8" />
    {/* Floating pulse beacon */}
    <circle cx="48" cy="12" r="5" fill="#35C8A8" />
    <circle cx="48" cy="12" r="8" stroke="#35C8A8" strokeOpacity="0.4" strokeWidth="1.5" />
  </svg>
);

/**
 * Custom SVG Icon 2: Game Tracking & Shuffler Levels
 * Isometric dice with leveling star and XP progression shield
 */
const GameTrackingCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background shield glow */}
    <path
      d="M32 6L48 13V29C48 40.5 41.2 51.2 32 55C22.8 51.2 16 40.5 16 29V13L32 6Z"
      fill="#201538"
      stroke="#8F43EE"
      strokeWidth="2.5"
    />
    {/* 3D Isometric Die */}
    <g transform="translate(32, 28)">
      {/* Top face */}
      <polygon points="0,-14 14,-6 0,2 -14,-6" fill="#A865F8" stroke="#5E22B0" strokeWidth="1.5" />
      {/* Pip on top */}
      <circle cx="0" cy="-6" r="2" fill="#FFFFFF" />
      {/* Right face */}
      <polygon points="14,-6 14,10 0,18 0,2" fill="#752ED4" stroke="#5E22B0" strokeWidth="1.5" />
      {/* Pips on right */}
      <circle cx="7" cy="4" r="1.5" fill="#FFFFFF" />
      <circle cx="7" cy="10" r="1.5" fill="#FFFFFF" />
      {/* Left face */}
      <polygon points="-14,-6 -14,10 0,18 0,2" fill="#581FA3" stroke="#411380" strokeWidth="1.5" />
      {/* Pips on left */}
      <circle cx="-7" cy="4" r="1.5" fill="#FFFFFF" />
      <circle cx="-7" cy="10" r="1.5" fill="#FFFFFF" />
      <circle cx="0" cy="10" r="1.5" fill="#FFFFFF" />
    </g>
    {/* Level-up chevron sparks */}
    <path d="M26 48L32 44L38 48" stroke="#FFC226" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 52L32 49L36 52" stroke="#FFC226" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="14" r="2" fill="#FFC226" />
    <circle cx="48" cy="14" r="2" fill="#FFC226" />
  </svg>
);

/**
 * Custom SVG Icon 3: Exclusive Meetups & VIP Reserved Tables
 * Royal crown calendar with tabletop meeple and VIP sparkle
 */
const ExclusiveMeetupsCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hexagon tabletop badge */}
    <polygon
      points="32,6 52,17.5 52,40.5 32,52 12,40.5 12,17.5"
      fill="#2B1D0E"
      stroke="#FF9500"
      strokeWidth="2.5"
    />
    {/* VIP Crown */}
    <path
      d="M20 38L22 24L28 30L32 20L36 30L42 24L44 38H20Z"
      fill="#FFC226"
      stroke="#FF8000"
      strokeWidth="1.5"
    />
    {/* Crown jewels */}
    <circle cx="22" cy="23" r="1.5" fill="#FFFFFF" />
    <circle cx="32" cy="19" r="2" fill="#FFFFFF" />
    <circle cx="42" cy="23" r="1.5" fill="#FFFFFF" />
    {/* Classic Meeple silhouette inside */}
    <circle cx="32" cy="30" r="3" fill="#0A1128" />
    <path d="M29 34H35L36 44H28L29 34Z" fill="#0A1128" />
    {/* Sparkles */}
    <path d="M48 10L50 6L52 10L56 12L52 14L50 18L48 14L44 12L48 10Z" fill="#FFC226" />
  </svg>
);

export const WhyJoinCommunitySection: React.FC<WhyJoinCommunitySectionProps> = ({
  onRegisterClick,
  showCta = true
}) => {
  const { openAuthModal } = useApp();

  const handleCta = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      openAuthModal('register');
    }
  };

  const benefits = [
    {
      id: 'attendance',
      title: '1-Tap Live Attendance',
      badge: 'Smart Check-In',
      badgeColor: 'bg-[#35C8A8]/15 text-[#35C8A8] border-[#35C8A8]/30',
      icon: <LiveAttendanceCustomIcon className="w-14 h-14" />,
      accentBorder: 'hover:border-[#35C8A8]/50 group-hover:shadow-[#35C8A8]/20',
      tagline: 'Skip queues with personal digital QR passes',
      description:
        'Zero paper checklists and zero waiting in line. Get your personalized QR pass directly on your phone with instant 1-tap table check-in at Pune cafes, real-time seat assignment, and priority waitlist alerts.',
      bulletPoints: [
        'Instant QR scanning at host entrance',
        'Real-time seat reservation confirmation',
        'Automatic waitlist drops before registrations close'
      ]
    },
    {
      id: 'tracking',
      title: 'Game Tracking & Levels',
      badge: 'Shuffler Passport',
      badgeColor: 'bg-[#8F43EE]/15 text-[#a870f7] border-[#8F43EE]/30',
      icon: <GameTrackingCustomIcon className="w-14 h-14" />,
      accentBorder: 'hover:border-[#8F43EE]/50 group-hover:shadow-[#8F43EE]/20',
      tagline: 'Record your tabletop legacy across 120+ games',
      description:
        'Track every board game you conquer from our massive 120+ game library. Level up your profile from Rising Shuffler to Board Game Master, earn achievement badges, and build your gaming history.',
      bulletPoints: [
        '120+ curated titles tracked by difficulty & genre',
        'Level progression from Table Veteran to Master',
        'Personal passport of played games and win history'
      ]
    },
    {
      id: 'exclusive',
      title: 'Exclusive Meetups & VIP Access',
      badge: 'Members Only',
      badgeColor: 'bg-[#FFC226]/15 text-[#FFC226] border-[#FFC226]/30',
      icon: <ExclusiveMeetupsCustomIcon className="w-14 h-14" />,
      accentBorder: 'hover:border-[#FFC226]/50 group-hover:shadow-[#FFC226]/20',
      tagline: 'Priority seats for sold-out weekend editions',
      description:
        'Get early-bird booking access to high-demand Sunday editions before tickets sell out. Enjoy secret heavy-strategy nights, themed deduction games, tournaments, and dedicated rule tutors at every table.',
      bulletPoints: [
        'Priority RSVP before public sold-out drops',
        'Curated matchmaking (60% come solo & make friends)',
        'Friendly host mentors explain rules from scratch'
      ]
    }
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1C1B18] border border-[#36332D] p-6 sm:p-8 shadow-sm">
      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-[#FF7A59] font-heading uppercase tracking-wider">
            Community Member Perks
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Why Join Social Shuffle Pune?
          </h2>

          <p className="text-sm text-[#A8A29E] leading-relaxed">
            Whether you are rolling dice for the very first time or a seasoned tabletop strategist, registering as a community participant unlocks Pune's premier board gaming ecosystem:
          </p>
        </div>

        {/* 3 Top Community Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map(b => (
            <div
              key={b.id}
              className="p-5 sm:p-6 rounded-xl bg-[#24221E] border border-[#36332D] transition-all duration-200 flex flex-col justify-between group hover:border-[#FF6036]/50"
            >
              <div className="space-y-4">
                {/* Custom Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#1C1B18] border border-[#36332D] group-hover:scale-105 transition-transform">
                    {b.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-[#FF7A59]">
                    {b.badge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight font-heading">
                    {b.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#FFC226] mt-0.5">
                    {b.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-[#A8A29E] leading-relaxed">
                  {b.description}
                </p>

                {/* Feature checklist */}
                <div className="space-y-2 pt-3 border-t border-[#36332D]">
                  {b.bulletPoints.map((bp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#D6D3D1]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#35C8A8] shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Curiosity & Action Callout */}
        {showCta && (
          <div className="p-5 sm:p-6 rounded-xl bg-[#22201C] border border-[#36332D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white font-heading">
                  Ready to experience Pune's friendliest board game haven? 🎲
                </span>
              </div>
              <p className="text-xs text-[#A8A29E]">
                Registering as a participant is 100% free and takes less than 30 seconds. Over 2,400+ Pune shufflers are waiting to welcome you to the table!
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-why-join-register"
                onClick={handleCta}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Join Community Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
