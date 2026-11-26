export interface SessionRecord {
  id: string;
  requestId: string;
  ownerId: string;
  helpingStudentId: string;
  date: Date;
  duration: number;
  status: string;
  request: { title: string };
  owner: { name: string };
  helpingStudent: { name: string };
}

export interface ReviewSessionRecord {
  id: string;
  ownerId: string;
  helpingStudentId: string;
  request: { title: string };
  owner: { id: string; name: string };
  helpingStudent: { id: string; name: string };
  reviews: Array<{ reviewerId: string; reviewedStudentId: string }>;
}

export interface SessionRepository {
  getSessions(userId: string): Promise<SessionRecord[]>;
  completeSession(session: SessionRecord, notificationMessage: string): Promise<void>;
  cancelSession(session: SessionRecord, notificationMessage: string): Promise<void>;
  getCompletedSessionsForReview(userId: string): Promise<ReviewSessionRecord[]>;
  createReview(input: {
    sessionId: string;
    reviewerId: string;
    reviewedStudentId: string;
    rating: number;
    comment: string;
    notificationMessage: string;
  }): Promise<void>;
}
