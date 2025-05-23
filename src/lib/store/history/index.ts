import * as F from "fp-ts/function";
import * as _ from "lodash";
import { assert } from "@toss/assert";

import { get } from "svelte/store";
import type { GridMap } from "$lib/core";

import { gridHistory } from "./history";
import { historyCursor } from "./history-cursor";
import { maxHistoryLength } from "./max-history-length";

/**
 * Utility namespace for managing grid map history state operations.
 *
 * This namespace provides a high-level API for interacting with the history system,
 * abstracting the direct manipulation of individual stores ({@link gridHistory},
 * {@link historyCursor}, {@link maxHistoryLength}) and providing type-safe operations
 * with validation.
 *
 * The GridHistory namespace encapsulates all operations related to:
 * - Reading history state information
 * - Loading checkpoints from history
 * - Appending new states to history with proper branching logic
 * - Managing history capacity and cursor positioning
 *
 * **Design Principles:**
 * - **Immutability**: All operations create new state rather than mutating existing state
 * - **Validation**: All inputs are validated using assertions to ensure data integrity
 * - **Functional Composition**: Uses fp-ts for functional programming patterns
 * - **Type Safety**: Leverages TypeScript for compile-time safety and runtime validation
 *
 * @namespace GridHistory
 * @see {@link gridHistory} - The underlying store containing the history array
 * @see {@link historyCursor} - The store tracking the current position in history
 * @see {@link maxHistoryLength} - The store defining maximum history capacity
 */
export namespace GridHistory {
	// === Getters ===

	/**
	 * Retrieves the current length of the grid history array.
	 *
	 * This function provides a safe way to access the total number of states
	 * currently stored in the history without directly accessing the store.
	 * The length represents the total number of snapshots available for navigation.
	 *
	 * @returns {number} The number of {@link GridMap} states currently stored in history
	 *
	 * @example
	 * ```typescript
	 * const historySize = GridHistory.getHistoryLength();
	 * console.log(`There are ${historySize} states in history`);
	 *
	 * // Use case: Check if history is empty before performing operations
	 * if (GridHistory.getHistoryLength() === 0) {
	 *   console.log("No history available");
	 * }
	 * ```
	 */
	export const getHistoryLength = (): number =>
		F.pipe(gridHistory, get, (history) => history.length);

	/**
	 * Retrieves the current position of the history cursor.
	 *
	 * The cursor indicates which state in the history array is currently active.
	 * This value is used to determine the "present" state in the timeline and
	 * enables undo/redo operations by moving the cursor position.
	 *
	 * @returns {number} The zero-based index of the current state in the history array
	 *
	 * @example
	 * ```typescript
	 * const currentCursor = GridHistory.getHistoryCursor();
	 * const historyLength = GridHistory.getHistoryLength();
	 *
	 * console.log(`Currently at position ${currentCursor} of ${historyLength - 1}`);
	 *
	 * // Check if undo is possible
	 * const canUndo = currentCursor > 0;
	 *
	 * // Check if redo is possible
	 * const canRedo = currentCursor < historyLength - 1;
	 * ```
	 */
	export const getHistoryCursor = (): number => F.pipe(historyCursor, get);

	/**
	 * Sets the history cursor to a specific position.
	 *
	 * Asserts that the cursor is an integer, non-negative, and within the bounds of the history length.
	 *
	 * @param {number} cursor - The new cursor position.
	 * @throws {AssertionError} When cursor is not an integer.
	 * @throws {AssertionError} When cursor is negative.
	 * @throws {AssertionError} When cursor is out of bounds.
	 *
	 * ---
	 *
	 * 히스토리 커서를 특정 위치로 설정합니다.
	 *
	 * 커서가 정수이고, 음수가 아니며, 히스토리 길이 범위 내에 있는지 확인합니다.
	 *
	 * @param {number} cursor - 새로운 커서 위치.
	 * @throws {AssertionError} cursor가 정수가 아닐 때.
	 * @throws {AssertionError} cursor가 음수일 때.
	 * @throws {AssertionError} cursor가 범위를 벗어날 때.
	 */
	export const setHistoryCursor = (cursor: number) => {
		assert(_.isInteger(cursor), "cursor must be an integer");
		assert(cursor >= 0, "cursor must be greater than or equal to 0");
		assert(
			cursor < getHistoryLength(),
			"cursor must be less than the history length",
		);

		historyCursor.set(cursor);
	};

