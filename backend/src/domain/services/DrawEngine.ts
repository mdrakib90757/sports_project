import { Player, Team, DrawPick } from '../entities/index.js';
import { PlayerLevel } from '../enums/index.js';

export interface RngProvider {
  /**
   * Generates a random integer in the range [0, max - 1].
   */
  randomInt(max: number): number;
}

export interface DrawEngineState {
  teams: Team[];
  poolPlayers: Player[]; // Remaining registered pool players (captains excluded)
  picksHistory: DrawPick[];
  currentLevel: PlayerLevel;
  currentRound: number;
}

export interface NextTurnCandidate {
  team: Team;
  roundNumber: number;
  pickIndex: number;
  level: PlayerLevel;
}

export class DrawEngine {
  private static readonly LEVEL_ORDER: PlayerLevel[] = ['A', 'B', 'C', 'EXTRA'];

  /**
   * Shuffles an array in place or returns a shuffled copy using Fisher-Yates with provided RNG.
   */
  public static shuffle<T>(array: readonly T[], rng: RngProvider): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rng.randomInt(i + 1);
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /**
   * Determines which level is currently being drawn based on remaining unassigned players.
   */
  public static getCurrentLevel(poolPlayers: Player[]): PlayerLevel | null {
    for (const level of this.LEVEL_ORDER) {
      const hasPlayersInLevel = poolPlayers.some((p) => p.level === level && !p.teamId);
      if (hasPlayersInLevel) {
        return level;
      }
    }
    return null;
  }

  /**
   * Calculates the squad count per team from current picks and assigned players.
   */
  public static getTeamSquadCounts(teams: Team[], poolPlayers: Player[], picks: DrawPick[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const team of teams) {
      // Each team starts with 1 for the pre-assigned captain if captain exists
      const captainCount = team.captainId ? 1 : 0;
      const assignedCount = poolPlayers.filter((p) => p.teamId === team.id).length;
      const pickedCount = picks.filter((pick) => pick.teamId === team.id).length;
      // Use max of assignedCount or pickedCount to prevent double counting
      counts.set(team.id, captainCount + Math.max(assignedCount, pickedCount));
    }
    return counts;
  }

  /**
   * Resolves the ordered team turn queue for a round in the current level.
   * If remaining players in the level < total teams T, only that many teams get turns,
   * prioritized randomly among teams with the fewest total players so far to maintain balance.
   */
  public static getTurnQueueForRound(
    teams: Team[],
    remainingPlayersInLevel: number,
    squadCounts: Map<string, number>,
    rng: RngProvider
  ): Team[] {
    if (teams.length === 0 || remainingPlayersInLevel <= 0) {
      return [];
    }

    if (remainingPlayersInLevel >= teams.length) {
      // Full round: shuffle all teams
      return this.shuffle(teams, rng);
    }

    // Leftovers round: Pick teams with the lowest squad size
    let minSquadSize = Number.POSITIVE_INFINITY;
    for (const team of teams) {
      const count = squadCounts.get(team.id) || 0;
      if (count < minSquadSize) {
        minSquadSize = count;
      }
    }

    // Teams tied for minimum squad size
    const lowestSquadTeams = teams.filter((t) => (squadCounts.get(t.id) || 0) === minSquadSize);
    const shuffledLowest = this.shuffle(lowestSquadTeams, rng);

    if (shuffledLowest.length >= remainingPlayersInLevel) {
      return shuffledLowest.slice(0, remainingPlayersInLevel);
    }

    // If not enough lowest squad teams, take all lowest and fill from next tier
    const selected = [...shuffledLowest];
    const remainingSlots = remainingPlayersInLevel - selected.length;
    const higherTierTeams = teams.filter((t) => !selected.some((s) => s.id === t.id));
    const shuffledHigher = this.shuffle(higherTierTeams, rng);
    return [...selected, ...shuffledHigher.slice(0, remainingSlots)];
  }

  /**
   * Pure step: Performs ONE pick for the designated captain's team from the remaining pool players of the current level.
   */
  public static executePick(
    team: Team,
    currentLevel: PlayerLevel,
    poolPlayers: Player[],
    roundNumber: number,
    pickIndex: number,
    sessionId: string,
    rng: RngProvider
  ): { pick: DrawPick; updatedPlayer: Player } {
    const available = poolPlayers.filter((p) => p.level === currentLevel && !p.teamId);
    if (available.length === 0) {
      throw new Error(`No available players left in level ${currentLevel}`);
    }

    const randomIndex = rng.randomInt(available.length);
    const chosenPlayer = available[randomIndex];

    const pick: DrawPick = {
      id: `pick-${sessionId}-${pickIndex + 1}`,
      sessionId,
      roundNumber,
      pickIndex: pickIndex + 1,
      teamId: team.id,
      playerId: chosenPlayer.id,
      level: currentLevel,
      pickedAt: new Date().toISOString(),
      team,
      player: chosenPlayer,
    };

    const updatedPlayer: Player = {
      ...chosenPlayer,
      teamId: team.id,
    };

    return { pick, updatedPlayer };
  }
}
