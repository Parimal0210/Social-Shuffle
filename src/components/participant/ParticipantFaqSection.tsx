import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Compass,
  HeartHandshake,
  Dices,
  Coffee,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  category: 'first-timers' | 'schedule' | 'etiquette' | 'games';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'solo',
    question: 'Can I join solo?',
    shortAnswer: 'Yes, definitely!',
    detailedAnswer:
      'Over 60% of our attendees come completely on their own. You will never have to worry about feeling out of place—our co-founders, Parimal and Diksha, personally greet you at the entrance, introduce you to friendly fellow players, and seat you at a welcoming table within minutes.',
    category: 'first-timers'
  },
  {
    id: 'experience',
    question: 'Should I need to have prior experience?',
    shortAnswer: 'Not at all!',
    detailedAnswer:
      'Whether you have never touched a modern board game or only know classic Ludo/Monopoly, you are in great hands. Our dedicated table hosts and volunteers explain every single game rule step-by-step and guide you through the first few turns. No tedious rulebook reading required!',
    category: 'first-timers'
  },
  {
    id: 'timing',
    question: 'Can I join at any time during the event?',
    shortAnswer: 'Yes, drop in whenever your schedule allows!',
    detailedAnswer:
      'Our Sunday sessions run from 3:00 PM to 8:00 PM. While arriving around 3:00 PM gives you the first pick of tables and long-form strategy games, games rotate continuously throughout the evening. If you arrive at 4:30 PM or 5:30 PM, a fresh game table opens up within 10 to 15 minutes.',
    category: 'schedule'
  },
  {
    id: 'friends',
    question: 'Can I bring my friend or a group of friends?',
    shortAnswer: 'Yes, definitely! The more the merrier.',
    detailedAnswer:
      'You are warmly encouraged to bring friends, partners, flatmates, or colleagues! When registering for an event, you can add multiple guest passes (pax count), or invite your friends to register their own accounts so they can track their personal game passport, badges, and stats.',
    category: 'first-timers'
  },
  {
    id: 'etiquette',
    question: 'What board game etiquette should I know?',
    shortAnswer: 'Simple, respectful, and friendly table manners.',
    detailedAnswer:
      'Tabletop gaming is deeply social. We ask all shufflers to follow four simple golden rules:\n• Clean hands: Keep drinks on coasters and greasy snacks away from cards and wooden components.\n• No "Quarterbacking": Allow everyone to make their own strategic decisions without unsolicited coaching.\n• Gracious play: Celebrate clever moves by your opponents, enjoy the journey, and keep the banter playful.\n• Unplug & Be Present: Keep phones on silent so everyone can immerse in the tactile fun and laughter.',
    category: 'etiquette'
  },
  {
    id: 'games-library',
    question: 'What kinds of games do you play at meetups?',
    shortAnswer: 'Over 120+ handpicked modern tabletop games.',
    detailedAnswer:
      'Our library spans every flavor of tabletop fun: from high-energy party and social deduction games (Codenames, Dixit, Secret Hitler, Just One), to award-winning modern classics (Catan, Ticket to Ride, Wingspan, Azul, Cascadia), to deep euro strategy titles (Terraforming Mars, Dune: Imperium, Brass: Birmingham). We match tables based on everyone’s mood!',
    category: 'games'
  },
  {
    id: 'registration',
    question: 'How do seat bookings and reservations work?',
    shortAnswer: 'Fast, free, and instant via the Social Shuffle platform.',
    detailedAnswer:
      'Simply choose an upcoming edition from the Home or Events tab and click "Register Now". Because partner cafes have strict capacity limits (usually 30–40 seats) to prevent overcrowding and ensure table comfort, reserving your spot early is highly recommended. If your plans change, you can easily cancel so a waitlisted shuffler gets your seat.',
    category: 'schedule'
  },
  {
    id: 'food-drinks',
    question: 'Are food and beverages available at the venues?',
    shortAnswer: 'Yes! Hosted at Pune’s finest cafes with delicious food menus.',
    detailedAnswer:
      'All Social Shuffle editions take place at premium partner cafes across Koregaon Park, Kalyani Nagar, and Baner. You can order directly from the cafe’s artisan coffee bar, iced teas, smoothies, woodfired pizzas, and finger foods throughout the game session.',
    category: 'etiquette'
  }
];

interface ParticipantFaqSectionProps {
  onRegisterClick?: () => void;
  onExploreEvents?: () => void;
  isAuthenticated?: boolean;
}

export const ParticipantFaqSection: React.FC<ParticipantFaqSectionProps> = ({
  onRegisterClick,
  onExploreEvents,
  isAuthenticated = false
}) => {
  const [openIds, setOpenIds] = useState<string[]>(['solo', 'experience']);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleAccordion = (id: string) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter(faq => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.detailedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section aria-label="Frequently Asked Questions" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A255C] border border-[#283677] text-xs font-bold text-[#FFD230] uppercase tracking-wider mb-2 font-heading">
            <HelpCircle className="w-3.5 h-3.5 text-[#4AB4A4]" />
            <span>Got Questions? We’ve Got You Covered</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#CBD5E1] mt-1 max-w-2xl">
            Everything you need to know about joining Social Shuffle, table etiquette, and how our Sunday meetups work in Pune.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#151E4D] border border-[#283677] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF751F] transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'first-timers', label: 'Solo & First-Timers' },
          { id: 'schedule', label: 'Schedule & Booking' },
          { id: 'etiquette', label: 'Etiquette & Food' },
          { id: 'games', label: 'Games Library' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-heading ${
              activeCategory === cat.id
                ? 'bg-[#FF751F] text-white shadow-sm'
                : 'bg-[#151E4D] border border-[#283677] text-[#94A3B8] hover:text-white hover:bg-[#1A255C]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#151E4D] border border-[#283677] text-[#94A3B8]">
            <p className="text-sm">No matching questions found.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-2 text-xs text-[#FF751F] font-bold hover:underline"
            >
              Clear search & view all
            </button>
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-[#151E4D] border-[#FF751F]/60 shadow-md ring-1 ring-[#FF751F]/20'
                    : 'bg-[#151E4D] border-[#283677] hover:border-[#283677] hover:bg-[#1A255C]/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-[#FF751F] text-white'
                          : 'bg-[#1A255C] text-[#94A3B8]'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-white font-heading">
                          {faq.question}
                        </span>
                      </div>
                      <p className="text-xs text-[#4AB4A4] font-semibold mt-0.5">
                        {faq.shortAnswer}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#10173E] border border-[#283677] text-[#94A3B8] shrink-0 mt-0.5 sm:mt-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#FF751F]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#283677]/60">
                    <div className="p-4 rounded-xl bg-[#10173E] border border-[#283677]/80 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">
                      {faq.detailedAnswer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1A255C] to-[#151E4D] border border-[#283677] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#4AB4A4]/20 border border-[#4AB4A4]/40 flex items-center justify-center shrink-0 text-[#4AB4A4]">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white font-heading">
              Have a question not listed here?
            </h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Ask Parimal & Diksha directly at any Sunday meetup, or RSVP now to experience it firsthand!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
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
              Browse Next Meetup
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
