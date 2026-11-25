import { isIPv4, isIPv6 } from "node:net";

const IPV6_GROUPS = 8;
const IPV6_KEPT_GROUPS = 3;
const IPV4_KEPT_OCTETS = 3;
const HEX_RADIX = 16;
const IPV4_MAPPED_PATTERN = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;

function maskIpv4(address: string): string {
    return `${address.split(".").slice(0, IPV4_KEPT_OCTETS).join(".")}.0`;
}

// an embedded dotted IPv4 tail takes the room of two groups
function groupCount(groups: string[]): number {
    return groups.reduce(
        (count, group) => count + (group.includes(".") ? 2 : 1),
        0,
    );
}

function maskIpv6(address: string): string {
    const [head = "", tail = ""] = address.split("::");
    const headGroups = head ? head.split(":") : [];
    const tailGroups = tail ? tail.split(":") : [];
    const zeros = Array.from(
        {
            length:
                IPV6_GROUPS - groupCount(headGroups) - groupCount(tailGroups),
        },
        () => "0",
    );
    const kept = [...headGroups, ...zeros, ...tailGroups]
        .slice(0, IPV6_KEPT_GROUPS)
        .map((group) => Number.parseInt(group, HEX_RADIX).toString(HEX_RADIX));

    return `${kept.join(":")}::`;
}

// the same /24 and /48 the site access log keeps, so no log on the server holds a whole address
export function maskClientAddress(ip: string | undefined): string | null {
    const address = ip?.split("%")[0] ?? "";
    const mapped = IPV4_MAPPED_PATTERN.exec(address)?.[1];

    if (mapped && isIPv4(mapped)) {
        return maskIpv4(mapped);
    }

    if (isIPv4(address)) {
        return maskIpv4(address);
    }

    return isIPv6(address) ? maskIpv6(address) : null;
}
