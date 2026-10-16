import { IOfficialRepository } from '../../../domain/repositories/index.js';
import { Official } from '../../../domain/entities/index.js';

export class OfficialUseCases {
  constructor(private officialRepo: IOfficialRepository) {}

  public async getOfficials(): Promise<Official[]> {
    return this.officialRepo.findAll();
  }

  public async createOfficial(official: Official): Promise<Official> {
    return this.officialRepo.create(official);
  }

  public async updateOfficial(official: Official): Promise<Official> {
    return this.officialRepo.update(official);
  }

  public async deleteOfficial(id: string): Promise<void> {
    return this.officialRepo.delete(id);
  }
}
