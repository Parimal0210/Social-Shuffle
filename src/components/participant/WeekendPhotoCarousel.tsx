import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Coffee,
  Heart,
  Dices,
  Pause,
  Play,
  ArrowRight
} from 'lucide-react';
import cafeVibesImg from '../../assets/images/game_cafe_vibes_1793171611428.jpg';
import strategyDiceImg from '../../assets/images/game_strategy_dice_1793171652536.jpg';
import partyFunImg from '../../assets/images/game_party_fun_1793171683492.jpg';

interface WeekendPhotoCarouselProps {
  onExploreEvents?: () => void;
  onJoinClick?: () => void;
  isAuthenticated?: boolean;
}

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  highlight: string;
  categoryBadge: string;
  badgeColor: string;
  tags: string[];
  vibe: string;
}

const SLIDES: Slide[] = [
  {
    id: 'cafe-meetup',
    image: cafeVibesImg,
    title: 'The Sunday Afternoon Table Gathering',
    subtitle: 'Cozy Pune Cafes, Iced Brews & Real Conversations',
    highlight:
      'Unplug your phone, settle into warm cafe seats in Koregaon Park or Kalyani Nagar, and dive into modern classics like Wingspan, Catan, and Cascadia. Dedicated table hosts teach every single rule!',
    categoryBadge: 'Pune Tabletop Culture',
    badgeColor: 'bg-[#FF751F] text-white',
    tags: ['60% Come Solo', 'Beginners Welcome', 'Dedicated Hosts', 'Partner Cafes'],
    vibe: 'Warm, welcoming & deeply social'
  },
  {
    id: 'strategy-dice',
    image: strategyDiceImg,
    title: 'Dice Rolls, Wooden Meeples & Epic Trades',
    subtitle: 'Over 120+ Curated Board Games for Every Taste',
    highlight:
      'From tactile tile-placement to thrilling resource management. Whether you enjoy easy 20-minute fillers or rich strategic eurogames, find fellow players ready to roll the dice with you.',
    categoryBadge: 'Strategic & Casual Gaming',
    badgeColor: 'bg-[#4AB4A4] text-[#10173E]',
    tags: ['120+ Board Games', 'No Experience Needed', 'Tactile Pieces', 'Table Matching'],
    vibe: 'Engaging, thoughtful & rewarding'
  },
  {
    id: 'party-laughter',
    image: partyFunImg,
    title: 'Unfiltered Laughter & Instant Teammates',
    subtitle: 'From Strangers to Friends in 15 Minutes Flat',
    highlight:
      'Social deduction, word games, secret identities, and hilarious bluffing. Leave the awkward small talk behind—our party tables will have you cheering and sharing high-fives in no time.',
    categoryBadge: 'Social & Party Games',
    badgeColor: 'bg-[#9440DD] text-white',
    tags: ['High Energy', 'Zero Awkwardness', 'Icebreaker Tables', 'Sunday 3-8 PM'],
    vibe: 'Electric, joyful & contagious energy'
  }
];

export const WeekendPhotoCarousel: React.FC<WeekendPhotoCarouselProps> = ({
  onExploreEvents,
  onJoinClick,
  isAuthenticated = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      aria-label="Weekend Experience Gallery"
      className="rounded-3xl bg-[#151E4D] border border-[#283677] p-5 sm:p-7 shadow-xl overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A255C] border border-[#283677] text-xs font-bold text-[#FFD230] uppercase tracking-wider mb-2 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD230]" />
            <span>Community Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            See What Your Weekend Could Look Like
          </h2>
          <p className="text-sm text-[#CBD5E1] mt-1 max-w-2xl">
            A glimpse into our Sunday afternoons: tactile games, iced lattes, unfiltered laughter, and an inviting table waiting for you in Pune.
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            className="p-2 rounded-xl bg-[#1A255C] border border-[#283677] hover:bg-[#202D6E] text-[#94A3B8] hover:text-white transition-colors"
            title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous photo"
            className="p-2.5 rounded-xl bg-[#1A255C] border border-[#283677] hover:bg-[#202D6E] hover:border-[#FF751F]/60 text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next photo"
            className="p-2.5 rounded-xl bg-[#1A255C] border border-[#283677] hover:bg-[#202D6E] hover:border-[#FF751F]/60 text-white transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="relative rounded-2xl overflow-hidden bg-[#10173E] border border-[#283677] min-h-[380px] lg:min-h-[460px] flex flex-col lg:flex-row group">
        {/* Photo view */}
        <div className="relative w-full lg:w-3/5 h-64 sm:h-80 lg:h-auto overflow-hidden bg-black/40">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10173E] via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:to-[#10173E]" />

          {/* Badge over photo */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-heading shadow-md ${currentSlide.badgeColor}`}
            >
              {currentSlide.categoryBadge}
            </span>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-[#CBD5E1] border border-white/10">
              {currentSlide.vibe}
            </span>
          </div>

          {/* Slide counter indicator */}
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/15">
            {currentIndex + 1} of {SLIDES.length}
          </div>
        </div>

        {/* Narrative & Details */}
        <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-[#10173E] space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD230] font-heading">
                {currentSlide.subtitle}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug font-heading">
                {currentSlide.title}
              </h3>
            </div>

            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              {currentSlide.highlight}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentSlide.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1A255C] border border-[#283677] text-[#94A3B8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#283677]/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={onJoinClick}
                className="px-5 py-3 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                <span>Save a Seat This Sunday</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onExploreEvents}
                className="px-5 py-3 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                <span>Browse Upcoming Meetups</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              type="button"
              onClick={onExploreEvents}
              className="px-4 py-3 rounded-xl bg-[#1A255C] hover:bg-[#202D6E] border border-[#283677] text-[#CBD5E1] hover:text-white font-semibold text-xs transition-colors text-center"
            >
              See All Events
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
