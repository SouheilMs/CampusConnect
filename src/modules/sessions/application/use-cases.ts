import { DomainError } from '@/domain/errors';
import type { SessionRepository } from './ports';

export class SessionService {
  constructor(private readonly repository: SessionRepository) {}

  getSessions(userId: string) {
    return this.repository.getSessions(userId);
  }

  async transitionSession(sessionId: string, actorId: string, status: 'COMPLETED' | 'CANCELLED') {
    const session = (await this.repository.getSessions(actorId)).find(item => item.id === sessionId);
    if (!session || session.status !== 'SCHEDULED') throw new DomainError('Session is no longer available');
    if (status === 'COMPLETED') {
      return this.repository.completeSession(session, `Session for ${session.request.title} was completed.`);
    }
    return this.repository.cancelSession(session, `Session for ${session.request.title} was cancelled.`);
  }

  getCompletedSessionsForReview(userId: string) {
    return this.repository.getCompletedSessionsForReview(userId);
  }

  async submitReview(input: {
    sessionId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment: string;
  }) {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new DomainError('Rating must be between 1 and 5');
    }
    if (!input.comment.trim()) throw new DomainError('Review comment is required');
    const session = (await this.repository.getCompletedSessionsForReview(input.reviewerId))
      .find(item => item.id === input.sessionId);
    if (!session) throw new DomainError('Completed session not found');
    const reviewedStudentId = session.ownerId === input.reviewerId
      ? session.helpingStudentId
      : session.ownerId;
    if (session.reviews.some(review => review.reviewerId === input.reviewerId && review.reviewedStudentId === reviewedStudentId)) {
      throw new DomainError('Review already submitted');
    }
    const { reviewerName, ...review } = input;
    return this.repository.createReview({
      ...review,
      reviewedStudentId,
      notificationMessage: `${reviewerName} left you a ${input.rating}-star review.`,
    });
  }
}
