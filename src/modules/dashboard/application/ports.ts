export interface DashboardRecord {
  requestCount: number;
  proposalCount: number;
  receivedProposalCount: number;
  sessions: Array<{
    id: string;
    date: Date;
    duration: number;
    status: string;
    request: { title: string };
  }>;
  notifications: Array<{ id: string; message: string; read: boolean; createdAt: Date }>;
  averageRating: number | null;
}

export interface DashboardQueries {
  getDashboard(userId: string): Promise<DashboardRecord>;
}
