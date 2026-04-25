import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { getPageAccessRequirement } from '@/lib/utils/permissions';
import ForbiddenPage from '@/components/layouts/forbiddenPage';

export default function PageGuard({ children }: { children: React.ReactNode }) {
  const { permissions, hasPermission, user, isReady } = useAuth();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    // If user is not authenticated, deny access
    if (!user) {
      setAccessDenied(false);
      setAuthorized(false);
      return;
    }

    // Check permission-based access control using menu-configured access map
    const access = getPageAccessRequirement(pathname);

    const requiredPermission = access.requiredPermission;

    if (requiredPermission) {
      // If a specific permission is required, check it
      if (!hasPermission(requiredPermission)) {
        setAccessDenied(true);
        setAuthorized(false);
        return;
      }
    }

    // If no permission is required, allow access
    setAccessDenied(false);
    setAuthorized(true);
  }, [pathname, permissions, hasPermission, isReady, user]);

  // Show nothing while loading auth state
  if (!isReady || authorized === null) {
    return null;
  }

  if (accessDenied) return <ForbiddenPage />;
  if (!authorized) return null;
  return <>{children}</>;
}
