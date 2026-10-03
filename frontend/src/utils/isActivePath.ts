export const isActivePath = (href: string, pathname: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);
