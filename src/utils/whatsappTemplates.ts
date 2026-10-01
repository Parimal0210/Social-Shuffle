import { ShuffleEvent, WhatsAppMessageType } from '../types';

export interface WhatsAppPreset {
  id: WhatsAppMessageType;
  title: string;
  emoji: string;
  badge: string;
  description: string;
  template: string;
}

export const WHATSAPP_COMMUNITY_PRESETS: WhatsAppPreset[] = [
  {
    id: 'announcement',
    title: 'New Meetup Announcement',
    emoji: '🎉',
    badge: 'Launch',
    description: 'Weekly meetup announcement with venue, timing, ticket price, and RSVP link',
    template: `🎲 *SOCIAL SHUFFLE PUNE — NEW MEETUP ANNOUNCEMENT!* 🎲

Hey Shufflers! Pune’s friendliest tabletop community is back with *Social Shuffle #{number}*! 🚀

📅 *Date & Schedule:* {date} | {time}
📍 *Venue:* {venue}, {area} ({address})
🎟️ *Pass:* ₹{ticket_price} per person (Includes welcome beverage, curated tables & dedicated game hosts)
👥 *Total Capacity:* {capacity} Shufflers

🎲 *Featured Games This Week:*
• Catan, Ticket to Ride & Wingspan (Engine builders)
• Coup, Secret Hitler & Avalon (Deception & bluffing)
• Just One, Flip 7 & Codenames (Party madness)
• Azul & Splendor (Modern classics)

💡 *First-timer or coming solo?*
Don’t worry! More than 60% of our attendees come solo. Our friendly hosts teach all rules at every table from scratch. Beginners warmly welcomed!

👉 *Reserve your spot now before it fills up:*
{link}

See you on the board! 🎲✨`
  },
  {
    id: 'seats_remaining',
    title: 'Seats Remaining — Hurry Up!',
    emoji: '⚡',
    badge: 'Urgent FOMO',
    description: 'Real-time remaining spots notification creating ticket urgency',
    template: `🚨 *HURRY UP! ONLY {seats_left} SEATS REMAINING!* 🚨

Table spots for *Social Shuffle #{number}* are flying fast! 🔥

📍 *Venue:* {venue}, {area}
⏰ *Time:* {time}
🎟️ *Spots Left:* *Only {seats_left} of {capacity} seats remaining!*

Once these final {seats_left} passes are claimed, registrations will automatically close and we will be strictly housefull!

⚡ *Grab your table pass right now:*
{link}

Don't miss out on Sunday afternoon board game banter, dice rolling, and cold craft brews! 🎲🚀`
  },
  {
    id: 'sold_out',
    title: 'Sold Out / Housefull',
    emoji: '🚫',
    badge: 'Milestone',
    description: 'Official sold-out milestone notice with waitlist details',
    template: `🚫 *HOUSEFULL & 100% SOLD OUT!* 🚫

Huge news, Pune Shufflers! *Social Shuffle #{number}* at *{venue}* is officially *SOLD OUT*! 🎉

All {capacity} seats have been reserved by our wonderful community! 

🙌 A massive thank you to everyone who grabbed their spots! Our organizing hosts are busy prepping game tables, sorting meeples, and setting up scoreboards for Sunday.

⚠️ *Missed out on tickets?*
Stay tuned in this WhatsApp group! If any registered attendee cancels their spot, we will drop a spot re-opening alert here first.

Otherwise, watch out for next week's edition drop! 🎲✨`
  },
  {
    id: 'event_reminder',
    title: '24h Countdown / Game Day Tomorrow',
    emoji: '⏰',
    badge: 'Reminder',
    description: 'Pre-event checklist, timing, venue directions, and host contacts',
    template: `⏳ *GAME DAY TOMORROW! ARE YOU READY?* 🎲

Just a friendly reminder for everyone registered for *Social Shuffle #{number}* tomorrow!

📍 *Venue:* {venue}
📌 *Address:* {address}
⏰ *Schedule:* {time}
🚗 *Parking:* Dedicated two-wheeler and valet / four-wheeler parking available at the venue.

💡 *Arrival Checklist:*
1. Please arrive 10-15 minutes early so we can seat you at your favorite opening table!
2. Have your digital QR pass ready on your phone (from email or dashboard).
3. First-timer? Our hosts start game walk-throughs at 4:15 PM sharp!

Need help finding the venue? Host Aman & Parimal are available on WhatsApp. See you all tomorrow! 🥳`
  },
  {
    id: 'game_roster',
    title: 'Featured Game Roster',
    emoji: '♟️',
    badge: 'Game Library',
    description: 'Spotlight of planned party, bluffing, and strategy board games',
    template: `♟️ *FEATURED GAME ROSTER — SOCIAL SHUFFLE #{number}!* ♟️

Here is what is hitting the tables this Sunday at *{venue}* ({area}):

🎯 *Party & Laughter:*
• Flip 7, Just One, Codenames, Exploding Kittens

🧠 *Bluffing & Social Deduction:*
• Coup, Secret Hitler, Blood on the Clocktower, Avalon

👑 *Deep Strategy & Euro Games:*
• Catan, Dune: Imperium, Wingspan, Azul, Splendor

⚡ *Dexterity & Quick Duels:*
• Klask, Mindbug, Skull

Got a specific game you've been itching to play? Reply to this message!
👉 Book your spot here: {link}`
  },
  {
    id: 'custom',
    title: 'Custom Announcement',
    emoji: '💬',
    badge: 'Freeform',
    description: 'Draft your own customized message with dynamic event tag replacements',
    template: `📢 *COMMUNITY ANNOUNCEMENT — SOCIAL SHUFFLE PUNE* 🎲

Hey Shufflers!

[Type your custom announcement here]

📍 *Meetup:* Social Shuffle #{number} — {title}
📅 *Schedule:* {time}
📍 *Venue:* {venue}, {area}
🎟️ *Seats Left:* {seats_left}
👉 *RSVP Link:* {link}`
  }
];

