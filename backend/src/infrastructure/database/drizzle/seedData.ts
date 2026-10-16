import { Team, Player, Match, MatchEvent, MatchLineupItem, Official, User } from '../../../domain/entities/index.js';
import bcrypt from 'bcryptjs';

export const initialTournament = {
  id: 'kpl-season-3',
  name: 'Kosnapur Premier League Season 3',
  nameBn: 'কচনাপুর প্রিমিয়ার লিগ সিজন ৩',
  season: '2026',
  logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&auto=format&fit=crop&q=80',
  status: 'ongoing' as const,
  format: '8 Teams Knockout & Group Stages',
  teamsCount: 8,
  squadSize: 8,
  levelsLocked: false,
  squadsLocked: false,
};

export const initialTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Kosnapur Thunderbolts',
    nameBn: 'কচনাপুর থান্ডারবোল্টস',
    shortName: 'KNT',
    logoUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#059669', // Emerald
    secondaryColor: '#34d399',
    groupName: 'Group A',
    city: 'Kosnapur Central',
    cityBn: 'কচনাপুর সদর',
    coach: 'Rafiqul Islam',
    coachBn: 'রফিকুল ইসলাম',
    stadium: 'Kosnapur High Ground',
    stadiumBn: 'কচনাপুর হাই গ্রাউন্ড',
    captainId: 'ply-1',
    captainPin: '1111',
  },
  {
    id: 'team-2',
    name: 'Padma Warriors',
    nameBn: 'পদ্মা ওয়ারিয়র্স',
    shortName: 'PDW',
    logoUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#0284c7', // Sky Blue
    secondaryColor: '#38bdf8',
    groupName: 'Group A',
    city: 'Padma Riverbank',
    cityBn: 'পদ্মা পাড়',
    coach: 'Shahidul Alam',
    coachBn: 'শহিদুল আলম',
    stadium: 'River Arena',
    stadiumBn: 'রিভার অ্যারেনা',
    captainId: 'ply-9',
    captainPin: '2222',
  },
  {
    id: 'team-3',
    name: 'Meghna Titans',
    nameBn: 'মেঘনা টাইটানস',
    shortName: 'MGT',
    logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#dc2626', // Crimson Red
    secondaryColor: '#f87171',
    groupName: 'Group A',
    city: 'East Meghna',
    cityBn: 'পূর্ব মেঘনা',
    coach: 'Mahbub Hassan',
    coachBn: 'মাহবুব হাসান',
    stadium: 'Titans Fortress',
    stadiumBn: 'টাইটানস ফোর্ট্রেস',
    captainId: 'ply-17',
    captainPin: '3333',
  },
  {
    id: 'team-4',
    name: 'Jamuna Strikers',
    nameBn: 'যমুনা স্ট্রাইকার্স',
    shortName: 'JMS',
    logoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#d97706', // Amber Gold
    secondaryColor: '#fbbf24',
    groupName: 'Group A',
    city: 'Jamuna North',
    cityBn: 'যমুনা উত্তর',
    coach: 'Aminul Haque',
    coachBn: 'আমিনুল হক',
    stadium: 'Golden Park',
    stadiumBn: 'গোল্ডেন পার্ক',
    captainId: 'ply-25',
    captainPin: '4444',
  },
  {
    id: 'team-5',
    name: 'Bengal Tigers SC',
    nameBn: 'বেঙ্গল টাইগার্স',
    shortName: 'BTS',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#7c3aed', // Purple
    secondaryColor: '#a78bfa',
    groupName: 'Group B',
    city: 'Kosnapur South',
    cityBn: 'কচনাপুর দক্ষিণ',
    coach: 'Kamal Hossain',
    coachBn: 'কামাল হোসেন',
    stadium: 'Tiger Den Arena',
    stadiumBn: 'টাইগার ডেন',
    captainId: 'ply-33',
    captainPin: '5555',
  },
  {
    id: 'team-6',
    name: 'Surma Kings',
    nameBn: 'সুরমা কিংস',
    shortName: 'SMK',
    logoUrl: 'https://images.unsplash.com/photo-1489944445339-3630dd53ac26?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#0891b2', // Cyan
    secondaryColor: '#22d3ee',
    groupName: 'Group B',
    city: 'Surma Valley',
    cityBn: 'সুরমা ভ্যালি',
    coach: 'Faruk Ahmed',
    coachBn: 'ফারুক আহমেদ',
    stadium: 'Kings Valley',
    stadiumBn: 'কিংস ভ্যালি',
    captainId: 'ply-41',
    captainPin: '6666',
  },
  {
    id: 'team-7',
    name: 'Rupali Royals',
    nameBn: 'রূপালী রয়্যালস',
    shortName: 'RPR',
    logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#4f46e5', // Indigo
    secondaryColor: '#818cf8',
    groupName: 'Group B',
    city: 'Rupali Bazaar',
    cityBn: 'রূপালী বাজার',
    coach: 'Monirul Islam',
    coachBn: 'মনিরুল ইসলাম',
    stadium: 'Royals Field',
    stadiumBn: 'রয়্যালস মাঠ',
    captainId: 'ply-49',
    captainPin: '7777',
  },
  {
    id: 'team-8',
    name: 'Green Field Knights',
    nameBn: 'গ্রিন ফিল্ড নাইটস',
    shortName: 'GFK',
    logoUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=128&auto=format&fit=crop&q=80',
    primaryColor: '#15803d', // Forest Green
    secondaryColor: '#4ade80',
    groupName: 'Group B',
    city: 'Green Valley',
    cityBn: 'গ্রিন ভ্যালি',
    coach: 'Jalal Uddin',
    coachBn: 'জালাল উদ্দিন',
    stadium: 'Knights Turf',
    stadiumBn: 'নাইটস টার্ফ',
    captainId: 'ply-57',
    captainPin: '8888',
  },
];