	/**
	 * Checks if an undo operation is possible.
	 * @returns {boolean} True if undo is possible, false otherwise.
	 *
	 * ---
	 *
	 * 실행 취소 작업이 가능한지 확인합니다.
	 * @returns {boolean} 실행 취소가 가능하면 true, 그렇지 않으면 false를 반환합니다.
	 */
	export const canUndo = (): boolean => getHistoryCursor() > 0;

	/**
	 * Checks if a redo operation is possible.
	 * @returns {boolean} True if redo is possible, false otherwise.
	 *
	 * ---
	 *
	 * 다시 실행 작업이 가능한지 확인합니다.
	 * @returns {boolean} 다시 실행이 가능하면 true, 그렇지 않으면 false를 반환합니다.
	 */
	export const canRedo = (): boolean =>
		getHistoryCursor() < getHistoryLength() - 1;

	/**
	 * Moves the history cursor forward one step and returns the state at the new cursor position.
	 *
	 * If a redo operation is not possible (i.e., the cursor is already at the end of the history),
	 * this function returns `undefined`.
	 *
	 * @returns {GridMap | undefined} The {@link GridMap} state at the new cursor position, or `undefined` if redo is not possible.
	 *
	 * ---
	 *
	 * 히스토리 커서를 앞으로 한 단계 이동하고 새 커서 위치의 상태를 반환합니다.
	 *
	 * 만약 다시 실행 작업이 불가능하다면 (즉, 커서가 이미 히스토리의 끝에 있다면),
	 * 이 함수는 `undefined`를 반환합니다.
	 *
	 * @returns {GridMap | undefined} 새 커서 위치의 {@link GridMap} 상태 또는 다시 실행이 불가능한 경우 `undefined`.
	 */
	export const redo = (): GridMap | undefined => {
		if (canRedo()) {
			const newCursor = getHistoryCursor() + 1;
			setHistoryCursor(newCursor);
			const history = get(gridHistory);
			return history[newCursor];
		}
		return undefined;
	};

	/**
	 * Moves the history cursor backward one step and returns the state at the new cursor position.
	 *
	 * If an undo operation is not possible (i.e., the cursor is already at the beginning of the history),
	 * this function returns `undefined`.
	 *
	 * @returns {GridMap | undefined} The {@link GridMap} state at the new cursor position, or `undefined` if undo is not possible.
	 *
	 * ---
	 *
	 * 히스토리 커서를 뒤로 한 단계 이동하고 새 커서 위치의 상태를 반환합니다.
	 *
	 * 만약 실행 취소 작업이 불가능하다면 (즉, 커서가 이미 히스토리의 시작에 있다면),
	 * 이 함수는 `undefined`를 반환합니다.
	 *
	 * @returns {GridMap | undefined} 새 커서 위치의 {@link GridMap} 상태 또는 실행 취소가 불가능한 경우 `undefined`.
	 */
	export const undo = (): GridMap | undefined => {
		if (canUndo()) {
			const newCursor = getHistoryCursor() - 1;
			setHistoryCursor(newCursor);
			const history = get(gridHistory);
			return history[newCursor];
		}
		return undefined;
	};

	/**
	 * Retrieves the maximum allowed length for the history array.
	 *
	 * This value determines how many states can be stored before older states
	 * are discarded. It provides a memory management mechanism to prevent
	 * unlimited growth of the history array.
	 *
	 * @returns {number} The maximum number of states that can be stored in history
	 *
	 * @example
	 * ```typescript
	 * const maxLength = GridHistory.getMaxHistoryLength();
	 * const currentLength = GridHistory.getHistoryLength();
	 *
	 * console.log(`History: ${currentLength}/${maxLength} states used`);
	 *
	 * // Check if history is near capacity
	 * if (currentLength >= maxLength * 0.9) {
	 *   console.warn("History is nearing capacity");
	 * }
	 * ```
	 */
	export const getMaxHistoryLength = (): number =>
		F.pipe(maxHistoryLength, get);

