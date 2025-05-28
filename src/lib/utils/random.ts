import seedrandom from "seedrandom";

/**
 * Simple Pseudo-Random Number Generator (PRNG)
 * 간단한 유사 난수 생성기
 */

let rng: seedrandom.PRNG = seedrandom(); // Initialize with a default random seed

/**
 * Sets the seed for the PRNG.
 * 유사 난수 생성기의 시드를 설정합니다.
 * @param seed - The seed value. If not provided, uses a random seed.
 */
export function setRandomSeed(seed?: string | number): void {
	if (seed !== undefined) {
		rng = seedrandom(String(seed));
		console.log(`[PRNG] Seed set to: ${seed}`);
	} else {
		rng = seedrandom(); // Re-initialize with a new random seed
		console.log("[PRNG] Seed set to a new random value.");
	}
}

/**
 * Generates the next pseudo-random number between 0 (inclusive) and 1 (exclusive).
 * 0 (포함)과 1 (미포함) 사이의 다음 유사 난수를 생성합니다.
 * @returns A pseudo-random number.
 */
export function nextRandom(): number {
	return rng();
}

// Initialize with a default seed when the module is loaded.
// This ensures that if setRandomSeed is not explicitly called,
// there's still a somewhat random (time-based) seed used.
// seedrandom() called without arguments automatically uses available entropy.
console.log("[PRNG] Initialized with a random seed.");

// It's good practice to allow users to explicitly initialize if they need determinism.
// The initial call to seedrandom() above handles the default case.
// No need to call setRandomSeed() here without a specific seed.
