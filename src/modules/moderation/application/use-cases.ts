import { DomainError } from '@/domain/errors';
import type { ModerationRepository } from './ports';

export class ModerationService {
  constructor(private readonly repository: ModerationRepository) {}

  getAdminData() {
    return this.repository.getAdminData();
  }

  async submitReport(input: Parameters<ModerationRepository['createReport']>[0]) {
    const request = await this.repository.findReportedRequest(input.requestId);
    if (!request || request.hidden) throw new DomainError('Request not found');
    if (request.authorId === input.reporterId) throw new DomainError('You cannot report your own request');
    return this.repository.createReport(input);
  }

  async toggleAccountStatus(userId: string) {
    const currentStatus = await this.repository.getAccountStatus(userId);
    const status = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.repository.updateAccountStatus({
      userId,
      status,
      notificationMessage: `Your account was ${status === 'SUSPENDED' ? 'suspended' : 'reactivated'}.`,
    });
  }

  async resolveReport(reportId: string, moderatorId: string) {
    const report = await this.repository.getReportForResolution(reportId);
    return this.repository.resolveReport({
      reportId,
      moderatorId,
      reporterId: report.reporterId,
      hiddenRequestId: report.requestId,
      notificationMessage: 'A report you submitted was resolved and the publication was hidden.',
    });
  }
}
