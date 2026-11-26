import type { ProposalStatus } from '@/modules/proposals/domain/entities';

export interface SubjectRecord {
  id: string;
  name: string;
}

export interface RequestSummary {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  authorId: string;
  availability: string | null;
  subject: SubjectRecord;
  author: { name: string };
  _count: { proposals: number };
}

export interface RequestDetails extends Omit<RequestSummary, '_count'> {
  hidden: boolean;
  proposals: Array<{ id: string; status: ProposalStatus; message: string; student: { name: string } }>;
}

export interface RequestRepository {
  listRequests(filters: {
    keyword?: string;
    subject?: string;
    level?: string;
    status?: string;
    sort?: string;
  }): Promise<RequestSummary[]>;
  listSubjects(): Promise<SubjectRecord[]>;
  getRequestDetails(id: string, viewerId: string): Promise<RequestDetails | null>;
  createRequest(input: {
    title: string;
    description: string;
    subject: string;
    level: string;
    availability: string;
    authorId: string;
  }): Promise<void>;
}
