import { ITeamRepository, IPlayerRepository } from '../../../domain/repositories/index.js';
import { Team, Player } from '../../../domain/entities/index.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class TeamUseCases {
  constructor(
    private teamRepo: ITeamRepository,
    private playerRepo: IPlayerRepository
  ) {}

  public async getTeams(): Promise<Team[]> {
    return this.teamRepo.findAll();
  }

  public async getTeamById(id: string): Promise<Team & { squad: Player[] }> {
    const team = await this.teamRepo.findById(id);
    if (!team) {
      throw AppError.notFound(`Team with ID ${id} not found`);
    }

    const squad = await this.playerRepo.findByTeamId(id);
    return {
      ...team,
      squad,
    };
  }
}