	/**
	 * Loads a specific checkpoint from history by truncating the history at the given cursor position.
	 *
	 * This function implements the core logic for navigating to a previous state in history.
	 * When called, it removes all states that come after the specified cursor position,
	 * effectively "traveling back in time" to that checkpoint and discarding any future states.
	 *
	 * This operation is typically used for undo functionality where the user wants to
	 * revert to a previous state and discard subsequent changes.
	 *
	 * @param {number} cursor - The zero-based index of the checkpoint to load.
	 *                         Must be a non-negative integer less than the current history length.
	 *
	 * @throws {AssertionError} When cursor is not an integer
	 * @throws {AssertionError} When cursor is negative
	 * @throws {AssertionError} When cursor is greater than or equal to history length
	 *
	 * @example
	 * ```typescript
	 * // Load a checkpoint at position 2, discarding states at positions 3 and beyond
	 * GridHistory.loadCheckpoint(2);
	 *
	 * // Use case: Implementing undo functionality
	 * function undo() {
	 *   const currentCursor = GridHistory.getHistoryCursor();
	 *   if (currentCursor > 0) {
	 *     GridHistory.loadCheckpoint(currentCursor - 1);
	 *     historyCursor.set(currentCursor - 1);
	 *   }
	 * }
	 *
	 * // Use case: Jump to a specific point in history
	 * function jumpToState(targetIndex: number) {
	 *   const historyLength = GridHistory.getHistoryLength();
	 *   if (targetIndex >= 0 && targetIndex < historyLength) {
	 *     GridHistory.loadCheckpoint(targetIndex);
	 *     historyCursor.set(targetIndex);
	 *   }
	 * }
	 * ```
	 */
	export function loadCheckpoint(cursor: number) {
		assert(_.isInteger(cursor), "cursor must be an integer");
		assert(cursor >= 0, "cursor must be greater than or equal to 0");
		assert(
			cursor < getHistoryLength(),
			"cursor must be less than the history length",
		);

		const history = get(gridHistory);
		const checkpoint = history[cursor];

		if (checkpoint) {
			gridHistory.set(history.slice(0, cursor + 1));
		}
	}

	// === Updaters ===

