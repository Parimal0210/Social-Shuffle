import React, { useState } from 'react';
import {
  Instagram,
  ShieldCheck,
  Heart,
  MapPin,
  Mail,
  Phone,
  Lock,
  Calendar,
  Trophy,
  Users,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { SocialShuffleIcon } from '../SocialShuffleLogo';
import { ParticipantTab } from './ParticipantNav';

interface ParticipantFooterProps {
  onNavigateTab?: (tab: ParticipantTab) => void;
}

export const ParticipantFooter: React.FC<ParticipantFooterProps> = ({ onNavigateTab }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleTabClick = (tab: ParticipantTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="w-full bg-[#080D1F] border-t border-[#1F305E]/80 text-slate-300 mt-12 transition-colors">
        {/* Top Community Join Banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#111C3B] via-[#0F172A] to-[#1E1B4B] border border-[#1F305E] relative overflow-hidden shadow-2xl">
            {/* Background subtle glow circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF6036]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#35C8A8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6036]/15 border border-[#FF6036]/30 text-[#FF6036] text-xs font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5" />
                  <span>Join The Social Shuffle Pune Community</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Never miss an offline board game meetup in Pune!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Connect with 2,400+ friendly Pune shufflers on WhatsApp & Instagram. Get instant table RSVP drops, spot alerts, rule walk-throughs, and weekend cafe photos.
                </p>
              </div>

              {/* Action Buttons: WhatsApp & Instagram */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                {/* WhatsApp Community Link */}
                <a
                  href="https://chat.whatsapp.com/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#25D366]/25 transition-all transform hover:-translate-y-0.5"
                >
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Join WhatsApp Community</span>
                </a>

                {/* Instagram Community Link */}
                <a
                  href="https://instagram.com/socialshufflepune"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#E1306C]/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Instagram className="w-4 h-4 shrink-0" />
                  <span>Follow @socialshufflepune</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Usual Footer Navigation Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#1F305E]/40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Identity */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <SocialShuffleIcon size={32} />
                <span className="text-base font-black text-white tracking-tight">Social Shuffle</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pune&apos;s premier offline community for board gaming, friendly banter, and screen-free social meetups.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#FF6036] shrink-0" />
                <span>Koregaon Park • Baner • Viman Nagar • FC Road</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-200">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleTabClick('events')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#35C8A8]" />
                    <span>Upcoming Meetups</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabClick('profile')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#FFC226]" />
                    <span>My Profile & Progress</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabClick('community')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-[#8F43EE]" />
                    <span>Community & Safety</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabClick('community')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#FF6036]" />
                    <span>Volunteer as Table Host</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Safety & Trust */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-200">
                Safety & Standards
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                  <span>Strict Zero-Harassment Policy</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                  <span>Verified QR Door Passes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#FF6036] shrink-0" />
                  <span>First-Timer & Solo Friendly</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                  <span>256-Bit SSL Encrypted Passes</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Host Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-200">
                Host Desk & Contact
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href="mailto:admin@socialshuffle.com"
                    className="hover:text-white transition-colors"
                  >
                    admin@socialshuffle.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>+91 98220 11223 (Host Aman)</span>
                </li>
                <li className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  Pune, Maharashtra 411001 • Every Saturday & Sunday afternoon
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="bg-[#050814] border-t border-[#1F305E]/50 py-5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            {/* All rights reserved */}
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span>© {new Date().getFullYear()} Social Shuffle Pune. All rights are reserved.</span>
            </div>

            {/* Legal policy links */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                id="footer-privacy-policy-btn"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-white hover:underline transition-colors"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                id="footer-terms-btn"
                onClick={() => setShowTermsModal(true)}
                className="hover:text-white hover:underline transition-colors"
              >
                Community Guidelines
              </button>
              <span>•</span>
              <a
                href="https://instagram.com/socialshufflepune"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition-colors inline-flex items-center gap-1"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#0D1527] border border-[#1F305E] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F305E] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#35C8A8]/10 text-[#35C8A8]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Privacy Policy</h3>
                  <p className="text-xs text-slate-400">Social Shuffle Community Pune • Effective 2026</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-300 pr-1 leading-relaxed">
              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">1. Commitment to Participant Privacy</h4>
                <p>
                  Social Shuffle Pune is dedicated to fostering genuine offline human connections through board games while fiercely protecting your personal data. We do not sell, rent, monetize, or trade your contact details with any third parties or advertisers.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">2. Information We Collect</h4>
                <p>When you register for a meetup or create a player profile, we collect:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Personal Identifiers:</strong> Name, email address, and WhatsApp/phone number.</li>
                  <li><strong>Event Bookings:</strong> Meetup date, venue selected, ticket pax count, and payment transaction status.</li>
                  <li><strong>Gameplay Progress:</strong> Games played, titles tried, and optional feedback submitted to help us curate better game tables.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">3. How Your Information Is Used</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Generating your personalized QR entry pass for check-in at Pune cafe entrances.</li>
                  <li>Sending confirmation emails with directions and meetup updates.</li>
                  <li>Community announcements on WhatsApp for RSVP spots and table allocations.</li>
                  <li>Emergency contact support in case of event schedule changes.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">4. Payment & Financial Security</h4>
                <p>
                  Ticket transactions are processed securely via verified gateways (Razorpay) using standard 256-bit SSL encryption. Social Shuffle never receives, accesses, or stores your credit/debit card numbers, CVVs, or UPI banking PINs.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">5. Zero Harassment & Safety Data</h4>
                <p>
                  Anonymous safety and feedback reports submitted through our community portal are handled with absolute confidentiality and investigated directly by the lead community founders.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">6. Your Rights & Data Deletion</h4>
                <p>
                  You have the right to inspect, correct, or permanently delete your profile and registration history at any time. Simply email our host desk at <a href="mailto:admin@socialshuffle.com" className="text-[#35C8A8] underline">admin@socialshuffle.com</a> with your registered email or phone number.
                </p>
              </section>
            </div>

            <div className="pt-3 border-t border-[#1F305E] flex justify-end shrink-0">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 rounded-xl bg-[#35C8A8] hover:bg-[#2EB899] text-[#0A1128] font-bold text-xs transition-colors"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Terms & Guidelines Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#0D1527] border border-[#1F305E] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F305E] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF6036]/10 text-[#FF6036]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Community Guidelines</h3>
                  <p className="text-xs text-slate-400">Social Shuffle Pune Code of Conduct</p>
                </div>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs text-slate-300 pr-1 leading-relaxed">
              <p>
                Social Shuffle is an inclusive, respectful space for adults in Pune to unwind, discover new tabletop board games, and make genuine friends.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Respect & Inclusivity:</strong> Treat every participant, cafe staff member, and table host with warmth and respect. Unwanted romantic advances, harassment, or offensive speech will result in immediate removal and permanent meetup bans.</li>
                <li><strong>Table Sportsmanship:</strong> Board games are for fun, not ego! Welcome beginners warmly, guide players through rules patiently, and win or lose with grace.</li>
                <li><strong>Game Care:</strong> Treat cafe and host game copies with care. Keep beverages away from open card decks and board components.</li>
                <li><strong>Punctuality:</strong> Try to arrive on time so tables can be seated and game tutorials can begin together without delays.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#1F305E] flex justify-end shrink-0">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#FF6036] hover:bg-[#E54F27] text-white font-bold text-xs transition-colors"
              >
                Understood & Agreed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
