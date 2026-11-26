import { describe, expect, it, vi } from 'vitest';
import type { ProposalRepository } from '../../src/modules/proposals/application/ports';
import { AcceptHelpProposal, CreateHelpProposal } from '../../src/modules/proposals/application/use-cases';
import { ProposalRules } from '../../src/modules/proposals/domain/entities';

const request = { authorId: 'u1', title: 'SQL joins', status: 'OPEN', hidden: false };
const submission = { actorId: 'u2', requestId: 'r1', message: 'I can help with SQL', studentName: 'Sam' };

function makeRepository(overrides: Partial<ProposalRepository> = {}): ProposalRepository {
  return {
    findRequest: async () => request,
    findById: async () => ({
      id: 'p1',
      requestId: 'r1',
      studentId: 'u2',
      status: 'PENDING',
      request: { id: 'r1', authorId: 'u1', status: 'OPEN' },
    }),
    acceptAtomically: vi.fn(),
    findDuplicate: async () => null,
    createWithNotification: async () => ({ id: 'p2', requestId: 'r1', studentId: 'u2', status: 'PENDING' }),
    reject: vi.fn(),
    ...overrides,
  };
}

describe('proposal business rules', () => {
  it('rejects self-help', () => {
    expect(() => ProposalRules.cannotHelpOwnRequest('u1', 'u1')).toThrow();
  });

  it('rejects accepting a closed request', () => {
    expect(() => ProposalRules.requestAcceptable('COMPLETED')).toThrow();
  });

  it('rejects unauthorized acceptance', async () => {
    await expect(new AcceptHelpProposal(makeRepository()).execute('u3', 'p1'))
      .rejects.toThrow('Only the request owner');
  });
});

describe('CreateHelpProposal', () => {
  it('rejects a student proposing to themselves', async () => {
    await expect(new CreateHelpProposal(makeRepository()).execute({ ...submission, actorId: 'u1' }))
      .rejects.toThrow('own request');
  });

  it('rejects proposals for closed requests', async () => {
    const repository = makeRepository({ findRequest: async () => ({ ...request, status: 'COMPLETED' }) });
    await expect(new CreateHelpProposal(repository).execute(submission)).rejects.toThrow('closed');
  });

  it('rejects messages shorter than the presentation requirement', async () => {
    await expect(new CreateHelpProposal(makeRepository()).execute({ ...submission, message: 'Too short' }))
      .rejects.toThrow('at least 10 characters');
  });

  it('does not write a proposal or notification for a hidden request', async () => {
    const createWithNotification = vi.fn();
    const repository = makeRepository({
      findRequest: async () => ({ ...request, hidden: true }),
      createWithNotification,
    });

    await expect(new CreateHelpProposal(repository).execute(submission)).rejects.toThrow('Request not found');
    expect(createWithNotification).not.toHaveBeenCalled();
  });

  it('passes the proposal and its notification to a single repository operation', async () => {
    const result = { id: 'p2', requestId: 'r1', studentId: 'u2', status: 'PENDING' as const };
    const createWithNotification = vi.fn().mockResolvedValue(result);
    const repository = makeRepository({ createWithNotification });

    await expect(new CreateHelpProposal(repository).execute(submission)).resolves.toEqual(result);
    expect(createWithNotification).toHaveBeenCalledExactlyOnceWith({
      requestId: 'r1',
      studentId: 'u2',
      message: 'I can help with SQL',
      recipientId: 'u1',
      notificationMessage: 'Sam submitted a proposal for SQL joins.',
    });
  });
});

describe('AcceptHelpProposal', () => {
  it('passes the session plan and notifications to the repository port', async () => {
    const requests: Parameters<ProposalRepository['acceptAtomically']>[0][] = [];
    const repository = makeRepository({ acceptAtomically: async input => { requests.push(input); } });

    await new AcceptHelpProposal(repository).execute('u1', 'p1');

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      proposalId: 'p1',
      requestId: 'r1',
      ownerId: 'u1',
      helpingStudentId: 'u2',
      duration: 60,
      meetingMode: 'ONLINE',
      meetingUrl: 'https://meet.google.com/campus-connect',
      notifications: [
        { recipientId: 'u2', type: 'PROPOSAL_ACCEPTED' },
        { recipientId: 'u1', type: 'SESSION_CREATED' },
      ],
    });
    expect(requests[0].sessionDate.getTime()).toBeGreaterThan(Date.now());
  });
});
