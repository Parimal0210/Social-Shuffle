import { ShuffleEvent, Registration } from '../types';

/**
 * Parses event date (YYYY-MM-DD) and human time (e.g. "Sunday, 4:00 PM – 7:30 PM")
 * into Date objects in Asia/Kolkata timezone.
 */
export function parseEventDateRange(dateStr: string, timeStr: string): { start: Date; end: Date } {
  // Fallback defaults
  let startHour = 16;
  let startMin = 0;
  let endHour = 19;
  let endMin = 30;

  try {
    // Clean string and standardize dash
    const cleanTime = timeStr.replace(/–/g, '-');
    const timeParts = cleanTime.split('-');

    const parseTimeComponent = (str: string): { hour: number; min: number } | null => {
      const match = str.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (!match) return null;
      let h = parseInt(match[1], 10);
      const m = match[2] ? parseInt(match[2], 10) : 0;
      const meridiem = match[3].toUpperCase();
      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return { hour: h, min: m };
    };

    if (timeParts.length >= 2) {
      const parsedStart = parseTimeComponent(timeParts[0]);
      const parsedEnd = parseTimeComponent(timeParts[1]);
      if (parsedStart) {
        startHour = parsedStart.hour;
        startMin = parsedStart.min;
      }
      if (parsedEnd) {
        endHour = parsedEnd.hour;
        endMin = parsedEnd.min;
      }
    } else if (timeParts.length === 1) {
      const parsedStart = parseTimeComponent(timeParts[0]);
      if (parsedStart) {
        startHour = parsedStart.hour;
        startMin = parsedStart.min;
        endHour = startHour + 3;
      }
    }
  } catch {
    // Keep safe defaults
  }

  // Parse YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
  const year = isNaN(y) ? 2026 : y;
  const month = isNaN(m) ? 9 : m - 1;
  const day = isNaN(d) ? 27 : d;

  const startDate = new Date(year, month, day, startHour, startMin, 0);
  const endDate = new Date(year, month, day, endHour, endMin, 0);

  return { start: startDate, end: endDate };
}

/**
 * Formats a Date object to UTC string suitable for Google Calendar (YYYYMMDDTHHmmssZ)
 */
function toUtcString(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Generates direct Google Calendar Web Intent URL for 1-click addition with reminders.
 */
export function getGoogleCalendarUrl(event: ShuffleEvent, registration?: Registration): string {
  const { start, end } = parseEventDateRange(event.date, event.time);
  const dates = `${toUtcString(start)}/${toUtcString(end)}`;

  const title = `🎲 Social Shuffle #${event.number}: ${event.title}`;
  const location = `${event.venue}, ${event.address}, Pune`;

  let details = `🎲 Welcome to Social Shuffle Pune — India's Premier Board Game Meetup Community!\n\n` +
    `📍 Venue: ${event.venue} (${event.address})\n` +
    `⏰ Meetup Timing: ${event.time}\n` +
    `🍹 Ticket includes curated game tables, rule-explaining hosts & welcome drink.\n\n`;

  if (registration) {
    details += `🎟️ YOUR BOOKING DETAILS:\n` +
      `• Attendee: ${registration.participantName}\n` +
      `• Reserved Seats: ${registration.paxCount} Shuffler(s)\n` +
      `• Registration ID: ${registration.id}\n` +
      `• Check-in QR Token: ${registration.qrCodeToken || `SS-REG-${registration.id}`}\n` +
      `• Payment Status: ${registration.paymentStatus}\n\n`;
  }

  details += `💡 PRO TIPS:\n` +
    `1. Arrive 10-15 minutes early to grab your opening table.\n` +
    `2. Beginners are warmly welcome; our hosts explain all rules!\n` +
    `3. Flash your digital QR code at the door for instant check-in.\n` +
    `4. Need help? Ping host Aman / Parimal on WhatsApp!`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: details,
    location: location,
    ctz: 'Asia/Kolkata'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens Google Calendar directly in a new window/tab.
 */
export function openGoogleCalendar(event: ShuffleEvent, registration?: Registration): void {
  const url = getGoogleCalendarUrl(event, registration);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Generates and triggers download of an iCalendar (.ics) file with built-in reminder alarm.
 */
export function downloadIcsFile(event: ShuffleEvent, registration?: Registration): void {
  const { start, end } = parseEventDateRange(event.date, event.time);
  const now = new Date();

  const title = `Social Shuffle #${event.number}: ${event.title}`;
  const location = `${event.venue}, ${event.address}, Pune`;
  const qrToken = registration?.qrCodeToken || (registration ? `SS-REG-${registration.id}` : `SS-EVT-${event.id}`);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Social Shuffle Pune//Community Meetups//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:social-shuffle-${event.id}-${registration?.id || 'event'}@pune.socialshuffle`,
    `DTSTAMP:${toUtcString(now)}`,
    `DTSTART:${toUtcString(start)}`,
    `DTEND:${toUtcString(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Social Shuffle Board Game Meetup at ${event.venue}. Reserved for ${registration ? registration.participantName : 'Guest'}. Door Check-in Token: ${qrToken}. Arrive 10 minutes early.`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    // Built-in alarm 2 hours before event
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Social Shuffle Meetup starts in 2 hours at ${event.venue}!`,
    'END:VALARM',
    // Built-in alarm 1 day before event
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Tomorrow: Social Shuffle #${event.number} Board Game Meetup at ${event.venue}!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Social-Shuffle-${event.number}-Reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
