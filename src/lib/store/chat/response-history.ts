// TODO: response history는 최대 몇 개까지 저장해야할까?
// TODO: .env에서 지정할 수 있도록 하자.
// TODO: 최대 데이터 개수를 초과하면 가장 오래된 데이터를 지우도록 하자.

/**
 * Response History Store
 *
 * This store manages an array of ResponseFormat instances that represent
 * the history of API responses received from chat interactions.
 * These responses are typically used for:
 * - Tracking conversation history and API call results
 * - Allowing users to review previous AI-generated responses
 * - Managing response state in the chat interface
 * - Debugging and analyzing API response patterns
 *
 * The store is reactive and will automatically update any components
 * that subscribe to it when the response history changes.
 *
 * ---
 *
 * 응답 기록을 관리하는 스토어입니다.
 * 채팅 상호작용에서 받은 API 응답들의 기록을 ResponseFormat 인스턴스 배열로 저장하며,
 * 대화 기록 추적, 이전 AI 응답 검토, 채팅 인터페이스의 응답 상태 관리 등의 용도로 사용됩니다.
 */

import type { ResponseFormat } from "$lib/core";
import { writable } from "svelte/store";

/**
 * Writable store containing an array of ResponseFormat instances
 * representing the history of API responses from chat interactions
 *
 * @example
 * ```typescript
 * // Subscribe to changes
 * responseHistory.subscribe(history => {
 *   console.log('Response history length:', history.length);
 * });
 *
 * // Add a new response to history
 * responseHistory.update(current => [...current, newResponse]);
 *
 * // Clear history
 * responseHistory.set([]);
 * ```
 *
 * ---
 *
 * 채팅 상호작용에서 받은 API 응답들의 기록을 담고 있는 반응형 스토어
 */
export const responseHistory = writable<ResponseFormat[]>([]);
