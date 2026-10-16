import crypto from 'node:crypto';
import { RngProvider } from '../../domain/services/DrawEngine.js';

export class CryptoRngAdapter implements RngProvider {
  /**
   * Generates a cryptographically strong pseudo-random integer in range [0, max - 1].
   */
  public randomInt(max: number): number {
    if (max <= 0) {
      throw new Error('Max value must be strictly positive');
    }
    return crypto.randomInt(0, max);
  }
}
