'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPageAccessRequirement } from '@/lib/utils/permissions';
import ForbiddenPage from '@/components/layouts/forbiddenPage';

export default function PageGuard({ children }: { children: React.ReactNode }) {
  const { permissions, hasPermission, user } = useAuth();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // If user is not authenticated, deny access
    if (!user) {
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
  }, [pathname, permissions, hasPermission, user]);

  // Show nothing while loading auth state
  if (authorized === null) {
    return null;
  }

  if (accessDenied) return <ForbiddenPage />;
  if (!authorized) return null;
  return <>{children}</>;
}
