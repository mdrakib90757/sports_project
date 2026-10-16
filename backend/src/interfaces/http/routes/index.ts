import { Router } from 'express';
import { MatchController } from '../controllers/MatchController.js';
import { TeamController } from '../controllers/TeamController.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { OfficialController } from '../controllers/OfficialController.js';
import { StandingsController } from '../controllers/StandingsController.js';
import { AuthController } from '../controllers/AuthController.js';
import { DrawController } from '../controllers/DrawController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authRateLimiter, registrationRateLimiter } from '../middlewares/rateLimiter.js';
import { RealtimePublisher } from '../../../infrastructure/realtime/RealtimePublisher.js';

export function createApiRouter(
  matchController: MatchController,
  teamController: TeamController,
  playerController: PlayerController,
  officialController: OfficialController,
  standingsController: StandingsController,
  authController: AuthController,
  drawController: DrawController,
  realtimePublisher: RealtimePublisher
): Router {
  const router = Router();

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'KPL Season 3 Backend', timestamp: new Date().toISOString() });
  });

  // Matches
  router.get('/matches', matchController.getMatches);
  router.get('/matches/:id', matchController.getMatchById);
  router.patch('/matches/:id/score', requireAuth(['ADMIN', 'OPERATOR']), matchController.updateScore);
  router.post('/matches/:id/events', requireAuth(['ADMIN', 'OPERATOR']), matchController.recordEvent);
  router.delete('/matches/:id/events/:eventId', requireAuth(['ADMIN', 'OPERATOR']), matchController.deleteEvent);

  // Teams
  router.get('/teams', teamController.getTeams);
  router.get('/teams/:id', teamController.getTeamById);

  // Players
  router.get('/players', playerController.getPlayers);
  router.get('/top-scorers', playerController.getTopScorers);
  router.post('/players/register', registrationRateLimiter, playerController.registerPlayer);
  router.patch('/players/:id/level', requireAuth(['ADMIN']), playerController.assignLevel);
  router.patch('/players/:id/squad-role', requireAuth(['ADMIN', 'CAPTAIN']), playerController.setSquadRole);

  // Standings
  router.get('/standings', standingsController.getStandings);

  // Officials
  router.get('/officials', officialController.getOfficials);

  // Auth
  router.post('/auth/login', authRateLimiter, authController.login);
  router.post('/auth/captain-pin', authRateLimiter, authController.verifyCaptainPin);
  router.post('/auth/logout', authController.logout);
  router.get('/auth/me', requireAuth(['ADMIN', 'OPERATOR', 'CAPTAIN']), authController.me);

  // Lottery / Draw
  router.get('/draw/session', drawController.getSessionState);
  router.post('/draw/start', drawController.startSession);
  router.post('/draw/next-pick', drawController.nextPick);
  router.post('/draw/undo', drawController.undoLastPick);
  router.post('/draw/reset', drawController.resetSession);

  // Server-Sent Events (SSE) fallback channel
  router.get('/realtime/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    realtimePublisher.registerSseClient(res);
  });

  return router;
}
