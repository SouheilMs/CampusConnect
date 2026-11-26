import type { MatchingCandidate } from '../domain/calculator';

interface MatchingRequestRecord {
  id: string;
  title: string;
  level: string;
  availability: string | null;
  subject: { name: string };
}

export interface MatchingRepository {
  getMatchingData(userId: string): Promise<{
    requests: MatchingRequestRecord[];
    candidates: MatchingCandidate[];
  }>;
}
