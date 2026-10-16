import { IMatchRepository, ITeamRepository } from '../../../domain/repositories/index.js';
import { Team } from '../../../domain/entities/index.js';

export interface StandingsRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export class StandingsUseCases {
  constructor(
    private matchRepo: IMatchRepository,
    private teamRepo: ITeamRepository
  ) {}

  public async getStandings(): Promise<{ groupA: StandingsRow[]; groupB: StandingsRow[] }> {
    const [teams, matches] = await Promise.all([
      this.teamRepo.findAll(),
      this.matchRepo.findAll(),
    ]);

    const computeGroup = (groupName: 'Group A' | 'Group B'): StandingsRow[] => {
      const groupTeams = teams.filter((t) => t.groupName === groupName);

      const rows: StandingsRow[] = groupTeams.map((team) => {
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;
        let gf = 0;
        let ga = 0;
        const form: ('W' | 'D' | 'L')[] = [];

        const teamMatches = matches.filter(
          (m) =>
            (m.homeTeamId === team.id || m.awayTeamId === team.id) &&
            m.stage === 'group' &&
            m.status === 'full_time'
        );

        for (const m of teamMatches) {
          played++;
          const isHome = m.homeTeamId === team.id;
          const scored = isHome ? m.homeScore : m.awayScore;
          const conceded = isHome ? m.awayScore : m.homeScore;

          gf += scored;
          ga += conceded;

          if (scored > conceded) {
            won++;
            form.push('W');
          } else if (scored === conceded) {
            drawn++;
            form.push('D');
          } else {
            lost++;
            form.push('L');
          }
        }

        const gd = gf - ga;
        const points = won * 3 + drawn;

        return {
          team,
          played,
          won,
          drawn,
          lost,
          gf,
          ga,
          gd,
          points,
          form: form.slice(-5),
        };
      });

      return rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
    };

    return {
      groupA: computeGroup('Group A'),
      groupB: computeGroup('Group B'),
    };
  }
}
