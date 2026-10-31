import { useMemo } from 'react';
import { useProfileStore } from '@/context/profile-store';
import { useServiceStore } from '@/context/service-store';
import {
  isNotaris as checkNotaris,
  visibleNotifications,
  visibleServices,
  type Actor,
} from '@/utils/permissions';

/**
 * Sesi pengguna aktif + data yang boleh dilihatnya.
 * Sumber kebenaran peran/nama adalah akun aktif di ProfileStore; layar cukup memakai hook ini.
 */
export function useSession() {
  const { account } = useProfileStore();
  const { services, notifications } = useServiceStore();

  const actor = useMemo<Actor>(
    () => ({ role: account.role, name: account.name }),
    [account.role, account.name]
  );

  const myServices = useMemo(() => visibleServices(actor, services), [actor, services]);
  const myNotifications = useMemo(
    () => visibleNotifications(actor, notifications, services),
    [actor, notifications, services]
  );
  const unreadCount = useMemo(() => myNotifications.filter((n) => !n.read).length, [myNotifications]);

  return {
    account,
    actor,
    isNotaris: checkNotaris(actor),
    services: myServices,
    notifications: myNotifications,
    unreadCount,
  };
}