// Helper to generate 64 realistic demo players (8 per team, with levels A, B, C, EXTRA)
const playerNames = [
  { en: 'Tanvir Ahmed', bn: 'তানভীর আহমেদ', pos: 'FWD' as const },
  { en: 'Sakib Hasan', bn: 'সাকিব হাসান', pos: 'MID' as const },
  { en: 'Mehedi Miraz', bn: 'মেহেদী মিরাজ', pos: 'MID' as const },
  { en: 'Mustafizur Rahman', bn: 'মুস্তাফিজুর রহমান', pos: 'DEF' as const },
  { en: 'Taskin Ahmed', bn: 'তাসকিন আহমেদ', pos: 'DEF' as const },
  { en: 'Litton Das', bn: 'লিটন দাস', pos: 'FWD' as const },
  { en: 'Shoriful Islam', bn: 'শরিফুল ইসলাম', pos: 'DEF' as const },
  { en: 'Anamul Haque Bijoy', bn: 'এনামুল হক বিজয়', pos: 'GK' as const },
  { en: 'Mahmudullah Riyad', bn: 'মাহমুদউল্লাহ রিয়াদ', pos: 'MID' as const },
  { en: 'Mushfiqur Rahim', bn: 'মুশফিকুর রহিম', pos: 'FWD' as const },
  { en: 'Tamim Iqbal', bn: 'তামিম ইকবাল', pos: 'FWD' as const },
  { en: 'Mashrafe Mortaza', bn: 'মাশরাফি মর্তুজা', pos: 'DEF' as const },
  { en: 'Nasum Ahmed', bn: 'নাসুম আহমেদ', pos: 'MID' as const },
  { en: 'Afif Hossain', bn: 'আফিফ হোসেন', pos: 'MID' as const },
  { en: 'Towhid Hridoy', bn: 'তাওহীদ হৃদয়', pos: 'FWD' as const },
  { en: 'Ebadot Hossain', bn: 'এবাদত হোসেন', pos: 'GK' as const },
];

