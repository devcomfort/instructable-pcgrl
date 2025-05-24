/**
 * Numerical representations for tile types in grid maps.
 * Based on Instructed-PCG paper tile definitions.
 *
 * ---
 *
 * 그리드 맵의 타일 타입을 나타내는 숫자 정의.
 * Instructed-PCG 논문의 타일 정의를 기반으로 함.
 *
 * @see {@link https://arxiv.org/html/2503.12358v2}
 */
export const Tileset = {
	/** Represents the border of the map. Typically non-traversable. */
	BORDER: 0,
	/** Represents an empty, traversable tile. */
	EMPTY: 1,
	/** Represents a wall, an obstacle tile. Typically non-traversable. */
	WALL: 2,
	/** Represents a bat, potentially an enemy or a specific game element. */
	BAT: 3,
} as const;

/**
 * Maps tile types to their image file paths.
 * Paths are relative to /static directory.
 *
 * ---
 *
 * 타일 타입을 이미지 파일 경로에 매핑.
 * /static 디렉토리 기준 경로.
 */
export const TileImage: Record<TilesetKey, string> = {
	BORDER: '/solid.png',
	EMPTY: '/empty.png',
	WALL: '/solid.png',
	BAT: '/bat.png',
}

/**
 * Type representing the valid keys for the Tileset object.
 *
 * ---
 *
 * Tileset 객체의 유효한 키 타입.
 */
export type TilesetKey = keyof typeof Tileset;

/**
 * Type representing the possible numerical values in the Tileset object.
 *
 * ---
 *
 * Tileset 객체의 가능한 숫자 값 타입.
 */
export type TilesetValue = (typeof Tileset)[keyof typeof Tileset];
