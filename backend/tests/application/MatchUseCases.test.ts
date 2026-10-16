import { describe, it, expect, beforeEach } from 'vitest';
import { MatchUseCases } from '../../src/application/use-cases/matches/index.js';
import { MatchRepository } from '../../src/infrastructure/database/repositories/MatchRepository.js';
import { TeamRepository } from '../../src/infrastructure/database/repositories/TeamRepository.js';
import { PlayerRepository } from '../../src/infrastructure/database/repositories/PlayerRepository.js';
import { RealtimePublisher } from '../../src/infrastructure/realtime/RealtimePublisher.js';

describe('MatchUseCases', () => {
  let matchUseCases: MatchUseCases;
  let matchRepo: MatchRepository;
  let teamRepo: TeamRepository;
  let playerRepo: PlayerRepository;

  beforeEach(() => {
    matchRepo = new MatchRepository();
    teamRepo = new TeamRepository();
    playerRepo = new PlayerRepository();
    const publisher = RealtimePublisher.getInstance();
    matchUseCases = new MatchUseCases(matchRepo, teamRepo, playerRepo, publisher);
  });

  it('fetches matches with hydrated home and away teams', async () => {
    const matches = await matchUseCases.getMatches();
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].homeTeam).toBeDefined();
    expect(matches[0].awayTeam).toBeDefined();
  });

  it('updates match score and retains running state', async () => {
    const updated = await matchUseCases.updateScore(
      'match-live-1',
      3,
      2,
      'live_second_half',
      75,
      true
    );

    expect(updated.homeScore).toBe(3);
    expect(updated.awayScore).toBe(2);
    expect(updated.currentMinute).toBe(75);
  });

  it('recording a goal event automatically updates score and player goal count', async () => {
    const beforePlayer = await playerRepo.findById('ply-1');
    const prevGoals = beforePlayer?.goalsCount || 0;

    const result = await matchUseCases.recordEvent({
      matchId: 'match-live-1',
      teamId: 'team-1',
      playerId: 'ply-1',
      eventType: 'goal',
      minute: 82,
      description: 'Stunning free kick',
    });

    expect(result.event).toBeDefined();
    expect(result.goalAlert).toBeDefined();
    expect(result.goalAlert.minute).toBe(82);

    const afterPlayer = await playerRepo.findById('ply-1');
    expect(afterPlayer?.goalsCount).toBe(prevGoals + 1);
  });
});
