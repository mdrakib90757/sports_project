import { Team, Match, StandingsRow, Player, TopScorerRow, MatchEvent } from '../types';

export function computeStandings(teams: Team[], matches: Match[]): {
  groupA: StandingsRow[];
  groupB: StandingsRow[];
  overall: StandingsRow[];
} {
  const statsMap = new Map<string, StandingsRow>();

  teams.forEach((t) => {
    statsMap.set(t.id, {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      form: [],
    });
  });

  // Sort matches chronologically to track form correctly
  const relevantMatches = [...matches]
    .filter(
      (m) =>
        m.stage === 'group' &&
        (m.status === 'full_time' ||
          m.status === 'live_first_half' ||
          m.status === 'live_second_half' ||
          m.status === 'half_time' ||
          m.status === 'extra_time' ||
          m.status === 'penalties')
    )
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  relevantMatches.forEach((m) => {
    const home = statsMap.get(m.home_team_id);
    const away = statsMap.get(m.away_team_id);

    if (home && away) {
      home.played += 1;
      away.played += 1;

      home.gf += m.home_score;
      home.ga += m.away_score;
      away.gf += m.away_score;
      away.ga += m.home_score;

      if (m.home_score > m.away_score) {
        home.won += 1;
        home.points += 3;
        home.form.push('W');

        away.lost += 1;
        away.form.push('L');
      } else if (m.home_score === m.away_score) {
        home.drawn += 1;
        home.points += 1;
        home.form.push('D');

        away.drawn += 1;
        away.points += 1;
        away.form.push('D');
      } else {
        home.lost += 1;
        home.form.push('L');

        away.won += 1;
        away.points += 3;
        away.form.push('W');
      }

      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    }
  });

  // Keep latest 5 form entries
  statsMap.forEach((row) => {
    row.form = row.form.slice(-5);
  });

  const sortFn = (a: StandingsRow, b: StandingsRow) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.name.localeCompare(b.team.name);
  };

  const allRows = Array.from(statsMap.values()).sort(sortFn);
  const groupA = allRows.filter((r) => r.team.group_name === 'Group A').sort(sortFn);
  const groupB = allRows.filter((r) => r.team.group_name === 'Group B').sort(sortFn);

  return {
    groupA,
    groupB,
    overall: allRows,
  };
}

export function computeTopScorers(
  players: Player[],
  teams: Team[],
  events: MatchEvent[]
): TopScorerRow[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerStats = new Map<
    string,
    { goals: number; assists: number; penalties: number; matches: number }
  >();

  players.forEach((p) => {
    playerStats.set(p.id, {
      goals: p.goals_count || 0,
      assists: p.assists_count || 0,
      penalties: 0,
      matches: p.appearances || 3,
    });
  });

  // Calculate from event logs if any additional
  events.forEach((e) => {
    const stat = playerStats.get(e.player_id);
    if (stat) {
      if (e.event_type === 'penalty_goal') {
        stat.penalties += 1;
      }
    }
    if (e.assist_player_id) {
      const assistStat = playerStats.get(e.assist_player_id);
      if (assistStat && !assistStat.assists) {
        assistStat.assists += 1;
      }
    }
  });

  const rows: TopScorerRow[] = [];

  players.forEach((player) => {
    const stats = playerStats.get(player.id) ?? { goals: 0, assists: 0, penalties: 0, matches: 3 };
    const team = teamMap.get(player.team_id);
    if (team && stats.goals > 0) {
      rows.push({
        rank: 0,
        player,
        team,
        goals: stats.goals,
        assists: stats.assists,
        penalties: stats.penalties,
        matches: stats.matches,
      });
    }
  });

  rows.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return a.matches - b.matches;
  });

  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  return rows;
}
