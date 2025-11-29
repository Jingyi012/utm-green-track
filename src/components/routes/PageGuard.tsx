"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { menuItems } from "@/lib/config/menu";

function findItemAndEffectiveRoles(items: any[], key: string, inheritedRoles?: string[] | undefined): { item: any | null; roles?: string[] | undefined } {
    for (const item of items) {
        const currentRoles = item.roles ?? inheritedRoles;
        if (item.key === key) {
            return { item, roles: currentRoles };
        }
        if (item.children) {
            const found = findItemAndEffectiveRoles(item.children, key, currentRoles);
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
        const { item, roles: requiredRoles } = findItemAndEffectiveRoles(menuItems as any[], pathname);

        if (!item) {
            notFound();
            return;
        }

        // If no required roles (neither on item nor its ancestors), allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            setAuthorized(true);
            return;
        }

        const allowed = requiredRoles.some((r: string) => roles.includes(r));
        if (!allowed) {
            notFound();
        }
        setAuthorized(allowed);
    }, [pathname, roles, router]);

    if (!authorized) return null;

    return <>{children}</>;
}