/**
 * Replaces dynamic token placeholders in the template with actual event values.
 */
export function formatWhatsAppMessage(
  template: string,
  event?: ShuffleEvent | null,
  totalRegisteredPax: number = 0,
  customLink?: string
): string {
  if (!event) {
    return template
      .replace(/\{number\}/g, '35')
      .replace(/\{title\}/g, 'Pune Board Game Meetup')
      .replace(/\{date\}/g, 'Upcoming Sunday')
      .replace(/\{time\}/g, 'Sunday, 4:00 PM – 7:30 PM')
      .replace(/\{venue\}/g, 'Pune Meetup Venue')
      .replace(/\{address\}/g, 'Pune, Maharashtra')
      .replace(/\{area\}/g, 'Koregaon Park')
      .replace(/\{capacity\}/g, '65')
      .replace(/\{ticket_price\}/g, '350')
      .replace(/\{seats_left\}/g, '12')
      .replace(/\{link\}/g, customLink || (typeof window !== 'undefined' ? window.location.origin : 'https://socialshuffle.in'));
  }

  const seatsLeft = Math.max(0, (event.capacity || 0) - totalRegisteredPax);
  const webLink = customLink || (typeof window !== 'undefined' ? `${window.location.origin}` : 'https://socialshuffle.in');

  return template
    .replace(/\{number\}/g, String(event.number || ''))
    .replace(/\{title\}/g, event.title || '')
    .replace(/\{date\}/g, event.date || '')
    .replace(/\{time\}/g, event.time || '')
    .replace(/\{venue\}/g, event.venue || '')
    .replace(/\{address\}/g, event.address || '')
    .replace(/\{area\}/g, event.area || '')
    .replace(/\{capacity\}/g, String(event.capacity || 60))
    .replace(/\{ticket_price\}/g, String(event.ticketPrice || 300))
    .replace(/\{seats_left\}/g, String(seatsLeft))
    .replace(/\{link\}/g, webLink);
}

/**
 * Generates direct WhatsApp share intent URL with pre-filled message text.
 */
export function getWhatsAppShareUrl(text: string, phoneOrGroup?: string): string {
  const encodedText = encodeURIComponent(text);
  if (phoneOrGroup && phoneOrGroup.startsWith('+')) {
    const cleanPhone = phoneOrGroup.replace(/[^\d]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export const OFFICIAL_WHATSAPP_GROUPS = [
  {
    id: 'announcements',
    name: 'Social Shuffle Pune — Official Announcements (Admin Only)',
    memberCount: '2,450+ Shufflers',
    link: 'https://chat.whatsapp.com/demo-pune-announcements'
  },
  {
    id: 'table_chat',
    name: 'Social Shuffle — Table Talk & Game Matchmaking',
    memberCount: '1,820+ Shufflers',
    link: 'https://chat.whatsapp.com/demo-table-talk'
  },
  {
    id: 'strategy_geeks',
    name: 'Social Shuffle — Heavy Strategy & Euro Gamers',
    memberCount: '640+ Shufflers',
    link: 'https://chat.whatsapp.com/demo-heavy-gamers'
  }
];
