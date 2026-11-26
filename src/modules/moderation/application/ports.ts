export interface AdminRecord {
  users: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  requestCount: number;
  reports: Array<{
    id: string;
    requestId: string | null;
    reporterId: string;
    reason: string;
    status: string;
    request: { title: string } | null;
    reporter: { name: string };
  }>;
}

export interface ModerationRepository {
  createReport(input: {
    reporterId: string;
    requestId: string;
    reason: 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'OTHER';
    details: string;
  }): Promise<void>;
  findReportedRequest(requestId: string): Promise<{ authorId: string; hidden: boolean } | null>;
  getAdminData(): Promise<AdminRecord>;
  getAccountStatus(userId: string): Promise<'ACTIVE' | 'SUSPENDED'>;
  updateAccountStatus(input: {
    userId: string;
    status: 'ACTIVE' | 'SUSPENDED';
    notificationMessage: string;
  }): Promise<void>;
  getReportForResolution(reportId: string): Promise<{ reporterId: string; requestId: string | null }>;
  resolveReport(input: {
    reportId: string;
    moderatorId: string;
    reporterId: string;
    hiddenRequestId: string | null;
    notificationMessage: string;
  }): Promise<void>;
}
