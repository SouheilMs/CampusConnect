import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getCurrentSession } from '@/presentation/server/access';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  return <AppShell>{children}</AppShell>;
}
