"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AppMenuItem, proLayoutMenuData } from "@/lib/config/menu";

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

    useEffect(() => {
        const { item, roles: requiredRoles } = findItemAndEffectiveRoles(proLayoutMenuData, pathname);

        // If no required roles (neither on item nor its ancestors), allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            setAuthorized(true);
            return;
        }

        const allowed = requiredRoles.some((r: string) => roles.includes(r));
        if (!allowed) {
            router.replace("/forbidden");
        }
        setAuthorized(allowed);
    }, [pathname, roles, router]);

    if (!authorized) return null;

    return <>{children}</>;
}
