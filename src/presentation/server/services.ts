import { AccountService } from '@/modules/accounts/application/use-cases';
import { BcryptPasswordHasher } from '@/modules/accounts/infrastructure/bcrypt-password-hasher';
import { PrismaAccountRepository } from '@/modules/accounts/infrastructure/prisma-repository';
import type { DashboardQueries } from '@/modules/dashboard/application/ports';
import { PrismaDashboardQueries } from '@/modules/dashboard/infrastructure/prisma-queries';
import { MatchingService } from '@/modules/matching/application/use-cases';
import { PrismaMatchingRepository } from '@/modules/matching/infrastructure/prisma-repository';
import { ModerationService } from '@/modules/moderation/application/use-cases';
import { PrismaModerationRepository } from '@/modules/moderation/infrastructure/prisma-repository';
import type { NotificationRepository } from '@/modules/notifications/application/ports';
import { PrismaNotificationRepository } from '@/modules/notifications/infrastructure/prisma-repository';
import { AcceptHelpProposal, CreateHelpProposal, RejectHelpProposal } from '@/modules/proposals/application/use-cases';
import { PrismaProposalRepository } from '@/modules/proposals/infrastructure/prisma-repository';
import { RequestService } from '@/modules/requests/application/use-cases';
import { PrismaRequestRepository } from '@/modules/requests/infrastructure/prisma-repository';
import { SessionService } from '@/modules/sessions/application/use-cases';
import { PrismaSessionRepository } from '@/modules/sessions/infrastructure/prisma-repository';

export const accountService = new AccountService(new PrismaAccountRepository(), new BcryptPasswordHasher());
export const requestService = new RequestService(new PrismaRequestRepository());
export const sessionService = new SessionService(new PrismaSessionRepository());
export const matchingService = new MatchingService(new PrismaMatchingRepository());
export const moderationService = new ModerationService(new PrismaModerationRepository());
export const dashboardQueries: DashboardQueries = new PrismaDashboardQueries();
export const notificationRepository: NotificationRepository = new PrismaNotificationRepository();

const proposals = new PrismaProposalRepository();
export const proposalService = {
  create: new CreateHelpProposal(proposals),
  accept: new AcceptHelpProposal(proposals),
  reject: new RejectHelpProposal(proposals),
};
