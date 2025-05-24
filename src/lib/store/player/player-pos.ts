import { get, writable } from "svelte/store";
import { defaultPlayerPos } from "./default-player-pos";
import * as F from "fp-ts/function";

/**
 * @store playerPos
 * @deprecated This store is currently not used in the project and may be removed in future versions.
 * If you need to manage the player's position in the future, you can use this implementation
 * as a reference or restore it from version control.
 * @description
 * A Svelte writable store that holds and manages the player's current position
 * on the game map. The position is represented as a `[row: number, column: number]`
 * tuple, which conforms to the `GridMapShape` type.
 *
 * Initialization:
 * The `playerPos` store is initialized with a default starting position. This
 * initial value is sourced from the `defaultPlayerPos` derived Svelte store,
 * which typically calculates the center coordinates of the map.
 *
 * The initialization process uses `fp-ts/function`'s `pipe` utility to compose
 * the following operations:
 * 1. `defaultPlayerPos`: The derived store providing the initial `[row, column]` coordinates.
 * 2. `get`: A Svelte store utility. In this context, it's used to **extract the current value**
 *    (the calculated default position) held within the `defaultPlayerPos` store at the moment
 *    `playerPos` is being created. This provides a snapshot of the default position
 *    to initialize `playerPos`.
 * 3. `writable`: A Svelte store utility that creates the new `playerPos` writable store,
 *    setting its initial state to the value obtained in the previous step.
 *
 * As a result, `playerPos` starts with the map's center coordinates. Its value can be
 * subsequently updated (e.g., via `playerPos.set()`) to reflect the player's
 * movements during gameplay. The type of this store is `Writable<GridMapShape>`.
 *
 * @example
 * // How to read the player's current position:
 * // import { get } from 'svelte/store';
 * // import { playerPos } from './player-pos';
 * // const currentPosition = get(playerPos); // e.g., [5, 10]
 *
 * // How to update the player's position:
 * // playerPos.set([newRow, newColumn]);
 *
 * // How to subscribe to position changes (e.g., in a Svelte component):
 * // playerPos.subscribe(position => {
 * //   console.log("Player's new position:", position);
 * // });
 *
 * @see {@link defaultPlayerPos} - The Svelte derived store providing the initial position.
 * @see {@link ../grid-map/map-shape-type.ts#GridMapShape} - For the definition of the `GridMapShape` type,
 * which dictates the structure of the position data `[row, column]`.
 *
 * ---
 *
 * 현재 프로젝트에서 사용되지 않는 스토어입니다. 추후 플레이어의 위치 관리가 필요하다면
 * 이 구현을 참고하거나 버전 관리에서 복원하여 사용하세요.
 *
 * 게임 맵에서 플레이어의 현재 위치를 저장하고 관리하는 Svelte 쓰기 가능 스토어입니다.
 * 위치는 `GridMapShape` 타입에 부합하는 `[행: number, 열: number]` 튜플로 표현됩니다.
 *
 * 초기화:
 * `playerPos` 스토어는 기본 시작 위치로 초기화됩니다. 이 초기값은
 * 일반적으로 맵의 중앙 좌표를 계산하는 `defaultPlayerPos` 파생 Svelte 스토어에서 가져옵니다.
 *
 * 초기화 과정은 `fp-ts/function`의 `pipe` 유틸리티를 사용하여 다음 작업을 조합합니다:
 * 1. `defaultPlayerPos`: 초기 `[행, 열]` 좌표를 제공하는 파생 스토어입니다.
 * 2. `get`: Svelte 스토어 유틸리티입니다. 여기서는 `playerPos`가 생성되는 순간
 *    `defaultPlayerPos` 스토어 **내부에 저장된 현재 값**(계산된 기본 위치)을 **추출**하는 데 사용됩니다.
 *    이를 통해 `playerPos`를 초기화하기 위한 기본 위치의 스냅샷을 제공합니다.
 * 3. `writable`: 이전 단계에서 얻은 값으로 초기 상태를 설정하여 새로운 `playerPos` 쓰기 가능
 *    스토어를 생성하는 Svelte 스토어 유틸리티입니다.
 *
 * 결과적으로 `playerPos`는 맵의 중앙 좌표로 시작합니다. 이 값은 게임 플레이 중
 * 플레이어의 움직임을 반영하기 위해 이후에 업데이트될 수 있습니다 (예: `playerPos.set()` 사용).
 * 이 스토어의 타입은 `Writable<GridMapShape>`입니다.
 *
 * @example
 * // 플레이어의 현재 위치를 읽는 방법:
 * // import { get } from 'svelte/store';
 * // import { playerPos } from './player-pos';
 * // const currentPosition = get(playerPos); // 예: [5, 10]
 *
 * // 플레이어 위치를 업데이트하는 방법:
 * // playerPos.set([newRow, newColumn]);
 *
 * // 위치 변경을 구독하는 방법 (예: Svelte 컴포넌트에서):
 * // playerPos.subscribe(position => {
 * //   console.log("플레이어의 새 위치:", position);
 * // });
 *
 * @see {@link defaultPlayerPos} - 초기 위치를 제공하는 Svelte 파생 스토어입니다.
 * @see {@link ../grid-map/map-shape-type.ts#GridMapShape} - 위치 데이터 `[행, 열]`의 구조를
 * 정의하는 `GridMapShape` 타입의 정의를 참조하십시오.
 */
export const playerPos = F.pipe(defaultPlayerPos, get, writable);
