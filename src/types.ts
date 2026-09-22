/**
 * Social Shuffle — Community & Event Management Platform Types
 * Pune's Biggest Board Game Meetup Community
 */

export type UserRole = 'admin' | 'participant';

export type AdminRole = 'Super Admin' | 'Event Organizer' | 'Volunteer/Staff';

export type EventCategory =
  | 'Regular Meetup'
  | 'Tournament'
  | 'Theme Night'
  | 'Secret Event'
  | 'Collaborative Event'
  | string;

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string; // Pune locality e.g., 'Koregaon Park', 'Baner', 'Viman Nagar'
  avatar?: string;
  bio?: string;
  joinedDate: string;
  totalEventsAttended: number;
  totalRegistrations: number;
  gamesPlayedIds: string[];
  venuesVisited: string[];
  totalPaxBrought: number;
  lastAttendedEventId?: string;
  lastAttendedEventTitle?: string;
}

export type GameCategory =
  | 'Party'
  | 'Strategy'
  | 'Bluffing'
  | 'Social Deduction'
  | 'Card Games'
  | 'Family'
  | 'Team Games'
  | 'Long Format'
  | 'Tournament';

export type GameDifficulty = 'Beginner' | 'Medium' | 'Advanced';

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  players: string; // e.g., '3-8 Players'
  duration: string; // e.g., '30-45 mins'
  description: string;
  active: boolean;
  isActive?: boolean;
  playsCount: number;
  tags?: string[];
  rating?: number;
  image?: string;
}

export type BoardGame = Game;

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'archived';

export interface ShuffleEvent {
  id: string;
  number: number; // e.g. 35 for Social Shuffle #35
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "Sunday, 4:00 PM – 7:30 PM"
  venue: string;
  address: string;
  area: string;
  category: string;
  capacity: number;
  ticketPrice: number; // INR
  description: string;
  notes: string;
  plannedGames: string[]; // Game IDs
  status: EventStatus;
  coverImage?: string;
}

export type PaymentStatus = 'Confirmed' | 'Pending' | 'Waived';

export type AttendanceStatus = 'Checked In' | 'Pending' | 'Cancelled' | 'No Show';

export interface GuestInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  area?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantArea: string;
  paxCount: number;
  guests: GuestInfo[];
  paymentStatus: PaymentStatus;
  attendanceStatus: AttendanceStatus;
  checkInTime?: string;
  gamesPlayed: string[]; // Game IDs played during this event
  notes?: string;
  registeredAt: string;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  eventTitle: string;
  participantId?: string;
  participantName?: string;
  isAnonymous: boolean;
  overallRating: number; // 1-5
  venueRating: number;
  gameRating: number;
  hostRating: number;
  suggestions: string;
  createdAt: string;
  submittedAt?: string;
}

export type ReportCategory =
  | 'Event issue'
  | 'Venue issue'
  | 'Community concern'
  | 'Uncomfortable interaction'
  | 'Harassment'
  | 'Other';

export interface SafetyReport {
  id: string;
  eventId?: string;
  eventTitle?: string;
  type: ReportCategory;
  description: string;
  dateTime?: string;
  personInvolved?: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterContact?: string;
  status: 'New' | 'Investigating' | 'Resolved';
  resolutionNotes?: string;
  createdAt: string;
  submittedAt?: string;
}

export type VolunteerStatus = 'New' | 'Under Review' | 'Accepted' | 'Rejected' | 'On Hold';

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  reason: string;
  experience: string;
  skills: string;
  availability: string;
  preferredResponsibilities: string[];
  additionalInfo?: string;
  status: VolunteerStatus;
  submittedAt: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  description?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'registration' | 'community' | 'system';
  timestamp: string;
  read: boolean;
}