export function generateInitialPlayers(): Player[] {
  const playersList: Player[] = [];
  let idCounter = 1;

  for (let teamIdx = 0; teamIdx < initialTeams.length; teamIdx++) {
    const team = initialTeams[teamIdx];
    const teamId = team.id;

    for (let pIdx = 0; pIdx < 8; pIdx++) {
      const pid = `ply-${idCounter}`;
      const nameTemplate = playerNames[(idCounter - 1) % playerNames.length];
      const isCaptain = pIdx === 0;
      const level = isCaptain ? 'A' : pIdx < 3 ? 'A' : pIdx < 5 ? 'B' : pIdx < 7 ? 'C' : 'EXTRA';

      playersList.push({
        id: pid,
        teamId: isCaptain ? teamId : undefined,
        name: isCaptain ? `${nameTemplate.en} (C)` : nameTemplate.en,
        nameBn: isCaptain ? `${nameTemplate.bn} (অধিনায়ক)` : nameTemplate.bn,
        phone: `+8801700${String(100000 + idCounter).slice(1)}`,
        jerseyNumber: isCaptain ? 10 : (pIdx + 1) * 2,
        position: nameTemplate.pos,
        photoUrl: `https://images.unsplash.com/photo-${1534528741775 + (idCounter % 50)}?w=200&auto=format&fit=crop&q=80`,
        isCaptain,
        nationality: 'Bangladesh',
        nationalityBn: 'বাংলাদেশ',
        level: level as any,
        extraCategoryTag: level === 'EXTRA' ? 'Guest' : null,
        squadRole: 'MAIN',
        goalsCount: pIdx === 0 ? Math.floor(idCounter % 5) + 1 : Math.floor((idCounter * 3) % 4),
        assistsCount: Math.floor((idCounter * 2) % 3),
        yellowCards: Math.floor(idCounter % 2),
        redCards: 0,
        appearances: 3,
        isRegistered: true,
      });

      idCounter++;
    }
  }

  return playersList;
}

export const initialPlayers = generateInitialPlayers();

export const initialOfficials: Official[] = [
  {
    id: 'off-1',
    name: 'Al-Haj Abdul Jalil',
    nameBn: 'আলহাজ্ব আব্দুল জলিল',
    titleEn: 'League President',
    titleBn: 'লিগ সভাপতি',
    descriptionBn: 'কচনাপুর ক্রীড়া ফেডারেশনের সম্মানিত সভাপতি ও পৃষ্ঠপোষক। টুর্নামেন্টের সার্বিক পরিকল্পনা ও নির্দেশনায় নিবেদিত।',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    displayOrder: 1,
  },
  {
    id: 'off-2',
    name: 'Engr. Kamal Uddin',
    nameBn: 'ইঞ্জিঃ কামাল উদ্দিন',
    titleEn: 'Tournament President',
    titleBn: 'টুর্নামেন্ট সভাপতি',
    descriptionBn: 'কেপিএল সিজন ৩ পরিচালনা কমিটির প্রধান। সুষ্ঠু ম্যাচ আয়োজন ও মাঠের শৃঙ্খলা নিশ্চিতকরণে নিয়োজিত।',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    displayOrder: 2,
  },
  {
    id: 'off-3',
    name: 'Mahbubur Rahman',
    nameBn: 'মাহবুবুর রহমান',
    titleEn: 'General Secretary',
    titleBn: 'সাধারণ সম্পাদক',
    descriptionBn: 'দলসমূহের সমন্বয়, লটারি ড্র অনুষ্ঠান ও অফিশিয়াল যোগাযোগ ব্যবস্থাপনার সার্বিক দায়িত্বে অধিষ্ঠিত।',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    displayOrder: 3,
  },
  {
    id: 'off-4',
    name: 'Zahangir Alam',
    nameBn: 'জাহাঙ্গীর আলম',
    titleEn: 'Chief Referee & Technical Director',
    titleBn: 'প্রধান রেফারি ও টেকনিক্যাল ডিরেক্টর',
    descriptionBn: 'ফিফা সার্টিফাইড রেফারি ও ম্যাচ কন্ট্রোল রুমের প্রধান পর্যবেক্ষক।',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    displayOrder: 4,
  },
];

