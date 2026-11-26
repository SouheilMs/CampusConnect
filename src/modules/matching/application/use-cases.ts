import { calculateCompatibility } from '../domain/calculator';
import type { MatchingRepository } from './ports';

export class MatchingService {
  constructor(private readonly repository: MatchingRepository) {}

  async getMatching(userId: string, requestedId?: string) {
    const data = await this.repository.getMatchingData(userId);
    const request = data.requests.find(item => item.id === requestedId) ?? data.requests[0];
    if (!request) return { requests: data.requests, request: null, candidates: [] };
    const matchingRequest = {
      subject: request.subject.name,
      level: request.level,
      requiredSkills: [],
      availability: request.availability ? [request.availability] : [],
    };
    const candidates = data.candidates
      .map(candidate => calculateCompatibility(candidate, matchingRequest))
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
    return { requests: data.requests, request, candidates };
  }
}
