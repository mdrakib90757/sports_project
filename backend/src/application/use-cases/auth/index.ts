import { IUserRepository, ITeamRepository } from '../../../domain/repositories/index.js';
import { JwtService } from '../../../infrastructure/auth/JwtService.js';
import { AppError } from '../../../shared/errors/AppError.js';
import bcrypt from 'bcryptjs';

export class AuthUseCases {
  constructor(
    private userRepo: IUserRepository,
    private teamRepo: ITeamRepository,
    private jwtService: JwtService
  ) {}

  public async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = this.jwtService.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
      },
    };
  }

  public async verifyCaptainPin(teamId: string, pin: string): Promise<{ token: string; team: any }> {
    const team = await this.teamRepo.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (!team.captainPin || team.captainPin !== pin) {
      throw AppError.unauthorized('Invalid Captain PIN');
    }

    const token = this.jwtService.signToken({
      userId: `captain-${team.id}`,
      email: `captain@${team.shortName.toLowerCase()}.kpl`,
      role: 'CAPTAIN',
      teamId: team.id,
    });

    return {
      token,
      team: {
        id: team.id,
        name: team.name,
        nameBn: team.nameBn,
        shortName: team.shortName,
        logoUrl: team.logoUrl,
      },
    };
  }
}
