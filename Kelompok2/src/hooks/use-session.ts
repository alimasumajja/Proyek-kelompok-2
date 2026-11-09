import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useServiceStore } from '@/context/service-store';
import {
  isNotaris as checkNotaris,
  visibleNotifications,
  visibleServices,
  type Actor,
} from '@/utils/permissions';

/**
 * Sesi pengguna aktif + data yang boleh dilihatnya.
 * Identitas dan peran berasal dari profil Supabase melalui AuthContext.
 */
export function useSession() {
  const { user } = useAuth();
  const { services, notifications, servicesLoading, servicesError, refreshServices } = useServiceStore();

  const actor = useMemo<Actor>(
    () => ({ id: user?.id, role: user?.role ?? 'Staf', name: user?.name ?? '' }),
    [user?.id, user?.role, user?.name]
  );

  const myServices = useMemo(
    () => (user ? visibleServices(actor, services) : []),
    [actor, services, user]
  );
  const myNotifications = useMemo(
    () => (user ? visibleNotifications(actor, notifications, services) : []),
    [actor, notifications, services, user]
  );
  const unreadCount = useMemo(
    () => myNotifications.filter((notification) => !notification.read).length,
    [myNotifications]
  );

  return {
    account: user,
    actor,
    isNotaris: user ? checkNotaris(actor) : false,
    services: myServices,
    notifications: myNotifications,
    unreadCount,
    servicesLoading,
    servicesError,
    refreshServices,
  };
}
