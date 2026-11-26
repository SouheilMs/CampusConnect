import { getCurrentSession } from '@/presentation/server/access';
import { redirect } from 'next/navigation';
import { notificationRepository } from '@/presentation/server/services';

export default async function Notifications() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  const notifications = await notificationRepository.getNotifications(session.user.id);

  return <div>
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <form action={async () => {
        'use server';
        const current = await getCurrentSession();
        if (!current) redirect('/login');
        await notificationRepository.markAllNotificationsRead(current.user.id);
        redirect('/notifications');
      }}>
        <button className="rounded-lg border px-3 py-2 text-sm">Mark all read</button>
      </form>
    </div>
    <div className="mt-6 space-y-3">
      {notifications.map(notification => <form key={notification.id} action={async () => {
        'use server';
        const current = await getCurrentSession();
        if (!current) redirect('/login');
        await notificationRepository.markNotificationRead(notification.id, current.user.id);
        redirect('/notifications');
      }}>
        <button className={`w-full rounded-xl border p-4 text-left ${notification.read ? 'bg-white' : 'border-indigo-200 bg-indigo-50'}`}>
          <p className="text-sm">{notification.message}</p>
          <p className="mt-1 text-xs text-slate-400">{notification.createdAt.toLocaleString()} · {notification.read ? 'Read' : 'Unread'}</p>
        </button>
      </form>)}
    </div>
    {!notifications.length && <p className="mt-8 rounded-xl border border-dashed bg-white p-12 text-center text-slate-500">No notifications.</p>}
  </div>;
}