	/**
	 * Appends a new state to the history array, implementing proper branching logic and intelligent capacity management.
	 *
	 * This function serves as the primary entry point for adding new {@link GridMap} states to the history
	 * system. It handles multiple complex scenarios including timeline branching, memory management, and
	 * maintaining history integrity through a two-phase operation:
	 *
	 * **Phase 1 - Branching Logic:**
	 * When a new state is added at a position that's not at the end of the history (i.e., after undo
	 * operations), all states after the current cursor position are automatically discarded. This creates
	 * a new timeline branch, implementing the standard undo/redo behavior where new actions from a
	 * previous state invalidate the existing "redo" path.
	 *
	 * **Phase 2 - Capacity Management:**
	 * After branching, the function enforces maximum history length constraints using a "sliding window"
	 * approach. When the total length exceeds {@link maxHistoryLength}, the oldest states are removed
	 * from the beginning of the array using `Array.slice(-maxLength)`, which efficiently keeps only
	 * the most recent states while maintaining chronological order.
	 *
	 * **Memory Optimization:**
	 * This approach provides O(1) space complexity with respect to time, ensuring that memory usage
	 * remains bounded regardless of how many states are added over the lifetime of the application.
	 * The sliding window technique preserves the most recent and therefore most relevant states.
	 *
	 * **Important Considerations:**
	 * - The cursor is automatically positioned at the newly added state (last position in the array)
	 *   after both branching and capacity management operations complete
	 * - The function retrieves the current maxHistoryLength value dynamically, allowing for runtime
	 *   configuration changes
	 * - All operations (branching, capacity management, cursor positioning) are atomic - either all
	 *   succeed or none are applied
	 *
	 * @param {GridMap} state - The new grid map state to append to history.
	 *                         Must be a valid {@link GridMap} representing a complete game state.
	 * @param {number} cursor - The current cursor position where the new state should be inserted.
	 *                         Must be a non-negative integer less than the current history length.
	 *                         States after this position will be discarded (branching behavior).
	 *
	 * @throws {AssertionError} When cursor is not an integer
	 * @throws {AssertionError} When cursor is negative
	 * @throws {AssertionError} When cursor is greater than or equal to history length
	 *
	 * @example
	 * ```typescript
	 * // Basic usage: Add a new state after the current cursor
	 * const newState: GridMap = [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
	 * const currentCursor = GridHistory.getHistoryCursor();
	 * GridHistory.appendHistory(newState, currentCursor);
	 *
	 * // Complete workflow for adding a new state (cursor automatically managed)
	 * function saveNewState(newGridState: GridMap) {
	 *   const currentCursor = GridHistory.getHistoryCursor();
	 *
	 *   // Append the new state (handles branching, capacity management, and cursor positioning automatically)
	 *   GridHistory.appendHistory(newGridState, currentCursor);
	 *
	 *   // Cursor is now automatically positioned at the newly added state
	 *   const newCursor = GridHistory.getHistoryCursor();
	 *   console.log(`New state added and cursor positioned at ${newCursor}`);
	 * }
	 *
	 * // Example: Timeline branching scenario
	 * // Initial: [State0, State1, State2, State3] with cursor at 1
	 * // Step 1 - Branching: slice(0, 1+1) → [State0, State1]
	 * // Step 2 - Add new state: [...[State0, State1], NewState] → [State0, State1, NewState]
	 * // Result: State2 and State3 are permanently discarded
	 *
	 * // Example: Capacity management with maxHistoryLength = 3
	 * // Before: [State0, State1, State2] (length = 3, at capacity)
	 * // After adding NewState: [State0, State1, State2, NewState] (length = 4, exceeds capacity)
	 * // After slice(-3): [State1, State2, NewState] (State0 removed, length = 3)
	 *
	 * // Example: Combined branching + capacity management
	 * // Initial: [A, B, C, D, E] with cursor at 2, maxLength = 4
	 * // Step 1 - Branch at cursor 2: [A, B, C, NewState] (D, E discarded)
	 * // Step 2 - Capacity check: length 4 <= maxLength 4, no trimming needed
	 * // Final result: [A, B, C, NewState]
	 *
	 * // But if maxLength = 3:
	 * // Step 1 - Branch: [A, B, C, NewState] (length = 4)
	 * // Step 2 - Trim: [B, C, NewState] (A removed, length = 3)
	 * ```
	 *
	 * ---
	 *
	 * 히스토리 배열에 새로운 상태를 추가하는 함수로, 정교한 분기 로직과 지능적인 용량 관리를 구현합니다.
	 *
	 * 이 함수는 히스토리 시스템에 새로운 {@link GridMap} 상태를 추가하는 주요 진입점 역할을 합니다.
	 * 타임라인 분기, 메모리 관리, 히스토리 무결성 유지 등 다양한 복잡한 시나리오를 2단계 작업으로 처리합니다:
	 *
	 * **1단계 - 분기 로직:**
	 * 히스토리의 끝이 아닌 위치(즉, 실행 취소 작업 후)에 새 상태가 추가될 때, 현재 커서 위치 이후의
	 * 모든 상태가 자동으로 삭제됩니다. 이는 새로운 타임라인 분기를 생성하여, 이전 상태에서의
	 * 새로운 동작이 기존의 "다시 실행" 경로를 무효화하는 표준 실행 취소/다시 실행 동작을 구현합니다.
	 *
	 * **2단계 - 용량 관리:**
	 * 분기 처리 후, 함수는 "슬라이딩 윈도우" 방식을 사용하여 최대 히스토리 길이 제약을 적용합니다.
	 * 총 길이가 {@link maxHistoryLength}를 초과하면, `Array.slice(-maxLength)`를 사용하여
	 * 배열의 시작 부분에서 가장 오래된 상태들을 제거하고, 시간순 순서를 유지하면서
	 * 가장 최근의 상태들만 효율적으로 보존합니다.
	 *
	 * **메모리 최적화:**
	 * 이 접근 방식은 시간에 대해 O(1) 공간 복잡도를 제공하여, 애플리케이션 생명주기 동안
	 * 얼마나 많은 상태가 추가되더라도 메모리 사용량이 제한된 범위 내에서 유지됩니다.
	 * 슬라이딩 윈도우 기법은 가장 최근의, 따라서 가장 관련성 높은 상태들을 보존합니다.
	 *
	 * **중요한 고려사항:**
	 * - 분기 및 용량 관리 작업이 완료된 후 커서는 자동으로 새로 추가된 상태(배열의 마지막 위치)로 설정됩니다
	 * - 함수는 현재 maxHistoryLength 값을 동적으로 검색하여 런타임 구성 변경을 허용합니다
	 * - 모든 작업(분기, 용량 관리, 커서 위치 설정)은 원자적입니다 - 모두 성공하거나 모두 적용되지 않습니다
	 *
	 * @param {GridMap} state - 히스토리에 추가할 새로운 그리드 맵 상태입니다.
	 *                         완전한 게임 상태를 나타내는 유효한 {@link GridMap}이어야 합니다.
	 * @param {number} cursor - 새 상태가 삽입될 현재 커서 위치입니다.
	 *                         현재 히스토리 길이보다 작은 음이 아닌 정수여야 합니다.
	 *                         이 위치 이후의 상태들은 삭제됩니다(분기 동작).
	 *
	 * @throws {AssertionError} cursor가 정수가 아닐 때
	 * @throws {AssertionError} cursor가 음수일 때
	 * @throws {AssertionError} cursor가 히스토리 길이보다 크거나 같을 때
	 *
	 * @example
	 * ```typescript
	 * // 기본 사용법: 현재 커서 이후에 새 상태 추가
	 * const newState: GridMap = [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
	 * const currentCursor = GridHistory.getHistoryCursor();
	 * GridHistory.appendHistory(newState, currentCursor);
	 *
	 * // 새 상태 추가의 완전한 워크플로우 (커서 자동 관리)
	 * function saveNewState(newGridState: GridMap) {
	 *   const currentCursor = GridHistory.getHistoryCursor();
	 *
	 *   // 새 상태 추가 (분기, 용량 관리, 커서 위치 설정 자동 처리)
	 *   GridHistory.appendHistory(newGridState, currentCursor);
	 *
	 *   // 커서가 이제 자동으로 새로 추가된 상태에 위치함
	 *   const newCursor = GridHistory.getHistoryCursor();
	 *   console.log(`새 상태가 추가되고 커서가 위치 ${newCursor}에 설정되었습니다`);
	 * }
	 *
	 * // 예시: 타임라인 분기 시나리오
	 * // 초기: [State0, State1, State2, State3], 커서가 1에 위치
	 * // 1단계 - 분기: slice(0, 1+1) → [State0, State1]
	 * // 2단계 - 새 상태 추가: [...[State0, State1], NewState] → [State0, State1, NewState]
	 * // 결과: State2와 State3이 영구적으로 삭제됨
	 *
	 * // 예시: maxHistoryLength = 3인 용량 관리
	 * // 이전: [State0, State1, State2] (길이 = 3, 용량 한계)
	 * // NewState 추가 후: [State0, State1, State2, NewState] (길이 = 4, 용량 초과)
	 * // slice(-3) 후: [State1, State2, NewState] (State0 제거됨, 길이 = 3)
	 *
	 * // 예시: 분기 + 용량 관리 조합
	 * // 초기: [A, B, C, D, E], 커서 2, maxLength = 4
	 * // 1단계 - 커서 2에서 분기: [A, B, C, NewState] (D, E 삭제)
	 * // 2단계 - 용량 확인: 길이 4 <= maxLength 4, 트리밍 불필요
	 * // 최종 결과: [A, B, C, NewState]
	 *
	 * // 하지만 maxLength = 3인 경우:
	 * // 1단계 - 분기: [A, B, C, NewState] (길이 = 4)
	 * // 2단계 - 트리밍: [B, C, NewState] (A 제거됨, 길이 = 3)
	 * ```
	 */
	export function appendHistory(state: GridMap, cursor: number) {
		assert(_.isInteger(cursor), "cursor must be an integer");
		assert(cursor >= 0, "cursor must be greater than or equal to 0");
		assert(
			cursor < getHistoryLength(),
			"cursor must be less than the history length",
		);

		const history = get(gridHistory);
		const maxLength = get(maxHistoryLength);

		// Create new history with branching logic - discard states after cursor and add new state
		let newHistory = [...history.slice(0, cursor + 1), state];

		// Enforce maximum history length by removing oldest states if necessary
		if (newHistory.length > maxLength) {
			newHistory = newHistory.slice(-maxLength);
		}

		// Update history and automatically position cursor at the newly added state
		gridHistory.set(newHistory);
		historyCursor.set(newHistory.length - 1);
	}
}

// Re-export individual stores for direct access
export { gridHistory } from "./history";
export { historyCursor } from "./history-cursor";
export { maxHistoryLength } from "./max-history-length";
