import { createHashStore } from 'svelte-hash'
import { get, type Writable } from 'svelte/store'

import type { GridMap } from '$lib/core'
import { defaultMapState } from './default-map-state'

/**
 * @store mapState
 * @description A Svelte store that manages the current state of the game map, 
 * synchronized with the URL hash. GridMap data is stored as a JSON string under the key 'map' in the hash.
 * This store wraps a hash-based store to directly expose `GridMap` data, 
 * abstracting the internal structure `{ map: string }` used by `createHashStore`.
 * It allows the map state to be persisted and shared via URL hash parameters.
 *
 * The store is initialized with `defaultMapState` if no valid map is found in the URL hash
 * or if parsing the JSON string (from the 'map' key) fails, providing a clean empty map 
 * based on the current map size configuration.
 *
 * Key Features:
 * - URL synchronization: Map state is automatically synced with the browser URL hash (e.g., #map=...).
 * - Persistence: Map state survives page refreshes and can be shared via URL.
 * - Type safety: Strongly typed as `Writable<GridMap>` for compile-time validation 
 *   and direct `GridMap` manipulation.
 * - Abstraction: Provides a direct `GridMap` interface, hiding the underlying 
 *   `{ map: string }` structure of the hash store.
 * - Robust Parsing: Includes error handling for JSON parsing.
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
 * // Updating the map state (also updates URL hash with JSON stringified map under the 'map' key)
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
 * GridMap 데이터는 해시의 'map' 키 아래에 JSON 문자열로 저장됩니다.
 * 이 스토어는 해시 기반 스토어를 래핑하여 `GridMap` 데이터를 직접 노출하며, 
 * `createHashStore`에서 사용하는 내부 구조인 `{ map: string }`을 추상화합니다.
 * 이를 통해 맵 상태를 URL 해시 매개변수를 통해 지속하고 공유할 수 있습니다.
 *
 * URL 해시에 유효한 맵이 없거나 'map' 키의 JSON 문자열 파싱에 실패하는 경우 스토어는 현재 
 * 맵 크기 구성에 따라 깨끗한 빈 맵을 제공하는 `defaultMapState`로 초기화됩니다.
 *
 * 주요 기능:
 * - URL 동기화: 맵 상태가 브라우저 URL 해시와 자동으로 동기화됩니다 (예: #map=...).
 * - 지속성: 맵 상태가 페이지 새로고침에도 유지되며 URL을 통해 공유 가능합니다.
 * - 타입 안전성: 컴파일 타임 검증 및 직접적인 `GridMap` 조작을 위해 `Writable<GridMap>`으로 
 *   강타입 지정되었습니다.
 * - 추상화: 해시 스토어의 기본 `{ map: string }` 구조를 숨기고 직접적인 `GridMap` 
 *   인터페이스를 제공합니다.
 * - 강력한 파싱: JSON 파싱에 대한 오류 처리를 포함합니다.
 * - 통합성: `Writable<GridMap>`을 기대하는 다른 맵 관련 스토어 및 컴포넌트와 원활하게 연동됩니다.
 */
const internalHashStore = createHashStore<{ map: string | undefined }>();

export const mapState: Writable<GridMap> = {
    subscribe: (run, invalidate) => {
        const unsubscribe = internalHashStore.subscribe(value => {
            let currentMap: GridMap;
            if (value?.map) {
                try {
                    currentMap = JSON.parse(value.map);
                } catch (e) {
                    console.error('[mapState] Failed to parse "map" from hash, using defaultMapState:', e);
                    currentMap = get(defaultMapState);
                }
            } else {
                currentMap = get(defaultMapState);
            }
            run(currentMap);
        }, invalidate);
        return unsubscribe;
    },
    set: (gridMapValue: GridMap) => {
        try {
            const mapJsonString = JSON.stringify(gridMapValue);
            internalHashStore.set({ map: mapJsonString });
        } catch (e) {
            console.error('[mapState] Failed to stringify GridMap for hash store:', e);
        }
    },
    update: (updater: (value: GridMap) => GridMap) => {
        internalHashStore.update(currentHashContainer => {
            let currentMap: GridMap;
            if (currentHashContainer?.map) {
                try {
                    currentMap = JSON.parse(currentHashContainer.map);
                } catch (e) {
                    console.error('[mapState] Failed to parse "map" for update, using defaultMapState:', e);
                    currentMap = get(defaultMapState);
                }
            } else {
                currentMap = get(defaultMapState);
            }

            const newMap = updater(currentMap);

            try {
                const newMapJsonString = JSON.stringify(newMap);
                return { map: newMapJsonString };
            } catch (e) {
                console.error('[mapState] Failed to stringify updated GridMap for hash store:', e);
                return currentHashContainer;
            }
        });
    }
};
