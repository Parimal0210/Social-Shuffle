import React from 'react';
import {
  Heart,
  Sparkles,
  Dices,
  Coffee,
  Compass,
  Quote,
  CheckCircle2,
  MapPin,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import parimalImg from '../../assets/images/founder_parimal_1793171702548.jpg';
import dikshaImg from '../../assets/images/founder_diksha_1793171722564.jpg';

interface MeetFoundersSectionProps {
  onRegisterClick?: () => void;
  onExploreEvents?: () => void;
  isAuthenticated?: boolean;
}

interface FounderData {
  id: string;
  name: string;
  role: string;
  badge: string;
  badgeColor: string;
  image: string;
  tagline: string;
  quote: string;
  passions: string;
  hobbies: string;
  favoriteGames: string[];
  area: string;
  tableFocus: string;
  stats: string;
}

const FOUNDERS: FounderData[] = [
  {
    id: 'parimal',
    name: 'Parimal',
    role: 'Co-Founder & Community Architect',
    badge: 'Game Curator & Table Host',
    badgeColor: 'bg-[#FF751F] text-white',
    image: parimalImg,
    tagline: 'Turning screen time into game night across Pune since day one.',
    quote:
      'I started Social Shuffle because Pune needed an authentic third place—somewhere cozy to unplug your phone on a Sunday afternoon, roll tactile wooden dice, and meet kindred spirits with zero social friction.',
    passions:
      'Heavy Euro strategy games, designing inclusive community spaces where solo attendees feel like regulars, and fostering deep social chemistry through tabletop play.',
    hobbies:
      'Pour-over single-origin coffee brewing, Sinhagad & Western Ghats trekking, vintage sci-fi novels, and hunting for rare indie tabletop games.',
    favoriteGames: ['Catan: Cities & Knights', 'Avalon', 'Dune: Imperium', 'Terraforming Mars'],
    area: 'Koregaon Park & Baner',
    tableFocus: 'Hosts Heavy Strategy & Casual Gateway tables',
    stats: '120+ game titles taught'
  },
  {
    id: 'diksha',
    name: 'Diksha',
    role: 'Co-Founder & Experience Director',
    badge: 'Experience & Culture Lead',
    badgeColor: 'bg-[#4AB4A4] text-[#10173E]',
    image: dikshaImg,
    tagline: 'Making first-timers feel like regulars in under five minutes.',
    quote:
      'Walking alone into a room of strangers takes courage. That’s why we personally greet you at the entrance, match you with the right table vibe, and make sure rule explanations are engaging and zero-stress.',
    passions:
      'Eliminating social awkwardness, party game dynamics, storytelling mechanics, welcoming nervous first-timers, and crafting memorable weekend rituals.',
    hobbies:
      'Cafe hopping in Kalyani Nagar & Viman Nagar, studio pottery & clay crafts, baking sourdough treats for community milestones, and narrative word games.',
    favoriteGames: ['Codenames', 'Ticket to Ride', 'Dixit', 'Cascadia', 'Just One'],
    area: 'Kalyani Nagar & Viman Nagar',
    tableFocus: 'Hosts Icebreaker & Social Deduction tables',
    stats: '600+ solo attendees welcomed'
  }
];

export const MeetFoundersSection: React.FC<MeetFoundersSectionProps> = ({
  onRegisterClick,
  onExploreEvents,
  isAuthenticated = false
}) => {
  return (
    <section aria-label="Meet the Founders" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A255C] border border-[#283677] text-xs font-bold text-[#FFD230] uppercase tracking-wider mb-2 font-heading">
            <Heart className="w-3.5 h-3.5 text-[#FF751F]" />
            <span>Behind The Shuffles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            Meet the Founders
          </h2>
          <p className="text-sm text-[#CBD5E1] mt-1 max-w-2xl">
            Social Shuffle was created by Parimal and Diksha with one simple goal: bringing Pune away from screens and around the tabletop.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#151E4D] border border-[#283677] text-xs text-[#CBD5E1] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>At Every Sunday Meetup in Pune</span>
        </div>
      </div>

      {/* Founders List: Split Card Layout (Left Part: Photo | Right Part: Content) */}
      <div className="space-y-6">
        {FOUNDERS.map(founder => {
          const isParimal = founder.id === 'parimal';
          const accentColor = isParimal ? '#FF751F' : '#4AB4A4';
          const borderHover = isParimal
            ? 'hover:border-[#FF751F]/60'
            : 'hover:border-[#4AB4A4]/60';

          return (
            <div
              key={founder.id}
              className={`rounded-3xl bg-[#151E4D] border border-[#283677] ${borderHover} overflow-hidden shadow-xl flex flex-col md:flex-row transition-all duration-300 group`}
            >
              {/* ================= LEFT PART: PHOTO ================= */}
              <div className="w-full md:w-5/12 lg:w-4/12 relative shrink-0 min-h-[320px] sm:min-h-[360px] md:min-h-[460px] bg-[#10173E] overflow-hidden">
                <img
                  src={founder.image}
                  alt={`${founder.name} - Co-Founder of Social Shuffle`}
                  className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Ambient photo overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10173E] via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-[#151E4D]" />

                {/* Founder Badges on Photo */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-heading shadow-md ${founder.badgeColor}`}
                  >
                    Co-Founder
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                    {founder.badge}
                  </span>
                </div>

                {/* Location & Attendance note at bottom of Photo */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#10173E]/90 backdrop-blur-md border border-white/10 text-xs text-white z-10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 font-heading">
                      <MapPin
                        className="w-3.5 h-3.5"
                        style={{ color: accentColor }}
                      />
                      <span>{founder.area}</span>
                    </span>
                    <span className="text-[11px] text-[#FFD230] font-semibold">
                      {founder.stats}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-1">
                    {founder.tableFocus}
                  </p>
                </div>
              </div>

              {/* ================= RIGHT PART: CONTENT ================= */}
              <div className="w-full md:w-7/12 lg:w-8/12 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#151E4D]">
                <div className="space-y-5">
                  {/* Name & Title Header */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                        {founder.name}
                      </h3>
                      <span className="px-3 py-0.5 rounded-lg bg-[#1A255C] border border-[#283677] text-xs font-bold text-[#FFD230] font-heading">
                        {founder.role}
                      </span>
                    </div>
                    <p
                      className="text-xs sm:text-sm font-semibold"
                      style={{ color: accentColor }}
                    >
                      {founder.tagline}
                    </p>
                  </div>

                  {/* Personal Quote */}
                  <div className="relative p-4 rounded-2xl bg-[#10173E] border border-[#283677] text-xs sm:text-sm text-[#CBD5E1] leading-relaxed shadow-inner">
                    <Quote
                      className="w-4 h-4 inline mr-1.5 -mt-1 opacity-90"
                      style={{ color: accentColor }}
                    />
                    {founder.quote}
                  </div>

                  {/* Passions & Hobbies Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-2xl bg-[#1A255C] border border-[#283677]/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5 font-heading">
                        <Sparkles
                          className="w-3.5 h-3.5"
                          style={{ color: accentColor }}
                        />
                        <span>Passions</span>
                      </div>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        {founder.passions}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#1A255C] border border-[#283677]/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5 font-heading">
                        {isParimal ? (
                          <Coffee className="w-3.5 h-3.5 text-[#FFD230]" />
                        ) : (
                          <Compass className="w-3.5 h-3.5 text-[#FFD230]" />
                        )}
                        <span>Hobbies & Life Outside Games</span>
                      </div>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        {founder.hobbies}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Games Badges */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white font-heading">
                      <Dices
                        className="w-3.5 h-3.5"
                        style={{ color: accentColor }}
                      />
                      <span>Go-To Tabletop Favorites:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {founder.favoriteGames.map((game, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl text-xs font-medium bg-[#10173E] border border-[#283677] text-white flex items-center gap-1.5"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accentColor }}
                          />
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer of Content Card */}
                <div className="pt-4 border-t border-[#283677]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Always hosting in-person at Sunday meetups</span>
                  </div>

                  <button
                    type="button"
                    onClick={!isAuthenticated ? onRegisterClick : onExploreEvents}
                    className="inline-flex items-center gap-1.5 font-bold hover:underline"
                    style={{ color: accentColor }}
                  >
                    <span>Say hello to {founder.name} this Sunday</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Promise Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1A255C] to-[#151E4D] border border-[#283677] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#FF751F]/15 border border-[#FF751F]/30 flex items-center justify-center shrink-0 text-[#FF751F]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white font-heading">
              Our Solo Attendee Promise
            </h4>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5 max-w-xl">
              Over 60% of our attendees come solo. Parimal and Diksha personally introduce you, seat you with friendly players, and ensure you feel right at home within minutes.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 text-center"
            >
              Join Our Community Free
            </button>
          ) : (
            <button
              type="button"
              onClick={onExploreEvents}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 text-center"
            >
              RSVP for This Sunday
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
