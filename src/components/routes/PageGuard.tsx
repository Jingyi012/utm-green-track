"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AppMenuItem, proLayoutMenuData } from "@/lib/config/menu";
import ForbiddenPage from "@/components/layouts/forbiddenPage";

function findItemAndEffectiveRoles(
    items: AppMenuItem[],
    path: string,
    inheritedRoles?: string[]
): { item: AppMenuItem | null; roles?: string[] } {
    for (const item of items) {
        const currentRoles = item.roles && item.roles.length > 0 ? item.roles : inheritedRoles;

        if (item.path === path) return { item, roles: currentRoles };

        if (item.children && item.children.length > 0) {
            const found = findItemAndEffectiveRoles(item.children, path, currentRoles);
            if (found.item) return found;
        }
    }
    return { item: null, roles: inheritedRoles };
}

export default function PageGuard({ children }: { children: React.ReactNode }) {
    const { roles, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        const { item, roles: requiredRoles } = findItemAndEffectiveRoles(proLayoutMenuData, pathname);

        if (!requiredRoles || requiredRoles.length === 0) {
            setAuthorized(true);
            return;
        }

        const allowed = requiredRoles.some((r: string) => roles.includes(r));
        if (!allowed) {
            setAccessDenied(true);
            setAuthorized(false);
            return;
        }
        setAuthorized(true);
    }, [pathname, roles]);

    if (accessDenied) return <ForbiddenPage />;
    if (!authorized) return null;
    return <>{children}</>;
}
