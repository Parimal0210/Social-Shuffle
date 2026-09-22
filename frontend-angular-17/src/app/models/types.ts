export type UserRole = 'admin' | 'participant';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  area: string;
  avatar?: string;
  bio?: string;
  participantId?: string;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password?: string;
  area: string;
  bio?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  participant?: Participant;
  message?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  avatar?: string;
  bio?: string;
  joinedDate: string;
  totalEventsAttended: number;
  totalRegistrations: number;
  gamesPlayedIds: string[];
  venuesVisited: string[];
  totalPaxBrought: number;
}

export interface ShuffleEvent {
  id: string;
  title: string;
  meetupNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueArea: string;
  venueAddress: string;
  venueMapUrl?: string;
  description: string;
  coverImage: string;
  capacity: number;
  pricePerPerson: number;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  featuredGameIds: string[];
  hostName: string;
  hostPhone: string;
  isArchived?: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  paxCount: number;
  guests: { name: string; phone?: string }[];
  attendanceStatus: 'Registered' | 'Checked-In' | 'No-Show' | 'Cancelled';
  checkInTimestamp?: string;
  paymentStatus: 'Paid Online' | 'Pay at Venue' | 'Complimentary' | 'Refunded';
  notes?: string;
  gamesPlayedTonightIds: string[];
  createdAt: string;
}

export interface Game {
  id: string;
  title: string;
  publisher?: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  playTimeMinutes: number;
  complexity: 'Party' | 'Light' | 'Medium' | 'Heavy';
  bggRating?: number;
  description: string;
  imageUrl: string;
  rulesVideoUrl?: string;
  isActive: boolean;
  timesPlayed: number;
}
