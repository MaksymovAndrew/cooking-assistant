import { LOGIN_TIMING_DECOY_HASH } from "config/security";

import BcryptPasswordHasher from "infrastructure/security/BcryptPasswordHasher";

const PASSWORD = "correct horse battery staple";

function costOf(hash: string): number {
    return Number(hash.split("$")[2]);
}

describe("BcryptPasswordHasher", () => {
    it("should verify a hash against its own password and not against another", async () => {
        const hasher = new BcryptPasswordHasher();

        const hash = await hasher.hash(PASSWORD);

        expect(await hasher.compare(PASSWORD, hash)).toBe(true);
        expect(await hasher.compare("another password", hash)).toBe(false);
    });

    // an unknown login is compared against the decoy, so it must cost as much as a real hash
    it("should hash at the same cost as the login timing decoy", async () => {
        const hasher = new BcryptPasswordHasher();

        const hash = await hasher.hash(PASSWORD);

        expect(costOf(LOGIN_TIMING_DECOY_HASH)).toBe(costOf(hash));
        expect(await hasher.compare(PASSWORD, LOGIN_TIMING_DECOY_HASH)).toBe(
            false,
        );
    });
});
