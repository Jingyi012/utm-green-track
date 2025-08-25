"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { menuItems } from "@/lib/config/menu";

// helper to find matching menu item by route
function findMenuItemByKey(items: any[], key: string): any | null {
    for (const item of items) {
        if (item.key === key) return item;
        if (item.children) {
            const found = findMenuItemByKey(item.children, key);
            if (found) return found;
        }
    }
    return null;
}

export default function PageGuard({ children }: { children: React.ReactNode }) {
    const { roles } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const item = findMenuItemByKey(menuItems as any[], pathname);
        if (!item) {
            router.replace("/404");
            return;
        }

        if (!item.roles) {
            setAuthorized(true);
            return;
        }

        const allowed = item.roles.some((r: string) => roles.includes(r));
        if (!allowed) {
            router.replace("/403");
        }
        setAuthorized(allowed);
    }, [pathname, roles, router]);

    if (!authorized) return null; // or show a spinner/loading state

    return <>{children}</>;
}
