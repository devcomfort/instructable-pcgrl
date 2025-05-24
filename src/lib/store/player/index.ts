/**
 * @module Player Store Module
 * @deprecated This entire module contains deprecated stores that are currently not used in the project.
 * All player-related stores in this module may be removed in future versions.
 * If you need player position management functionality in the future, you can use these implementations
 * as references or restore them from version control.
 * 
 * @description
 * This module exports player-related Svelte stores for managing player state and position
 * within the game map. It provides both the default starting position calculation and
 * the writable store for tracking the player's current position during gameplay.
 * 
 * Exported Stores:
 * - `defaultPlayerPos`: A derived store that calculates the player's default starting position (map center)
 * - `playerPos`: A writable store that manages the player's current position on the game map
 * 
 * Both stores work with the `GridMapShape` type, representing positions as `[row, column]` tuples.
 * The `playerPos` store is initialized with the value from `defaultPlayerPos` to ensure
 * the player starts at the center of the map.
 * 
 * ---
 * 
 * 이 전체 모듈은 현재 프로젝트에서 사용되지 않는 deprecated 스토어들을 포함하고 있습니다.
 * 이 모듈의 모든 플레이어 관련 스토어들은 향후 버전에서 제거될 수 있습니다.
 * 추후 플레이어 위치 관리 기능이 필요하다면 이 구현들을 참고하거나 버전 관리에서 복원하여 사용하세요.
 * 
 * 이 모듈은 게임 맵 내에서 플레이어 상태와 위치를 관리하기 위한 플레이어 관련 Svelte 스토어들을 내보냅니다.
 * 기본 시작 위치 계산과 게임 플레이 중 플레이어의 현재 위치를 추적하는 쓰기 가능 스토어를 모두 제공합니다.
 * 
 * 내보내는 스토어들:
 * - `defaultPlayerPos`: 플레이어의 기본 시작 위치(맵 중앙)를 계산하는 파생 스토어
 * - `playerPos`: 게임 맵에서 플레이어의 현재 위치를 관리하는 쓰기 가능 스토어
 * 
 * 두 스토어 모두 `GridMapShape` 타입과 함께 작동하며, 위치를 `[행, 열]` 튜플로 표현합니다.
 * `playerPos` 스토어는 플레이어가 맵의 중앙에서 시작할 수 있도록 `defaultPlayerPos`의 값으로 초기화됩니다.
 */
export { defaultPlayerPos } from "./default-player-pos";
export { playerPos } from "./player-pos";