export const initialMatches: Match[] = [
  {
    id: 'match-live-1',
    tournamentId: 'kpl-season-3',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    homeScore: 2,
    awayScore: 1,
    status: 'live_second_half',
    currentMinute: 68,
    minuteOffsetSeconds: 15,
    isClockRunning: true,
    matchDate: new Date().toISOString(),
    venue: 'Kosnapur High Ground',
    venueBn: 'কচনাপুর হাই গ্রাউন্ড',
    round: 'Group Stage - Matchday 3',
    roundBn: 'গ্রুপ পর্ব - ৩য় রাউন্ড',
    stage: 'group',
    bracketSlot: 1,
    homeTeam: initialTeams[0],
    awayTeam: initialTeams[1],
  },
  {
    id: 'match-up-1',
    tournamentId: 'kpl-season-3',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    homeScore: 0,
    awayScore: 0,
    status: 'upcoming',
    currentMinute: 0,
    minuteOffsetSeconds: 0,
    isClockRunning: false,
    matchDate: new Date(Date.now() + 3600000 * 4).toISOString(),
    venue: 'Titans Fortress Arena',
    venueBn: 'টাইটানস ফোর্ট্রেস মাঠ',
    round: 'Group Stage - Matchday 3',
    roundBn: 'গ্রুপ পর্ব - ৩য় রাউন্ড',
    stage: 'group',
    bracketSlot: 2,
    homeTeam: initialTeams[2],
    awayTeam: initialTeams[3],
  },
  {
    id: 'match-ft-1',
    tournamentId: 'kpl-season-3',
    homeTeamId: 'team-5',
    awayTeamId: 'team-6',
    homeScore: 3,
    awayScore: 1,
    status: 'full_time',
    currentMinute: 90,
    minuteOffsetSeconds: 0,
    isClockRunning: false,
    matchDate: new Date(Date.now() - 86400000).toISOString(),
    venue: 'Tiger Den Arena',
    venueBn: 'টাইগার ডেন এরিনা',
    round: 'Group Stage - Matchday 2',
    roundBn: 'গ্রুপ পর্ব - ২য় রাউন্ড',
    stage: 'group',
    bracketSlot: 3,
    homeTeam: initialTeams[4],
    awayTeam: initialTeams[5],
  },
];

export const initialEvents: MatchEvent[] = [
  {
    id: 'evt-1',
    matchId: 'match-live-1',
    teamId: 'team-1',
    playerId: 'ply-1',
    eventType: 'goal',
    minute: 24,
    description: 'Header from edge of the box',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    matchId: 'match-live-1',
    teamId: 'team-2',
    playerId: 'ply-9',
    eventType: 'goal',
    minute: 41,
    description: 'Curler into top corner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    matchId: 'match-live-1',
    teamId: 'team-1',
    playerId: 'ply-2',
    eventType: 'goal',
    minute: 57,
    description: 'Left footed strike through defense',
    createdAt: new Date().toISOString(),
  },
];

export function getInitialUsers(): User[] {
  const hash = bcrypt.hashSync('admin123', 10);
  return [
    {
      id: 'usr-admin',
      email: 'admin@kochnapur.live',
      passwordHash: hash,
      name: 'KPL Master Administrator',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-operator',
      email: 'operator@kochnapur.live',
      passwordHash: hash,
      name: 'KPL Match Control Operator',
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-capt-1',
      email: 'captain1@kochnapur.live',
      passwordHash: hash,
      name: 'Captain Rafiq',
      role: 'CAPTAIN',
      teamId: 'team-1',
      createdAt: new Date().toISOString(),
    },
  ];
}
