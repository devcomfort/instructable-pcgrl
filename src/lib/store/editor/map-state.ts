import { createHashStore } from 'svelte-hash'
import { get } from 'svelte/store'

import type { GridMap } from '$lib/core'
import { defaultMapState } from './default-map-state'

/**
 * @store mapState
 * @description A hash-based Svelte store that manages the current state of the game map.
 * This store uses `createHashStore` to provide URL synchronization capabilities,
 * allowing the map state to be persisted and shared via URL hash parameters.
 * 
 * The store is initialized with the current value from `defaultMapState`,
 * which provides a clean empty map based on the current map size configuration.
 * 
 * Key Features:
 * - URL synchronization: Map state is automatically synced with browser URL hash
 * - Persistence: Map state survives page refreshes and can be shared via URL
 * - Type safety: Strongly typed as `GridMap` for compile-time validation
 * - Integration: Works seamlessly with other map-related stores
 * 
 * @type {HashStore<GridMap>} A hash store containing the 2D grid map data
 * 
 * @example
 * ```typescript
 * // Reading the current map state
 * const currentMap = get(mapState)
 * 
 * // Updating the map state (also updates URL hash)
 * mapState.set(newMapData)
 * 
 * // Subscribing to changes
 * mapState.subscribe(map => {
 *   console.log('Map updated:', map)
 * })
 * ```
 * 
 * ---
 * 
 * 게임 맵의 현재 상태를 관리하는 해시 기반 Svelte 스토어.
 * 이 스토어는 `createHashStore`를 사용하여 URL 동기화 기능을 제공하며,
 * 맵 상태를 URL 해시 매개변수를 통해 지속하고 공유할 수 있게 합니다.
 * 
 * 스토어는 현재 맵 크기 구성을 기반으로 깨끗한 빈 맵을 제공하는
 * `defaultMapState`의 현재 값으로 초기화됩니다.
 * 
 * 주요 기능:
 * - URL 동기화: 맵 상태가 브라우저 URL 해시와 자동으로 동기화
 * - 지속성: 맵 상태가 페이지 새로고침에도 유지되며 URL을 통해 공유 가능
 * - 타입 안전성: 컴파일 타임 검증을 위해 `GridMap`으로 강타입 지정
 * - 통합성: 다른 맵 관련 스토어들과 원활하게 연동
 */
export const mapState = createHashStore<GridMap>(get(defaultMapState))