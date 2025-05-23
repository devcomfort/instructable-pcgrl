import { writable } from "svelte/store";

/**
 * @store historyCursor
 * @description A Svelte writable store that holds the index of the current state
 * in the history array. It essentially points to the "present" state in the
 * timeline of changes.
 *
 * The value of the cursor indicates which state in the history is currently active.
 * For example, if `historyCursor` is `N`, then `history[N]` is the current state.
 *
 * Behavior upon adding a new state (e.g., after a user action):
 * 1. Any states in the history array that exist *after* the current `historyCursor`
 *    position are discarded. This happens if "undo" operations were performed
 *    previously, and now a new action branches off from an earlier state,
 *    invalidating the previous "redo" path.
 * 2. The new state is added to the history array at the index that was conceptually
 *    `historyCursor + 1` (relative to the cursor's value *before* this update).
 * 3. The `historyCursor` is then incremented to point to this newly added state.
 *    Thus, the new state becomes the current state, and the history effectively
 *    extends or branches from the previous state.
 *
 * Example:
 * - Suppose the history is `[S0, S1, S2, S3, S4]` and `historyCursor` is `2` (current state is `S2`).
 *   This implies the user undid actions from `S4` back to `S2`. States `S3` and `S4` form a "redo" path.
 * - If a new action creates `S_new`:
 *   - The "redo" path (`S3`, `S4`) is invalidated and effectively discarded.
 *   - `S_new` is placed at index `3` (which is `cursor_before_update + 1`).
 *   - The history array becomes `[S0, S1, S2, S_new]` (or conceptually, if `S3`, `S4` are overwritten).
 *   - `historyCursor` is updated to `3`.
 *
 * The store is initialized to `0`. This typically means that when the application starts
 * or history is reset, the cursor points to the very first state in the history (index 0).
 * The number of states in the active history timeline is `historyCursor + 1`.
 * For instance, if `historyCursor` is `3`, there are `4` active states (`history[0]` to `history[3]`).
 * If a new state is added, `historyCursor` becomes `4`, and there are `5` active states.
 *
 * ---
 *
 * `historyCursor`는 `history` 상태 배열에서 현재 어떤 상태를 가리키고 있는지를 나타내는 인덱스입니다.
 * 이 값은 변경 내역 타임라인에서 "현재" 상태를 가리킵니다.
 *
 * 커서 값은 `history` 배열 내에서 현재 활성화된 상태를 나타냅니다.
 * 예를 들어, `historyCursor`가 `N`이면 `history[N]`이 현재 상태입니다.
 *
 * 새로운 상태가 추가될 때 (예: 사용자 작업 후)의 동작:
 * 1. 현재 `historyCursor` 위치 *이후에* 있는 `history` 배열의 모든 상태는 폐기됩니다.
 *    이는 이전에 "실행 취소" 작업이 수행되었고, 이제 이전 상태에서 새로운 작업이 분기되어
 *    이전의 "다시 실행" 경로가 무효화될 때 발생합니다.
 * 2. 새로운 상태는 (이 업데이트 이전의 커서 값을 기준으로) 개념적으로 `historyCursor + 1`인
 *    인덱스의 `history` 배열에 추가됩니다.
 * 3. 그런 다음 `historyCursor`는 이 새로 추가된 상태를 가리키도록 증가합니다.
 *    따라서 새 상태가 현재 상태가 되고, 히스토리는 이전 상태에서 효과적으로 확장되거나 분기됩니다.
 *
 * 예시:
 * - `history`가 `[S0, S1, S2, S3, S4]`이고 `historyCursor`가 `2` (현재 상태는 `S2`)라고 가정합니다.
 *   이는 사용자가 `S4`에서 `S2`로 작업을 실행 취소했음을 의미합니다. `S3`과 `S4` 상태는 "다시 실행" 경로를 형성합니다.
 * - 새로운 작업으로 `S_new`가 생성되면:
 *   - "다시 실행" 경로(`S3`, `S4`)는 무효화되고 효과적으로 폐기됩니다.
 *   - `S_new`는 인덱스 `3` (업데이트 전 커서 값 + 1)에 배치됩니다.
 *   - `history` 배열은 `[S0, S1, S2, S_new]`가 됩니다 (`S3`, `S4`가 덮어씌워진 것으로 간주).
 *   - `historyCursor`는 `3`으로 업데이트됩니다.
 *
 * 스토어는 `0`으로 초기화됩니다. 이는 일반적으로 애플리케이션이 시작되거나 히스토리가 재설정될 때
 * 커서가 히스토리의 가장 첫 번째 상태(인덱스 0)를 가리킨다는 것을 의미합니다.
 * 활성 히스토리 타임라인의 상태 수는 `historyCursor + 1`입니다.
 * 예를 들어, `historyCursor`가 `3`이면 `history[0]`부터 `history[3]`까지 `4`개의 활성 상태가 있습니다.
 * 새 상태가 추가되면 `historyCursor`는 `4`가 되고 `5`개의 활성 상태가 됩니다.
 */
export const historyCursor = writable(0);
