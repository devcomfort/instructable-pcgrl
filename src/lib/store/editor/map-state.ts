import { createHashStore } from 'svelte-hash'
import { get, type Writable } from 'svelte/store'

import type { GridMap } from '$lib/core'
import { defaultMapState } from './default-map-state'

/**
 * @store mapState
 * @description A Svelte store that manages the current state of the game map, 
 * synchronized with the URL hash.
 * This store wraps a hash-based store to directly expose `GridMap` data, 
 * abstracting the internal structure `{ map: GridMap }` used by `createHashStore`.
 * It allows the map state to be persisted and shared via URL hash parameters.
 *
 * The store is initialized with `defaultMapState`, providing a clean empty map 
 * based on the current map size configuration.
 *
 * Key Features:
 * - URL synchronization: Map state is automatically synced with the browser URL hash.
 * - Persistence: Map state survives page refreshes and can be shared via URL.
 * - Type safety: Strongly typed as `Writable<GridMap>` for compile-time validation 
 *   and direct `GridMap` manipulation.
 * - Abstraction: Provides a direct `GridMap` interface, hiding the underlying 
 *   `{ map: GridMap }` structure of the hash store.
 * - Integration: Works seamlessly with other map-related stores and components 
 *   expecting a `Writable<GridMap>`.
 *
 * @type {Writable<GridMap>} A Svelte writable store containing the 2D grid map data.
 *
 * @example
 * ```typescript
 * // Reading the current map state
 * import { mapState } from './map-state'; // Adjust path as needed
 * import { get } from 'svelte/store';
 *
 * const currentMap = get(mapState);
 *
 * // Updating the map state (also updates URL hash)
 * const newMapData: GridMap = [[0, 1], [1, 0]];
 * mapState.set(newMapData);
 *
 * // Subscribing to changes
 * const unsubscribe = mapState.subscribe(map => {
 *   console.log('Map updated:', map);
 * });
 *
 * // Don't forget to unsubscribe when the component is destroyed
 * // unsubscribe();
 * ```
 *
 * ---
 *
 * URL 해시와 동기화되는 게임 맵의 현재 상태를 관리하는 Svelte 스토어입니다.
 * 이 스토어는 해시 기반 스토어를 래핑하여 `GridMap` 데이터를 직접 노출하며, 
 * `createHashStore`에서 사용하는 내부 구조인 `{ map: GridMap }`을 추상화합니다.
 * 이를 통해 맵 상태를 URL 해시 매개변수를 통해 지속하고 공유할 수 있습니다.
 *
 * 스토어는 현재 맵 크기 구성에 따라 깨끗한 빈 맵을 제공하는 `defaultMapState`로 초기화됩니다.
 *
 * 주요 기능:
 * - URL 동기화: 맵 상태가 브라우저 URL 해시와 자동으로 동기화됩니다.
 * - 지속성: 맵 상태가 페이지 새로고침에도 유지되며 URL을 통해 공유 가능합니다.
 * - 타입 안전성: 컴파일 타임 검증 및 직접적인 `GridMap` 조작을 위해 `Writable<GridMap>`으로 
 *   강타입 지정되었습니다.
 * - 추상화: 해시 스토어의 기본 `{ map: GridMap }` 구조를 숨기고 직접적인 `GridMap` 
 *   인터페이스를 제공합니다.
 * - 통합성: `Writable<GridMap>`을 기대하는 다른 맵 관련 스토어 및 컴포넌트와 원활하게 연동됩니다.
 */
const internalHashStore = createHashStore<{ map: GridMap }>({ map: get(defaultMapState) });

export const mapState: Writable<GridMap> = {
    subscribe: (run, invalidate) => {
        // Ensure that `value` is destructured correctly if `run` expects `GridMap`
        // and internalHashStore.subscribe provides `{ map: GridMap }`
        const unsubscribe = internalHashStore.subscribe(value => {
            // Check if value and value.map are defined to prevent runtime errors
            if (value && typeof value.map !== 'undefined') {
                run(value.map);
            } else if (value === undefined || value.map === undefined) {
                // This case might occur if the hash is cleared or malformed.
                // Provide a default or empty state to `run` if appropriate,
                // or ensure `defaultMapState` provides a valid initial `GridMap`.
                // For now, we assume `get(defaultMapState)` is always a valid GridMap.
                run(get(defaultMapState));
            }
        }, invalidate);
        return unsubscribe;
    },
    set: (value: GridMap) => {
        internalHashStore.set({ map: value });
    },
    update: (updater: (value: GridMap) => GridMap) => {
        internalHashStore.update(current => {
            // Ensure current.map is valid before updating
            const currentMap = (current && typeof current.map !== 'undefined') ? current.map : get(defaultMapState);
            return { map: updater(currentMap) };
        });
    }
};
