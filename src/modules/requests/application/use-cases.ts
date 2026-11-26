import { DomainError } from '@/domain/errors';
import type { RequestRepository } from './ports';

export class RequestService {
  constructor(private readonly repository: RequestRepository) {}

  listRequests(filters: Parameters<RequestRepository['listRequests']>[0]) {
    return this.repository.listRequests(filters);
  }

  listSubjects() {
    return this.repository.listSubjects();
  }

  getRequestDetails(id: string, viewerId: string) {
    return this.repository.getRequestDetails(id, viewerId);
  }

  createRequest(input: Parameters<RequestRepository['createRequest']>[0]) {
    if (!input.title.trim() || !input.description.trim() || !input.subject.trim()) {
      throw new DomainError('Title, description, and subject are required');
    }
    return this.repository.createRequest({
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
    });
  }
}
