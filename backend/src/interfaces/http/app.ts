import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../../config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createApiRouter } from './routes/index.js';

// Repositories
import { TeamRepository } from '../../infrastructure/database/repositories/TeamRepository.js';
import { PlayerRepository } from '../../infrastructure/database/repositories/PlayerRepository.js';
import { MatchRepository } from '../../infrastructure/database/repositories/MatchRepository.js';
import { OfficialRepository } from '../../infrastructure/database/repositories/OfficialRepository.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { DrawRepository } from '../../infrastructure/database/repositories/DrawRepository.js';

// Services
import { RealtimePublisher } from '../../infrastructure/realtime/RealtimePublisher.js';
import { JwtService } from '../../infrastructure/auth/JwtService.js';

// Use Cases
import { MatchUseCases } from '../../application/use-cases/matches/index.js';
import { TeamUseCases } from '../../application/use-cases/teams/index.js';
import { PlayerUseCases } from '../../application/use-cases/players/index.js';
import { OfficialUseCases } from '../../application/use-cases/officials/index.js';
import { StandingsUseCases } from '../../application/use-cases/standings/index.js';
import { AuthUseCases } from '../../application/use-cases/auth/index.js';
import { DrawUseCases } from '../../application/use-cases/draw/index.js';
import { CryptoRngAdapter } from '../../infrastructure/rng/CryptoRngAdapter.js';

// Controllers
import { MatchController } from './controllers/MatchController.js';
import { TeamController } from './controllers/TeamController.js';
import { PlayerController } from './controllers/PlayerController.js';
import { OfficialController } from './controllers/OfficialController.js';
import { StandingsController } from './controllers/StandingsController.js';
import { AuthController } from './controllers/AuthController.js';
import { DrawController } from './controllers/DrawController.js';

export function createApp(): { app: Express; realtimePublisher: RealtimePublisher } {
  const app = express();

  // Middleware
  app.use(cors({
    origin: (origin, callback) => {
      // Allow local development ports and matching env CORS_ORIGIN
      callback(null, true);
    },
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestLogger);

  // Composition Root: Dependency Injection
  const teamRepo = new TeamRepository();
  const playerRepo = new PlayerRepository();
  const matchRepo = new MatchRepository();
  const officialRepo = new OfficialRepository();
  const userRepo = new UserRepository();
  const drawRepo = new DrawRepository();

  const realtimePublisher = RealtimePublisher.getInstance();
  const jwtService = new JwtService();
  const cryptoRng = new CryptoRngAdapter();

  const matchUseCases = new MatchUseCases(matchRepo, teamRepo, playerRepo, realtimePublisher);
  const teamUseCases = new TeamUseCases(teamRepo, playerRepo);
  const playerUseCases = new PlayerUseCases(playerRepo, teamRepo);
  const officialUseCases = new OfficialUseCases(officialRepo);
  const standingsUseCases = new StandingsUseCases(matchRepo, teamRepo);
  const authUseCases = new AuthUseCases(userRepo, teamRepo, jwtService);
  const drawUseCases = new DrawUseCases(drawRepo, teamRepo, playerRepo, cryptoRng, realtimePublisher);

  const matchController = new MatchController(matchUseCases);
  const teamController = new TeamController(teamUseCases);
  const playerController = new PlayerController(playerUseCases);
  const officialController = new OfficialController(officialUseCases);
  const standingsController = new StandingsController(standingsUseCases);
  const authController = new AuthController(authUseCases);
  const drawController = new DrawController(drawUseCases);

  const apiRouter = createApiRouter(
    matchController,
    teamController,
    playerController,
    officialController,
    standingsController,
    authController,
    drawController,
    realtimePublisher
  );

  app.use('/api', apiRouter);

  // Central Error Handler
  app.use(errorHandler);

  return { app, realtimePublisher };
}
