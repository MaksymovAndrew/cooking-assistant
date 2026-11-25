import { maskClientAddress } from "middleware/clientAddress";

const CLIENT_IP = "203.0.113.77";
const CLIENT_NETWORK = "203.0.113.0";

describe("maskClientAddress", () => {
    it.each([
        ["an IPv4 address", CLIENT_IP, CLIENT_NETWORK],
        ["an IPv4-mapped IPv6 address", `::ffff:${CLIENT_IP}`, CLIENT_NETWORK],
        [
            "a full IPv6 address",
            "2001:db8:85a3:8d3:1319:8a2e:370:7348",
            "2001:db8:85a3::",
        ],
        ["a compressed IPv6 address", "2001:db8::1", "2001:db8:0::"],
        ["an IPv6 address with a zone", "2001:db8:1::7%eth0", "2001:db8:1::"],
    ])("should keep only the network of %s", (_case, ip, masked) => {
        expect(maskClientAddress(ip)).toBe(masked);
    });

    it.each([[undefined], [""], ["not-an-address"]])(
        "should log no address for %p",
        (ip) => {
            expect(maskClientAddress(ip)).toBeNull();
        },
    );
});
