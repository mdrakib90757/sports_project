import { describe, it, expect } from 'vitest';
import { DrawEngine, RngProvider } from '../../src/domain/services/DrawEngine.js';
import { Team, Player } from '../../src/domain/entities/index.js';

// Deterministic test RNG that always picks index 0 or cycles
class MockRng implements RngProvider {
  private counter = 0;
  constructor(private sequence?: number[]) {}

  randomInt(max: number): number {
    if (this.sequence && this.sequence.length > 0) {
      const val = this.sequence[this.counter % this.sequence.length];
      this.counter++;
      return val % max;
    }
    return 0;
  }
}

describe('DrawEngine Domain Logic', () => {
  const mockTeams: Team[] = [
    { id: 't1', name: 'Team 1', nameBn: 'দল ১', shortName: 'T1', logoUrl: '', primaryColor: '#000', secondaryColor: '#fff', groupName: 'Group A', city: '', cityBn: '', coach: '', stadium: '', captainId: 'c1' },
    { id: 't2', name: 'Team 2', nameBn: 'দল ২', shortName: 'T2', logoUrl: '', primaryColor: '#000', secondaryColor: '#fff', groupName: 'Group A', city: '', cityBn: '', coach: '', stadium: '', captainId: 'c2' },
    { id: 't3', name: 'Team 3', nameBn: 'দল ৩', shortName: 'T3', logoUrl: '', primaryColor: '#000', secondaryColor: '#fff', groupName: 'Group B', city: '', cityBn: '', coach: '', stadium: '', captainId: 'c3' },
    { id: 't4', name: 'Team 4', nameBn: 'দল ৪', shortName: 'T4', logoUrl: '', primaryColor: '#000', secondaryColor: '#fff', groupName: 'Group B', city: '', cityBn: '', coach: '', stadium: '', captainId: 'c4' },
  ];

  it('determines current level in strict order (A -> B -> C -> EXTRA)', () => {
    const players: Player[] = [
      { id: 'p1', name: 'P1', nameBn: 'প১', position: 'FWD', photoUrl: '', nationality: 'BD', level: 'A', goalsCount: 0, assistsCount: 0, yellowCards: 0, redCards: 0 },
      { id: 'p2', name: 'P2', nameBn: 'প২', position: 'MID', photoUrl: '', nationality: 'BD', level: 'B', goalsCount: 0, assistsCount: 0, yellowCards: 0, redCards: 0 },
    ];

    expect(DrawEngine.getCurrentLevel(players)).toBe('A');

    // When all A are assigned
    players[0].teamId = 't1';
    expect(DrawEngine.getCurrentLevel(players)).toBe('B');

    // When all B are assigned
    players[1].teamId = 't2';
    expect(DrawEngine.getCurrentLevel(players)).toBe(null);
  });

  it('balances turns when remaining players are fewer than total teams T', () => {
    const rng = new MockRng();
    const squadCounts = new Map<string, number>([
      ['t1', 3],
      ['t2', 2], // Lowest
      ['t3', 2], // Lowest
      ['t4', 3],
    ]);

    // 2 players remain, so only 2 teams get a turn
    const turnQueue = DrawEngine.getTurnQueueForRound(mockTeams, 2, squadCounts, rng);

    expect(turnQueue.length).toBe(2);
    // Must be drawn from the teams with the lowest squad size (t2 and t3)
    const turnIds = turnQueue.map((t) => t.id);
    expect(turnIds).toContain('t2');
    expect(turnIds).toContain('t3');
  });

  it('executes a single pick deterministically and associates player with team', () => {
    const rng = new MockRng();
    const pool: Player[] = [
      { id: 'p10', name: 'Star Player', nameBn: 'স্টার', position: 'FWD', photoUrl: '', nationality: 'BD', level: 'A', goalsCount: 0, assistsCount: 0, yellowCards: 0, redCards: 0 },
    ];

    const result = DrawEngine.executePick(
      mockTeams[0],
      'A',
      pool,
      1,
      0,
      'test-session',
      rng
    );

    expect(result.pick.playerId).toBe('p10');
    expect(result.pick.teamId).toBe(mockTeams[0].id);
    expect(result.pick.level).toBe('A');
    expect(result.updatedPlayer.teamId).toBe(mockTeams[0].id);
  });

  it('supports odd team count (e.g. 5 teams) and odd pool sizes seamlessly', () => {
    const fiveTeams: Team[] = Array.from({ length: 5 }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      nameBn: `দল ${i + 1}`,
      shortName: `T${i + 1}`,
      logoUrl: '',
      primaryColor: '#000',
      secondaryColor: '#fff',
      groupName: 'Group A',
      city: '',
      cityBn: '',
      coach: '',
      stadium: '',
      captainId: `cap-${i + 1}`,
    }));

    const rng = new MockRng();
    const squadCounts = new Map<string, number>();
    fiveTeams.forEach((t) => squadCounts.set(t.id, 1)); // Captain

    // 3 leftovers in level
    const queue = DrawEngine.getTurnQueueForRound(fiveTeams, 3, squadCounts, rng);
    expect(queue.length).toBe(3);
    const uniqueIds = new Set(queue.map((t) => t.id));
    expect(uniqueIds.size).toBe(3);
  });
});
