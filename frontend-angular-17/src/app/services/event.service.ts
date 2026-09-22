import { Injectable, signal, computed } from '@angular/core';
import { ShuffleEvent, Game, Participant, Registration } from '../models/types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Angular 17 Signals
  readonly events = signal<ShuffleEvent[]>([
    {
      id: 'evt-pune-42',
      title: 'Koregaon Park Weekend Board Game Social #42',
      meetupNumber: 42,
      date: '2026-09-26',
      startTime: '16:00',
      endTime: '20:00',
      venueName: 'The French Window Patisserie & Board Games',
      venueArea: 'Koregaon Park',
      venueAddress: 'Lane 5, Koregaon Park, Pune 411001',
      venueMapUrl: 'https://maps.google.com/?q=The+French+Window+Koregaon+Park+Pune',
      description: 'Join Pune board gamers for an epic Saturday evening featuring Catan, Ticket to Ride, Wingspan, and party games! Beginners welcome, hosts will teach all rules.',
      coverImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80',
      capacity: 35,
      pricePerPerson: 299,
      status: 'Upcoming',
      featuredGameIds: ['game-catan', 'game-codenames', 'game-splendor'],
      hostName: 'Aman Joshi',
      hostPhone: '+91 98220 11223'
    },
    {
      id: 'evt-pune-43',
      title: 'Baner Heavy Strategy & Euro Games Night #43',
      meetupNumber: 43,
      date: '2026-09-27',
      startTime: '17:00',
      endTime: '21:30',
      venueName: 'Pagdandi Books Chai & Cafe',
      venueArea: 'Baner',
      venueAddress: 'Shop 2, Regent Plaza, Baner Pashan Link Rd, Pune 411045',
      venueMapUrl: 'https://maps.google.com/?q=Pagdandi+Books+Chai+Baner+Pune',
      description: 'A focused session for deep strategy games: Terraforming Mars, Scythe, Dune Imperium, and Brass Birmingham. Dedicated game teachers at every table.',
      coverImage: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=1200&q=80',
      capacity: 28,
      pricePerPerson: 349,
      status: 'Upcoming',
      featuredGameIds: ['game-scythe', 'game-terraforming-mars', 'game-dune'],
      hostName: 'Aman Joshi',
      hostPhone: '+91 98220 11223'
    },
    {
      id: 'evt-pune-44',
      title: 'Viman Nagar Casual & Party Games Mixer #44',
      meetupNumber: 44,
      date: '2026-10-03',
      startTime: '16:30',
      endTime: '20:30',
      venueName: 'Where Else Cafe & Bar',
      venueArea: 'Viman Nagar',
      venueAddress: 'Clover Park, Viman Nagar, Pune 411014',
      description: 'Icebreakers, social deduction (Secret Hitler, Avalon, Blood on the Clocktower) and laughter-filled party games like Just One and Dixit.',
      coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      capacity: 40,
      pricePerPerson: 299,
      status: 'Upcoming',
      featuredGameIds: ['game-secret-hitler', 'game-dixit', 'game-just-one'],
      hostName: 'Aman Joshi',
      hostPhone: '+91 98220 11223'
    }
  ]);

  readonly games = signal<Game[]>([
    {
      id: 'game-catan',
      title: 'Catan (Settlers of Catan)',
      category: 'Strategy / Trading',
      minPlayers: 3,
      maxPlayers: 4,
      playTimeMinutes: 75,
      complexity: 'Medium',
      bggRating: 7.2,
      description: 'Trade resources, build roads, settlements and cities on the island of Catan.',
      imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      timesPlayed: 88
    },
    {
      id: 'game-codenames',
      title: 'Codenames',
      category: 'Party / Word Association',
      minPlayers: 4,
      maxPlayers: 10,
      playTimeMinutes: 20,
      complexity: 'Party',
      bggRating: 7.6,
      description: 'Spymasters give one-word clues to help their team contact secret agents.',
      imageUrl: 'https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      timesPlayed: 142
    },
    {
      id: 'game-splendor',
      title: 'Splendor',
      category: 'Engine Building',
      minPlayers: 2,
      maxPlayers: 4,
      playTimeMinutes: 35,
      complexity: 'Light',
      bggRating: 7.4,
      description: 'Renaissance merchants harvest gem mines, transport ships, and attract nobles.',
      imageUrl: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      timesPlayed: 96
    },
    {
      id: 'game-scythe',
      title: 'Scythe',
      category: '4X / Engine Building',
      minPlayers: 1,
      maxPlayers: 5,
      playTimeMinutes: 115,
      complexity: 'Heavy',
      bggRating: 8.2,
      description: 'Alternate-history 1920s dieselpunk mechs farming and conquering Europa.',
      imageUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      timesPlayed: 45
    }
  ]);

  readonly registrations = signal<Registration[]>([
    {
      id: 'reg-001',
      eventId: 'evt-pune-42',
      participantId: 'p-rahul',
      participantName: 'Rohan Kulkarni',
      participantEmail: 'rohan.kulkarni@example.com',
      participantPhone: '+91 98220 12345',
      paxCount: 2,
      guests: [{ name: 'Kavita Kulkarni' }],
      attendanceStatus: 'Registered',
      paymentStatus: 'Paid Online',
      gamesPlayedTonightIds: ['game-catan'],
      createdAt: '2026-09-20T10:30:00Z'
    },
    {
      id: 'reg-002',
      eventId: 'evt-pune-42',
      participantId: 'p-ananya',
      participantName: 'Ananya Deshmukh',
      participantEmail: 'ananya.d@example.com',
      participantPhone: '+91 97654 32100',
      paxCount: 1,
      guests: [],
      attendanceStatus: 'Checked-In',
      checkInTimestamp: '16:15 PM',
      paymentStatus: 'Paid Online',
      gamesPlayedTonightIds: ['game-splendor'],
      createdAt: '2026-09-21T14:10:00Z'
    }
  ]);

  constructor(private api: ApiService) {
    this.refreshFromBackend();
  }

  refreshFromBackend() {
    this.api.getEvents().subscribe((data: ShuffleEvent[]) => {
      if (data && data.length > 0) this.events.set(data);
    });
    this.api.getGames().subscribe((data: Game[]) => {
      if (data && data.length > 0) this.games.set(data);
    });
    this.api.getRegistrations().subscribe((data: Registration[]) => {
      if (data && data.length > 0) this.registrations.set(data);
    });
  }

  // Quick RSVP for current participant
  rsvpForEvent(eventId: string, participant: { id: string; name: string; email: string; phone: string }, pax: number) {
    const newReg: Registration = {
      id: `reg-${Date.now().toString(36)}`,
      eventId,
      participantId: participant.id,
      participantName: participant.name,
      participantEmail: participant.email,
      participantPhone: participant.phone,
      paxCount: pax,
      guests: [],
      attendanceStatus: 'Registered',
      paymentStatus: 'Pay at Venue',
      gamesPlayedTonightIds: [],
      createdAt: new Date().toISOString()
    };

    this.registrations.update((prev: Registration[]) => [newReg, ...prev]);
    this.api.createRegistration(newReg).subscribe();
    return newReg;
  }

  // Check-In toggle
  toggleCheckIn(regId: string) {
    this.registrations.update((prev: Registration[]) =>
      prev.map((r: Registration) => {
        if (r.id === regId) {
          const isChecked = r.attendanceStatus === 'Checked-In';
          return {
            ...r,
            attendanceStatus: isChecked ? 'Registered' : 'Checked-In',
            checkInTimestamp: isChecked ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return r;
      })
    );
    this.api.checkIn(regId).subscribe();
  }
}
