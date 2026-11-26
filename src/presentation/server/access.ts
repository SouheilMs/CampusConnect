import { cache } from 'react';
import { auth } from '@/presentation/auth';
import { accountService } from './services';

export const getCurrentSession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const account = await accountService.getActiveAccount(session.user.id);
  if (!account) return null;

  const { id, name, email, image, role } = account;
  return { ...session, user: { id, name, email, image, role } };
});
