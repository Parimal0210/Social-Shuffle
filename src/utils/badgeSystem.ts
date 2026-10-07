import { Participant, Game, Registration } from '../types';

export type BadgeCategory = 'events' | 'games_count' | 'variety' | 'community';
export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface ParticipantBadge {
  id: string;
  title: string;
  description: string;
  criteriaText: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  badgeTagColor: string;
  unlocked: boolean;
  progress: {
    current: number;
    target: number;
    percentage: number;
    unit: string;
  };
  contributingItems?: string[];
  hint: string;
}

export interface ShufflerTier {
  name: string;
  icon: string;
  color: string;
  description: string;
  minBadges: number;
  nextTier?: {
    name: string;
    badgesNeeded: number;
  };
}

export function calculateParticipantBadges(
  participant: Participant,
  games: Game[],
  registrations: Registration[]
): {
  badges: ParticipantBadge[];
  unlockedCount: number;
  totalCount: number;
  shufflerTier: ShufflerTier;
  nextBadgeToUnlock?: ParticipantBadge;
} {
  const gamesPlayedIds = new Set(participant.gamesPlayedIds || []);
  const playedGames = games.filter(g => gamesPlayedIds.has(g.id));

  // Count by category
  const categoryCounts: Record<string, { count: number; names: string[] }> = {};
  playedGames.forEach(g => {
    const cat = g.category || 'Other';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, names: [] };
    }
    categoryCounts[cat].count += 1;
    categoryCounts[cat].names.push(g.name);
  });

  // Unique categories count
  const uniqueCategories = Object.keys(categoryCounts);

  // Events attended count
  const attendedRegistrations = registrations.filter(
    r =>
      r.participantId === participant.id &&
      (r.attendanceStatus === 'Checked In' || (r.gamesPlayed && r.gamesPlayed.length > 0))
  );
  const eventsAttendedCount = Math.max(
    participant.totalEventsAttended || 0,
    attendedRegistrations.length
  );

  const totalGamesPlayed = playedGames.length;
  const venuesCount = Math.max(1, participant.venuesVisited?.length || 1);
  const friendsCount = participant.totalPaxBrought || 0;

  // Category counts helpers
  const strategyGames = categoryCounts['Strategy'] || { count: 0, names: [] };
  const partyGames = categoryCounts['Party'] || { count: 0, names: [] };
  const bluffingGames = {
    count: (categoryCounts['Bluffing']?.count || 0) + (categoryCounts['Social Deduction']?.count || 0),
    names: [
      ...(categoryCounts['Bluffing']?.names || []),
      ...(categoryCounts['Social Deduction']?.names || [])
    ]
  };
  const familyGames = categoryCounts['Family'] || { count: 0, names: [] };

  const badges: ParticipantBadge[] = [
    // --- 1. GAME VARIETY BADGES ---
    {
      id: 'badge-strategy-master',
      title: 'Strategy Master',
      description: 'Master of deep turns, long-term planning, and resource engine building.',
      criteriaText: 'Play 3 or more Strategy games (e.g., Catan, Scythe, Dune, Wingspan)',
      category: 'variety',
      rarity: 'Epic',
      icon: '⚔️',
      gradient: 'from-amber-500/20 via-orange-500/10 to-purple-900/30',
      borderColor: 'border-amber-500/50',
      glowColor: 'shadow-amber-500/20',
      badgeTagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      unlocked: strategyGames.count >= 3,
      progress: {
        current: Math.min(3, strategyGames.count),
        target: 3,
        percentage: Math.min(100, Math.round((strategyGames.count / 3) * 100)),
        unit: 'Strategy games'
      },
      contributingItems: strategyGames.names,
      hint: 'Tag games like Catan, Wingspan, or Cascadia during your next meetup.'
    },
    {
      id: 'badge-bluff-ace',
      title: 'Bluff & Deduction Ace',
      description: 'Reads table tells with razor sharpness and thrives in high-stakes deception.',
      criteriaText: 'Play 2 or more Social Deduction or Bluffing games (e.g., Avalon, Coup, Secret Hitler)',
      category: 'variety',
      rarity: 'Rare',
      icon: '🎭',
      gradient: 'from-rose-500/20 via-purple-500/10 to-indigo-900/30',
      borderColor: 'border-rose-500/50',
      glowColor: 'shadow-rose-500/20',
      badgeTagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      unlocked: bluffingGames.count >= 2,
      progress: {
        current: Math.min(2, bluffingGames.count),
        target: 2,
        percentage: Math.min(100, Math.round((bluffingGames.count / 2) * 100)),
        unit: 'Deduction games'
      },
      contributingItems: bluffingGames.names,
      hint: 'Join a table of The Resistance: Avalon or Coup at your next session.'
    },
    {
      id: 'badge-party-dynamo',
      title: 'Party Dynamo',
      description: 'The heartbeat of hilarious table banter and rapid-fire party card games.',
      criteriaText: 'Play 3 or more Party board games (e.g., Just One, Wavelength, Flip 7, Codenames)',
      category: 'variety',
      rarity: 'Rare',
      icon: '🎉',
      gradient: 'from-cyan-500/20 via-sky-500/10 to-purple-900/30',
      borderColor: 'border-cyan-500/50',
      glowColor: 'shadow-cyan-500/20',
      badgeTagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      unlocked: partyGames.count >= 3,
      progress: {
        current: Math.min(3, partyGames.count),
        target: 3,
        percentage: Math.min(100, Math.round((partyGames.count / 3) * 100)),
        unit: 'Party games'
      },
      contributingItems: partyGames.names,
      hint: 'Tag games like Just One, Flip 7, or Wavelength from your meetups.'
    },
    {
      id: 'badge-omnivore-gamer',
      title: 'Omnivore Gamer',
      description: 'A truly versatile player who enjoys everything from light party laughs to heavy euro-strategy.',
      criteriaText: 'Play games across 4 or more different tabletop categories',
      category: 'variety',
      rarity: 'Epic',
      icon: '🌈',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-indigo-900/30',
      borderColor: 'border-emerald-500/50',
      glowColor: 'shadow-emerald-500/20',
      badgeTagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      unlocked: uniqueCategories.length >= 4,
      progress: {
        current: Math.min(4, uniqueCategories.length),
        target: 4,
        percentage: Math.min(100, Math.round((uniqueCategories.length / 4) * 100)),
        unit: 'Distinct categories'
      },
      contributingItems: uniqueCategories,
      hint: 'Explore an unfamiliar category like Family, Card Games, or Social Deduction.'
    },
    {
      id: 'badge-family-gateway',
      title: 'Gateway Explorer',
      description: 'Appreciates elegant, accessible modern classics that introduce newcomers to board games.',
      criteriaText: 'Play 2 or more Family or Gateway games (e.g., Azul, Carcassonne, Splendor)',
      category: 'variety',
      rarity: 'Common',
      icon: '🏰',
      gradient: 'from-yellow-500/20 via-amber-500/10 to-slate-900/40',
      borderColor: 'border-yellow-500/40',
      glowColor: 'shadow-yellow-500/20',
      badgeTagColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      unlocked: familyGames.count >= 2,
      progress: {
        current: Math.min(2, familyGames.count),
        target: 2,
        percentage: Math.min(100, Math.round((familyGames.count / 2) * 100)),
        unit: 'Gateway games'
      },
      contributingItems: familyGames.names,
      hint: 'Play Carcassonne, Azul, or Splendor with friends.'
    },

    // --- 2. GAME COUNT BADGES ---
    {
      id: 'badge-first-move',
      title: 'Table Rookie',
      description: 'Rolled the dice, took the first turn, and stepped into Pune tabletop culture.',
      criteriaText: 'Play your first tabletop game at a Social Shuffle meetup',
      category: 'games_count',
      rarity: 'Common',
      icon: '🎲',
      gradient: 'from-purple-500/20 via-indigo-500/10 to-slate-900/40',
      borderColor: 'border-purple-500/40',
      glowColor: 'shadow-purple-500/20',
      badgeTagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      unlocked: totalGamesPlayed >= 1,
      progress: {
        current: Math.min(1, totalGamesPlayed),
        target: 1,
        percentage: Math.min(100, Math.round((totalGamesPlayed / 1) * 100)),
        unit: 'Game played'
      },
      contributingItems: playedGames.slice(0, 3).map(g => g.name),
      hint: 'Tag any game you played in an attended meetup to unlock this badge.'
    },
    {
      id: 'badge-tabletop-explorer',
      title: 'Tabletop Explorer',
      description: 'Tested your skills across a diverse catalog of 5 distinct tabletop titles.',
      criteriaText: 'Play 5 or more unique board games across meetups',
      category: 'games_count',
      rarity: 'Rare',
      icon: '🧭',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-slate-900/40',
      borderColor: 'border-blue-500/50',
      glowColor: 'shadow-blue-500/20',
      badgeTagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      unlocked: totalGamesPlayed >= 5,
      progress: {
        current: Math.min(5, totalGamesPlayed),
        target: 5,
        percentage: Math.min(100, Math.round((totalGamesPlayed / 5) * 100)),
        unit: 'Unique games'
      },
      contributingItems: playedGames.slice(0, 5).map(g => g.name),
      hint: `You need ${Math.max(0, 5 - totalGamesPlayed)} more unique game(s) to unlock.`
    },
    {
      id: 'badge-boardgame-veteran',
      title: 'Board Game Veteran',
      description: 'A battle-tested shuffler with double-digit unique games mastered across Pune meetups.',
      criteriaText: 'Play 10 or more unique board games across meetups',
      category: 'games_count',
      rarity: 'Epic',
      icon: '🎖️',
      gradient: 'from-amber-500/25 via-yellow-500/15 to-purple-950/40',
      borderColor: 'border-amber-400/60',
      glowColor: 'shadow-amber-400/25',
      badgeTagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      unlocked: totalGamesPlayed >= 10,
      progress: {
        current: Math.min(10, totalGamesPlayed),
        target: 10,
        percentage: Math.min(100, Math.round((totalGamesPlayed / 10) * 100)),
        unit: 'Unique games'
      },
      contributingItems: playedGames.slice(0, 10).map(g => g.name),
      hint: `Play and tag ${Math.max(0, 10 - totalGamesPlayed)} more games to earn Veteran status.`
    },
    {
      id: 'badge-boardgame-legend',
      title: 'Board Game Legend',
      description: 'An elite Pune tabletop connoisseur who has conquered 20+ distinct board games.',
      criteriaText: 'Play 20 or more unique board games across meetups',
      category: 'games_count',
      rarity: 'Legendary',
      icon: '👑',
      gradient: 'from-amber-400/30 via-rose-500/20 to-purple-900/50',
      borderColor: 'border-amber-300/80',
      glowColor: 'shadow-amber-300/40',
      badgeTagColor: 'bg-gradient-to-r from-amber-400/30 to-rose-400/30 text-amber-200 border-amber-300/50',
      unlocked: totalGamesPlayed >= 20,
      progress: {
        current: Math.min(20, totalGamesPlayed),
        target: 20,
        percentage: Math.min(100, Math.round((totalGamesPlayed / 20) * 100)),
        unit: 'Unique games'
      },
      contributingItems: playedGames.slice(0, 20).map(g => g.name),
      hint: `Master ${Math.max(0, 20 - totalGamesPlayed)} more games to reach Legend tier.`
    },

    // --- 3. EVENT ATTENDANCE BADGES ---
    {
      id: 'badge-first-shuffle',
      title: 'First Shuffle',
      description: 'Took the leap, attended your first community gathering, and broke the ice.',
      criteriaText: 'Attend your first Social Shuffle meetup',
      category: 'events',
      rarity: 'Common',
      icon: '🎟️',
      gradient: 'from-emerald-500/20 via-green-500/10 to-slate-900/40',
      borderColor: 'border-emerald-500/40',
      glowColor: 'shadow-emerald-500/20',
      badgeTagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      unlocked: eventsAttendedCount >= 1,
      progress: {
        current: Math.min(1, eventsAttendedCount),
        target: 1,
        percentage: Math.min(100, Math.round((eventsAttendedCount / 1) * 100)),
        unit: 'Meetup attended'
      },
      hint: 'Check in at any upcoming Social Shuffle Sunday meetup to unlock.'
    },
    {
      id: 'badge-social-regular',
      title: 'Social Regular',
      description: 'Known by name by hosts and regulars, a cherished staple at Sunday meetups.',
      criteriaText: 'Attend 3 or more Social Shuffle meetups',
      category: 'events',
      rarity: 'Rare',
      icon: '⭐',
      gradient: 'from-purple-500/20 via-pink-500/10 to-slate-900/40',
      borderColor: 'border-purple-500/50',
      glowColor: 'shadow-purple-500/20',
      badgeTagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      unlocked: eventsAttendedCount >= 3,
      progress: {
        current: Math.min(3, eventsAttendedCount),
        target: 3,
        percentage: Math.min(100, Math.round((eventsAttendedCount / 3) * 100)),
        unit: 'Meetups attended'
      },
      hint: `Attend ${Math.max(0, 3 - eventsAttendedCount)} more meetup(s) to become a Regular.`
    },
    {
      id: 'badge-pune-tabletop-veteran',
      title: 'Pune Tabletop Veteran',
      description: 'A high-commitment tabletop regular with 5+ meetups under their belt.',
      criteriaText: 'Attend 5 or more Social Shuffle meetups in Pune',
      category: 'events',
      rarity: 'Epic',
      icon: '🌟',
      gradient: 'from-indigo-500/25 via-purple-500/15 to-slate-900/40',
      borderColor: 'border-indigo-400/60',
      glowColor: 'shadow-indigo-400/25',
      badgeTagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
      unlocked: eventsAttendedCount >= 5,
      progress: {
        current: Math.min(5, eventsAttendedCount),
        target: 5,
        percentage: Math.min(100, Math.round((eventsAttendedCount / 5) * 100)),
        unit: 'Meetups attended'
      },
      hint: `Attend ${Math.max(0, 5 - eventsAttendedCount)} more meetup(s) for the 5-event milestone.`
    },
    {
      id: 'badge-community-pillar',
      title: 'Community Pillar',
      description: 'A community cornerstone who embodies the warmth, spirit, and excitement of Social Shuffle.',
      criteriaText: 'Attend 10 or more Social Shuffle meetups',
      category: 'events',
      rarity: 'Legendary',
      icon: '🏛️',
      gradient: 'from-amber-400/25 via-emerald-500/15 to-purple-950/40',
      borderColor: 'border-amber-400/70',
      glowColor: 'shadow-amber-400/30',
      badgeTagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      unlocked: eventsAttendedCount >= 10,
      progress: {
        current: Math.min(10, eventsAttendedCount),
        target: 10,
        percentage: Math.min(100, Math.round((eventsAttendedCount / 10) * 100)),
        unit: 'Meetups attended'
      },
      hint: `Keep shuffling! ${Math.max(0, 10 - eventsAttendedCount)} meetups to reach Pillar tier.`
    },

    // --- 4. COMMUNITY & EXPLORATION BADGES ---
    {
      id: 'badge-cafe-hopper',
      title: 'Cafe Hopper',
      description: 'Shuffled meeples across multiple Pune cafes and hangout spots.',
      criteriaText: 'Attend meetups at 2 or more different cafe venues in Pune',
      category: 'community',
      rarity: 'Rare',
      icon: '☕',
      gradient: 'from-rose-500/20 via-amber-500/10 to-slate-900/40',
      borderColor: 'border-rose-500/40',
      glowColor: 'shadow-rose-500/20',
      badgeTagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      unlocked: venuesCount >= 2,
      progress: {
        current: Math.min(2, venuesCount),
        target: 2,
        percentage: Math.min(100, Math.round((venuesCount / 2) * 100)),
        unit: 'Distinct venues'
      },
      contributingItems: participant.venuesVisited || ['Pagdandi Books Chai Cafe'],
      hint: 'Attend an event in Baner or Koregaon Park to explore another cafe venue.'
    },
    {
      id: 'badge-the-connector',
      title: 'The Connector',
      description: 'Brought friends or teammates into the fold, multiplying the joy at the table.',
      criteriaText: 'Bring 2 or more friends / guests (+1s) to Social Shuffle meetups',
      category: 'community',
      rarity: 'Rare',
      icon: '🤝',
      gradient: 'from-teal-500/20 via-cyan-500/10 to-slate-900/40',
      borderColor: 'border-teal-500/40',
      glowColor: 'shadow-teal-500/20',
      badgeTagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      unlocked: friendsCount >= 2,
      progress: {
        current: Math.min(2, friendsCount),
        target: 2,
        percentage: Math.min(100, Math.round((friendsCount / 2) * 100)),
        unit: 'Guests brought'
      },
      hint: 'Bring a friend or partner to your next registration booking.'
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;

  // Calculate Shuffler Tier based on badges
  let shufflerTier: ShufflerTier;
  if (unlockedCount >= 10) {
    shufflerTier = {
      name: 'Diamond Grandmaster',
      icon: '💎',
      color: 'from-cyan-400 via-sky-300 to-indigo-400',
      description: 'The pinnacle of Pune tabletop mastery and community devotion.',
      minBadges: 10
    };
  } else if (unlockedCount >= 7) {
    shufflerTier = {
      name: 'Gold Strategist',
      icon: '🏆',
      color: 'from-amber-400 via-yellow-300 to-orange-400',
      description: 'A distinguished tabletop connoisseur recognized across meetups.',
      minBadges: 7,
      nextTier: { name: 'Diamond Grandmaster', badgesNeeded: 10 - unlockedCount }
    };
  } else if (unlockedCount >= 4) {
    shufflerTier = {
      name: 'Silver Shuffler',
      icon: '🥈',
      color: 'from-slate-200 via-indigo-200 to-purple-300',
      description: 'An experienced player with diverse tabletop exploration.',
      minBadges: 4,
      nextTier: { name: 'Gold Strategist', badgesNeeded: 7 - unlockedCount }
    };
  } else if (unlockedCount >= 1) {
    shufflerTier = {
      name: 'Bronze Explorer',
      icon: '🥉',
      color: 'from-amber-600 via-orange-400 to-amber-700',
      description: 'Stepping into Pune tabletop culture and earning early badges.',
      minBadges: 1,
      nextTier: { name: 'Silver Shuffler', badgesNeeded: 4 - unlockedCount }
    };
  } else {
    shufflerTier = {
      name: 'Rising Shuffler',
      icon: '🌱',
      color: 'from-purple-400 to-indigo-400',
      description: 'Just getting started on the Social Shuffle journey.',
      minBadges: 0,
      nextTier: { name: 'Bronze Explorer', badgesNeeded: 1 }
    };
  }

  // Find next badge closest to unlocking
  const lockedBadges = badges.filter(b => !b.unlocked);
  lockedBadges.sort((a, b) => b.progress.percentage - a.progress.percentage);
  const nextBadgeToUnlock = lockedBadges.length > 0 ? lockedBadges[0] : undefined;

  return {
    badges,
    unlockedCount,
    totalCount,
    shufflerTier,
    nextBadgeToUnlock
  };
}
