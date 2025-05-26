/**
 * Helper function to copy text to the clipboard using the Clipboard API.
 * This function exclusively uses the `navigator.clipboard` API and checks
 * for its availability and secure context (HTTPS or localhost) before attempting to copy.
 * It returns an `Error` object if the API is unavailable, the context is not secure,
 * or if the copy operation fails. If successful, it returns `undefined`.
 *
 * ---
 *
 * Clipboard API를 사용하여 텍스트를 클립보드에 복사하는 헬퍼 함수입니다.
 * 이 함수는 `navigator.clipboard` API만 사용하며, 복사를 시도하기 전에
 * API 사용 가능 여부 및 보안 컨텍스트(HTTPS 또는 localhost)를 확인합니다.
 * API를 사용할 수 없거나, 컨텍스트가 안전하지 않거나, 복사 작업에 실패하면 `Error` 객체를 반환합니다.
 * 성공적으로 완료되면 `undefined`를 반환합니다.
 *
 * @param {string} text - The string of text to be copied to the clipboard.
 *                      ---
 *                      클립보드에 복사할 텍스트 문자열입니다.
 * @returns {Promise<undefined | Error>} A promise that resolves with `undefined` if the text was successfully copied,
 *                                       or an `Error` object if the operation failed.
 *                                       ---
 *                                       텍스트가 성공적으로 복사되었으면 `undefined`로 확인되고,
 *                                       그렇지 않으면 실패 이유를 담은 `Error` 객체로 확인되는 프로미스입니다.
 */
export async function copyTextToClipboard(
	text: string,
): Promise<undefined | Error> {
	// Check if the Clipboard API is available and the page is in a secure context.
	//
	// ---
	//
	// Clipboard API 사용 가능 여부 및 페이지가 보안 컨텍스트에 있는지 확인합니다.
	if (!navigator.clipboard || !window.isSecureContext) {
		const errorMsg =
			"Clipboard API is not available or the page is not in a secure context. URL cannot be copied.";
		console.warn(errorMsg);
		return new Error(errorMsg);
	}

	try {
		await navigator.clipboard.writeText(text);
		return; // 성공 시 undefined 반환
	} catch (err) {
		const errorMsg = `Failed to copy text using Clipboard API: ${
			err instanceof Error ? err.message : String(err)
		}`;
		console.error(errorMsg);
		return new Error(errorMsg);
	}
}
