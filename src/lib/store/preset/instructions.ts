/**
 * Imports the instruction data from a JSON file.
 * The JSON file is expected to contain a predefined set of instructions,
 * likely structured to guide users or define operational steps within the application.
 *
 * ---
 *
 * JSON 파일로부터 명령어 데이터를 가져옵니다.
 * 이 JSON 파일은 애플리케이션 내에서 사용자를 안내하거나 운영 단계를 정의하기 위해
 * 구조화된, 사전에 정의된 명령어 세트를 포함할 것으로 예상됩니다.
 * @type {any} // Replace 'any' with the actual type of Instructions if known
 */
import Instructions from '$lib/assets/instructions.json';
import { readable } from 'svelte/store';

/**
 * A Svelte 5 rune state variable that holds the instruction data.
 * This makes the `Instructions` data reactive, meaning that any component
 * subscribing to this state will automatically update when the data changes.
 * It's a global store for instruction presets.
 *
 * ---
 *
 * 명령어 데이터를 담고 있는 Svelte 5 룬 상태 변수입니다.
 * 이를 통해 `Instructions` 데이터는 반응성을 가지게 되며, 이 상태를 구독하는
 * 모든 컴포넌트는 데이터 변경 시 자동으로 업데이트됩니다.
 * 명령어 프리셋을 위한 전역 스토어입니다.
 */
export const instructions = readable([...Instructions.instructions]);