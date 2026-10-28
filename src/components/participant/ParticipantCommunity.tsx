import React, { useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  PhoneCall,
  HeartHandshake,
  Star,
  CheckCircle2,
  Send,
  ShieldAlert,
  Instagram,
  Mail,
  MessageCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportCategory } from '../../types';

export const ParticipantCommunity: React.FC = () => {
  const {
    currentParticipant,
    events,
    submitFeedback,
    submitSafetyReport,
    submitVolunteerApplication,
    volunteersList,
    isAuthenticated,
    openAuthModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feedback' | 'report' | 'contacts' | 'volunteer'>(
    isAuthenticated ? 'feedback' : 'contacts'
  );

  // Feedback form state
  const [feedbackEventId, setFeedbackEventId] = useState<string>(events[0]?.id || '');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [venueRating, setVenueRating] = useState<number>(5);
  const [gameRating, setGameRating] = useState<number>(5);
  const [hostRating, setHostRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isAnonymousFeedback, setIsAnonymousFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // Safety Report form state
  const [reportType, setReportType] = useState<ReportCategory>('Community concern');
  const [reportEventId, setReportEventId] = useState<string>('');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [personInvolved, setPersonInvolved] = useState<string>('');
  const [isAnonymousReport, setIsAnonymousReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Volunteer form state
  const [volReason, setVolReason] = useState<string>('');
  const [volExperience, setVolExperience] = useState<string>('');
  const [volSkills, setVolSkills] = useState<string>('');
  const [volAvailability, setVolAvailability] = useState<string>('Sundays 3 PM - 8 PM');
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([
    'Teaching Board Games'
  ]);
  const [volSuccess, setVolSuccess] = useState<boolean>(false);

  // Existing application check
  const existingApp = volunteersList.find(v => v.email.toLowerCase() === currentParticipant.email.toLowerCase());

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ev = events.find(item => item.id === feedbackEventId);
    submitFeedback({
      eventId: feedbackEventId,
      eventTitle: ev?.title || 'Social Shuffle Meetup',
      participantId: isAnonymousFeedback ? undefined : currentParticipant.id,
      participantName: isAnonymousFeedback ? undefined : currentParticipant.name,
      isAnonymous: isAnonymousFeedback,
      overallRating,
      venueRating,
      gameRating,
      hostRating,
      suggestions: feedbackText
    });
    setFeedbackSuccess(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ev = events.find(item => item.id === reportEventId);
    submitSafetyReport({
      eventId: reportEventId || undefined,
      eventTitle: ev?.title || undefined,
      type: reportType,
      description: reportDesc,
      personInvolved: personInvolved || undefined,
      isAnonymous: isAnonymousReport,
      reporterName: isAnonymousReport ? undefined : currentParticipant.name,
      reporterContact: isAnonymousReport ? undefined : currentParticipant.phone
    });
    setReportSuccess(true);
    setReportDesc('');
    setPersonInvolved('');
    setTimeout(() => setReportSuccess(false), 4000);
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVolunteerApplication({
      name: currentParticipant.name,
      email: currentParticipant.email,
      phone: currentParticipant.phone,
      area: currentParticipant.area,
      reason: volReason,
      experience: volExperience,
      skills: volSkills,
      availability: volAvailability,
      preferredResponsibilities: selectedResponsibilities
    });
    setVolSuccess(true);
  };

  const toggleResponsibility = (roleName: string) => {
    if (selectedResponsibilities.includes(roleName)) {
      setSelectedResponsibilities(selectedResponsibilities.filter(r => r !== roleName));
    } else {
      setSelectedResponsibilities([...selectedResponsibilities, roleName]);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[#202B61] pb-3 overflow-x-auto scrollbar-none">
        <button
          id="tab-community-feedback"
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-[#FF751F] text-white shadow-sm shadow-[#FF751F]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#151E4D]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </button>

        <button
          id="tab-community-report"
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'report'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#151E4D]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Report an Issue</span>
        </button>

        <button
          id="tab-community-contacts"
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'bg-[#FF751F] text-white shadow-sm shadow-[#FF751F]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#151E4D]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Host Contacts</span>
        </button>

        <button
          id="tab-community-volunteer"
          onClick={() => setActiveTab('volunteer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
            activeTab === 'volunteer'
              ? 'bg-[#4AB4A4] text-[#10173E] shadow-sm shadow-[#4AB4A4]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#151E4D]'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Join as Volunteer</span>
        </button>
      </div>

      {/* 1. FEEDBACK SUB-TAB */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-heading font-bold text-white">Share Your Meetup Feedback</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Help us craft better board game weekends in Pune! Your honest thoughts guide our game choices, venues, and hosting style.
            </p>
          </div>

          {feedbackSuccess && (
            <div className="p-3.5 rounded-xl bg-[#4AB4A4]/10 border border-[#4AB4A4]/30 text-[#4AB4A4] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your feedback has been shared with the Social Shuffle host team.</span>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-white font-medium mb-1">Select Event</label>
              <select
                value={feedbackEventId}
                onChange={e => setFeedbackEventId(e.target.value)}
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF751F]"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.venue})
                  </option>
                ))}
              </select>
            </div>

            {/* Star ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#1A255C] border border-[#283677]">
              <div>
                <span className="block text-[#94A3B8] font-medium mb-1">Overall Experience</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= overallRating ? 'text-[#FFD230] fill-[#FFD230]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[#94A3B8] font-medium mb-1">Venue & Atmosphere</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setVenueRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= venueRating ? 'text-[#FFD230] fill-[#FFD230]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[#94A3B8] font-medium mb-1">Board Game Selection</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setGameRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= gameRating ? 'text-[#FFD230] fill-[#FFD230]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[#94A3B8] font-medium mb-1">Host Explanations & Energy</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setHostRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= hostRating ? 'text-[#FFD230] fill-[#FFD230]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-1">
                Suggestions, Comments or Game Requests
              </label>
              <textarea
                rows={3}
                required
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="What did you love? Which games should we bring to the next meetup?"
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl p-3 text-white focus:outline-none focus:border-[#FF751F]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={isAnonymousFeedback}
                  onChange={e => setIsAnonymousFeedback(e.target.checked)}
                  className="rounded border-[#283677] text-[#FF751F] focus:ring-0"
                />
                <span>Submit anonymously</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold flex items-center gap-2 shadow-sm shadow-[#FF751F]/25 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. REPORT AN ISSUE SUB-TAB */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#151E4D] border border-rose-500/30 shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Safe Community Reporting</h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Social Shuffle is dedicated to zero tolerance for harassment, discomfort, or disrespectful conduct. All reports go directly to our executive organizers and are strictly confidential.
              </p>
            </div>
          </div>

          {reportSuccess && (
            <div className="p-3.5 rounded-xl bg-[#4AB4A4]/10 border border-[#4AB4A4]/30 text-[#4AB4A4] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report submitted safely. Our organizers will investigate with utmost discretion.</span>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-white font-medium mb-1">Issue Category</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as ReportCategory)}
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Uncomfortable interaction">Uncomfortable interaction</option>
                <option value="Harassment">Harassment / Boundary violation</option>
                <option value="Community concern">Community concern</option>
                <option value="Venue issue">Venue safety or comfort issue</option>
                <option value="Event issue">Event organization issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-1">Relevant Event (Optional)</label>
              <select
                value={reportEventId}
                onChange={e => setReportEventId(e.target.value)}
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">General / Not tied to specific event</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-1">
                Detailed Description of the Situation
              </label>
              <textarea
                rows={4}
                required
                value={reportDesc}
                onChange={e => setReportDesc(e.target.value)}
                placeholder="Please describe what happened, the approximate time, and how we can support you."
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-1">
                Person Involved (Optional)
              </label>
              <input
                type="text"
                value={personInvolved}
                onChange={e => setPersonInvolved(e.target.value)}
                placeholder="Name or table location if known"
                className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={isAnonymousReport}
                  onChange={e => setIsAnonymousReport(e.target.checked)}
                  className="rounded border-[#283677] text-rose-600 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" />
                  Submit Anonymously
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold flex items-center gap-2 shadow-sm shadow-rose-600/25 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Submit Confidential Report</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. HOST CONTACTS SUB-TAB */}
      {activeTab === 'contacts' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF751F] block mb-1">
                Direct Channels
              </span>
              <h3 className="text-xl font-heading font-bold text-white">Social Shuffle Pune Hosts</h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Have questions before coming alone? Want to suggest a venue or collaborate? Reach out to us anytime!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* WhatsApp Community */}
              <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2">
                <div className="flex items-center gap-2 text-[#4AB4A4] font-bold text-sm">
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Community</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Join our official WhatsApp group for weekly RSVP announcements, table chats, and spot drops.
                </p>
                <div className="pt-1">
                  <a
                    href="https://chat.whatsapp.com/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-bold text-[#4AB4A4] hover:underline"
                  >
                    Join 1,200+ Pune Shufflers →
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2">
                <div className="flex items-center gap-2 text-[#FF751F] font-bold text-sm">
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Catch event reels, winner spotlights, photos, and game tutorials.
                </p>
                <div className="pt-1">
                  <a
                    href="https://instagram.com/socialshufflepune"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-bold text-[#FF751F] hover:underline"
                  >
                    @socialshufflepune →
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2">
                <div className="flex items-center gap-2 text-[#4AB4A4] font-bold text-sm">
                  <Mail className="w-5 h-5" />
                  <span>Official Email</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  For venue partnerships, corporate game nights, and official inquiries.
                </p>
                <div className="pt-1 text-xs font-bold text-[#4AB4A4]">
                  hello@socialshuffle.in
                </div>
              </div>

              {/* Lead Host */}
              <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2">
                <div className="flex items-center gap-2 text-[#FFD230] font-bold text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>Main Host</span>
                </div>
                <p className="text-xs text-white">
                  <strong>Aman Joshi</strong> — Founder & Head Game Explainer
                </p>
                <div className="pt-1 text-xs text-[#94A3B8]">
                  Direct: +91 98200 54321
                </div>
              </div>
            </div>
          </div>

          {/* First Timer FAQ card */}
          <div className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] space-y-2 text-xs text-[#94A3B8]">
            <h4 className="font-heading font-bold text-white text-sm">Coming to Social Shuffle for the first time?</h4>
            <p>• <strong className="text-white">Do I need to know board games?</strong> Not at all! Our hosts explain every single game rule patiently before you play.</p>
            <p>• <strong className="text-white">Can I come solo?</strong> Over 60% of our shufflers come solo. We seat you with friendly people immediately!</p>
          </div>
        </div>
      )}

      {/* 4. JOIN AS VOLUNTEER SUB-TAB */}
      {activeTab === 'volunteer' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-sm space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#4AB4A4]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#4AB4A4]">Community Crew</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-white mt-1">Become a Social Shuffle Volunteer</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
              Passionate about board games and meeting great people in Pune? Help us welcome newcomers, teach games, and run epic meetup tables!
            </p>
          </div>

          {existingApp ? (
            <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Your Volunteer Application</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  existingApp.status === 'Accepted'
                    ? 'bg-[#4AB4A4]/20 text-[#4AB4A4]'
                    : existingApp.status === 'Under Review'
                    ? 'bg-[#FFD230]/20 text-[#FFD230]'
                    : 'bg-[#10173E] text-[#94A3B8]'
                }`}>
                  {existingApp.status}
                </span>
              </div>
              <p className="text-[#94A3B8]">
                Submitted on {existingApp.submittedAt}. Our organizing team is reviewing your profile and will connect with you via WhatsApp!
              </p>
            </div>
          ) : volSuccess ? (
            <div className="p-4 rounded-xl bg-[#4AB4A4]/10 border border-[#4AB4A4]/30 text-[#4AB4A4] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Application received! We'll reach out to schedule a meetup coffee chat.</span>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#1A255C] border border-[#283677] flex justify-between">
                <div>
                  <span className="text-[#94A3B8] block font-medium">Applicant</span>
                  <span className="font-heading font-bold text-white text-sm">{currentParticipant.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#94A3B8] block font-medium">Contact</span>
                  <span className="text-[#CBD5E1]">{currentParticipant.phone} • {currentParticipant.area}</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-1">
                  Why do you want to volunteer with Social Shuffle?
                </label>
                <textarea
                  rows={2}
                  required
                  value={volReason}
                  onChange={e => setVolReason(e.target.value)}
                  placeholder="Tell us what you love about board games and community building..."
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl p-3 text-white focus:outline-none focus:border-[#4AB4A4]"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1">
                  Previous Event or Volunteering Experience
                </label>
                <input
                  type="text"
                  required
                  value={volExperience}
                  onChange={e => setVolExperience(e.target.value)}
                  placeholder="e.g. Hosted game nights, college fest organizer, hospitality..."
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#4AB4A4]"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1">
                  Key Skills & Favorite Games to Teach
                </label>
                <input
                  type="text"
                  required
                  value={volSkills}
                  onChange={e => setVolSkills(e.target.value)}
                  placeholder="e.g. Can teach Catan, Avalon, Coup, high energy, rules clarity"
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#4AB4A4]"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1.5">
                  Preferred Responsibilities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Teaching Board Games',
                    'Welcoming & Check-in Desk',
                    'Tournament Referee',
                    'Photography & Socials',
                    'Logistics & Game Organization'
                  ].map(roleName => (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => toggleResponsibility(roleName)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        selectedResponsibilities.includes(roleName)
                          ? 'bg-[#4AB4A4]/15 border-[#4AB4A4]/40 text-[#4AB4A4]'
                          : 'bg-[#10173E] border-[#283677] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {roleName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4AB4A4] hover:bg-[#2cb295] text-[#10173E] font-heading font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#4AB4A4]/25 transition-all"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Submit Volunteer Application</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
