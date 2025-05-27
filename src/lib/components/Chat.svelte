<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { instructions } from '$lib/store/preset/instructions';
	import { requestInference, type RequestFormat, type ResponseFormat } from '$lib/core/inference';
	import { tick } from 'svelte';
	import { numberOfStep } from '$lib/store/editor/number-of-step';
	import { mapState } from '$lib/store/editor/map-state';
	import { responseHistory } from '$lib/store/chat/response-history';

	const {
		placeholder = 'Type your message...',
		disabled = false,
		maxHeight = '200px',
		showMicrophone = true,
		initialMessages = [],
		class: className,
		systemMode = false
	} = $props<{
		placeholder?: string;
		disabled?: boolean;
		maxHeight?: string;
		showMicrophone?: boolean;
		initialMessages?: Array<{
			id: string;
			text: string;
			timestamp: Date;
			isUser: boolean;
		}>;
		class?: ClassValue;
		/**
		 * If true, removes the visual distinction between user and system messages.
		 * All messages will be left-aligned and use a gray background.
		 *
		 * ---
		 *
		 * If true, removes the visual distinction between user and system messages.
		 * All messages will be left-aligned and use a gray background.
		 */
		systemMode?: boolean;
	}>();

	// State management
	let messageInput: string = $state('');
	let textareaElement: HTMLTextAreaElement;
	let isRecording: boolean = $state(false);
	let suggestedMessages: string[] = $state([]);
	let isLoadingAPI: boolean = $state(false); // API loading state variable

	// Speech Recognition
	let recognition: SpeechRecognition | null = $state(null);
	if (
		typeof window !== 'undefined' &&
		(window.SpeechRecognition || window.webkitSpeechRecognition)
	) {
		const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognitionAPI) {
			recognition = new SpeechRecognitionAPI();
			if (recognition) {
				recognition.continuous = false; // Stop after one recognition session
				recognition.interimResults = true; // Enable interim results
				recognition.lang = 'en-US'; // Set language to US English

				recognition.onresult = (event: SpeechRecognitionEvent) => {
					let interimTranscript = '';
					for (let i = event.resultIndex; i < event.results.length; ++i) {
						if (event.results[i].isFinal) {
							const finalTranscript = event.results[i][0].transcript;
							messageInput = finalTranscript; // Update messageInput with the final result
							handleInput(); // Update textarea height
							isRecording = false; // Stop recording after the final result
							console.log('[Chat] Speech recognition final result:', finalTranscript);
							// If needed, call the message sending logic directly here
							// handleSendMessage();
						} else {
							interimTranscript += event.results[i][0].transcript;
						}
					}
					// Display interim results in messageInput for a preview effect
					if (interimTranscript && !event.results[event.results.length - 1].isFinal) {
						messageInput = interimTranscript;
						handleInput();
						console.info('[Chat] Speech recognition interim result:', interimTranscript); // Log interim result
					}
				};

				recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
					console.error('[Chat] Speech recognition error:', event.error, 'Message:', event.message);
					// Optionally, add a message to inform the user about the error
					// e.g.: messages.push({ id: crypto.randomUUID(), text: `Speech recognition error: ${event.error}`, timestamp: new Date(), isUser: false });
					isRecording = false;
				};

				recognition.onend = () => {
					// isRecording state is already handled in onresult (isFinal) or onerror
					// This onend is called on recognition.stop() or when it ends automatically
					if (isRecording) {
						// If stop() was not explicitly called and there was no isFinal result before ending
						isRecording = false;
					}
					console.info('[Chat] Speech recognition service ended.');
				};

				// Additional event logging
				recognition.onaudiostart = () => console.info('[Chat] Audio capture started.');
				recognition.onaudioend = () => console.info('[Chat] Audio capture ended.');
				recognition.onsoundstart = () => console.info('[Chat] Sound detected.');
				recognition.onsoundend = () => console.info('[Chat] Sound stopped being detected.');
				recognition.onspeechstart = () => console.info('[Chat] Speech detected.');
				recognition.onspeechend = () => console.info('[Chat] Speech stopped being detected.');
				recognition.onstart = () => console.info('[Chat] Speech recognition service started.');
			} else {
				console.warn('[Chat] Failed to create SpeechRecognition instance.');
			}
		} else {
			console.warn('[Chat] Speech Recognition API constructor is not available.');
		}
	} else {
		console.warn('[Chat] Speech Recognition API is not supported in this browser.');
		// Handle API not supported: disable microphone button or notify user
	}

	// Message history for chat display
	const messages: Array<{
		id: string;
		text: string;
		timestamp: Date;
		isUser: boolean;
	}> = $state([...initialMessages]);

	/**
	 * Select random suggested messages from instructions
	 * This runs once when the component is initialized.
	 *
	 * ---
	 *
	 * Select random suggested messages from instructions.
	 * This runs once when the component is initialized.
	 */
	$effect(() => {
		const shuffled = [...$instructions].sort(() => 0.5 - Math.random());
		suggestedMessages = shuffled.slice(0, 5);
	});

	/**
	 * Handle clicking on a suggested message
	 * Sets the message input to the suggested text and focuses the textarea.
	 *
	 * ---
	 *
	 * Handle clicking on a suggested message.
	 * Sets the message input to the suggested text and focuses the textarea.
	 */
	async function handleSuggestedMessageClick(suggestion: string) {
		messageInput = suggestion;
		await tick(); // Wait for DOM to update with the new messageInput value

		if (textareaElement) {
			textareaElement.focus();
			// Trigger input event manually to update textarea height
			handleInput(); // Now handleInput will use the updated textarea value
		}
	}

	/**
	 * Handle sending a message
	 * Validates input, adds to message history, and clears the input.
	 * Also handles API call and response.
	 *
	 * ---
	 *
	 * Handle sending a message.
	 * Validates input, adds to message history, and clears the input.
	 * Also handles API call and response.
	 */
	async function handleSendMessage() {
		const trimmedMessage = messageInput.trim();
		if (trimmedMessage && !disabled && !isLoadingAPI) {
			// Add user message to history
			messages.push({
				id: crypto.randomUUID(),
				text: trimmedMessage,
				timestamp: new Date(),
				isUser: true
			});

			isLoadingAPI = true;

			try {
				// 요청 데이터 생성
				const requestPayload: RequestFormat = {
					current_level: $mapState, // Use mapState store value
					step_count: $numberOfStep, // Use numberOfStep store value
					instruction: trimmedMessage
				};

				const startTime = performance.now(); // Record inference start time
				const response: ResponseFormat = await requestInference(requestPayload);
				const endTime = performance.now(); // Record inference end time
				const inferenceTimeSeconds = ((endTime - startTime) / 1000).toFixed(3); // Convert to seconds and format to 3 decimal places

				// Add AI response message from response.response
				const aiResponseMessage = response?.response; // Use optional chaining for safety
				if (aiResponseMessage) {
					messages.push({
						id: crypto.randomUUID(),
						text: aiResponseMessage, // Use the potentially undefined value
						timestamp: new Date(),
						isUser: false
					});
				} else {
					// Fallback message if response.response is not available or undefined
					messages.push({
						id: crypto.randomUUID(),
						text: `AI has generated the map. (Inference time: ${inferenceTimeSeconds}s - No specific message returned)`,
						timestamp: new Date(),
						isUser: false
					});
				}

				// Update responseHistory with the new response
				responseHistory.update((history) => [...history, response]);
				console.log('[Chat] responseHistory updated with new AI response');
			} catch (error) {
				console.error('[Chat] API request failed:', error);
				let errorMessage = 'An error occurred during the API request.';
				if (error instanceof Error) {
					errorMessage = error.message;
				}
				messages.push({
					id: crypto.randomUUID(),
					text: `Error: ${errorMessage}`,
					timestamp: new Date(),
					isUser: false
				});
			} finally {
				isLoadingAPI = false;
			}

			// TODO: Integrate with chat API or backend service
		}
	}

	/**
	 * Handle voice recording toggle
	 * Placeholder for future voice input functionality.
	 *
	 * ---
	 *
	 * Handle voice recording toggle.
	 * Placeholder for future voice input functionality.
	 */
	function handleMicrophoneToggle() {
		if (!recognition) {
			console.warn('[Chat] Speech Recognition is not initialized or not supported.');
			// Optionally, display a message to the user that API is not supported
			// e.g.: messages.push({ id: crypto.randomUUID(), text: 'Voice input is not supported in this browser.', timestamp: new Date(), isUser: false });
			return;
		}

		if (isRecording) {
			recognition.stop();
			// isRecording will be set to false by the onend or onresult (isFinal) or onerror event handlers
			console.log('[Chat] Stopping voice recording manually...');
		} else {
			try {
				recognition.start();
				// isRecording will be set to true by the onstart event handler,
				// but we set it here preemptively for UI responsiveness.
				isRecording = true;
				console.log('[Chat] Starting voice recording...');
			} catch (error) {
				console.error('[Chat] Error starting speech recognition:', error);
				isRecording = false;
				// Optionally, add a message to inform the user about the error
			}
		}
	}

	/**
	 * Handle keyboard events in textarea
	 * Send message on Enter (without Shift) and manage textarea height.
	 *
	 * ---
	 *
	 * Handle keyboard events in textarea.
	 * Send message on Enter (without Shift) and manage textarea height.
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	}

	/**
	 * Auto-resize textarea based on content
	 * Maintains smooth UX with dynamic height adjustment.
	 *
	 * ---
	 *
	 * Auto-resize textarea based on content.
	 * Maintains smooth UX with dynamic height adjustment.
	 */
	function handleInput() {
		if (textareaElement) {
			// Reset height to calculate new height
			textareaElement.style.height = 'auto';

			// Set new height based on scroll height, with max limit
			const newHeight = Math.min(textareaElement.scrollHeight, Number.parseInt(maxHeight));
			textareaElement.style.height = `${newHeight}px`;
		}
	}

	/**
	 * Format timestamp for message display
	 * Returns human-readable time format.
	 *
	 * ---
	 *
	 * Format timestamp for message display.
	 * Returns human-readable time format.
	 */
	function formatTimestamp(timestamp: Date): string {
		return timestamp.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- 
=== CHAT COMPONENT - VERTICAL FLEX LAYOUT ===

이 컴포넌트는 TabbedView 내부에서 전체 높이를 차지하며
메시지 히스토리와 입력 영역을 세로로 분할 표시합니다.

🎯 COMPONENT OBJECTIVES (컴포넌트 목표):
1. 탭 영역의 전체 높이 활용
2. 메시지 영역에서만 스크롤 허용
3. 입력 영역은 항상 하단 고정
4. 텍스트에어리어 자동 크기 조절

📐 LAYOUT STRUCTURE (레이아웃 구조):
┌─────────────────────────────────────┐ ← h-full (TabbedView로부터 상속)
│ ┌─────────────────────────────────┐ │
│ │ Message History Area            │ │ ← flex-1 min-h-0 overflow-y-auto
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Message 1                   │ │ │
│ │ │ Message 2                   │ │ │
│ │ │ Message 3                   │ │ │
│ │ │ ...                         │ │ │ ← 스크롤 가능
│ │ │ ↕ SCROLL                    │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Input Area (Fixed)              │ │ ← flex-shrink-0
│ │ - Suggested messages            │ │
│ │ - Textarea + Buttons            │ │
│ │ - Status indicators             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

🔑 KEY FEATURES (주요 기능):
- 메시지 영역: 세로 스크롤, 자동 최신 메시지로 이동
- 제안 메시지: 클릭 시 입력창에 자동 입력
- 텍스트에어리어: 내용에 따라 높이 자동 조절 (최대 200px)
- 음성 입력: 향후 구현 예정 (현재 플레이스홀더)
- API 상태: 로딩 및 오류 상태 표시

⚠️  LAYOUT WARNINGS (레이아웃 경고):
- h-full 제거 시 탭 영역 높이 미활용
- flex-1 제거 시 메시지 영역 크기 문제
- min-h-0 제거 시 flex shrinking 문제
- overflow-hidden 제거 시 스크롤바 누출

🎨 STYLING NOTES (스타일링 노트):
- 시스템 모드: 모든 메시지를 동일한 스타일로 표시
- 사용자/AI 구분: 배경색과 정렬로 시각적 구분
- 반응형: 모바일에서도 적절한 크기와 간격 유지

=== END SECTION ===
-->
<div
	class={twMerge(
		'flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm',
		className
	)}
>
	<!-- Message History Area - Scrollable message display -->
	<!-- 메시지 히스토리 영역 - 스크롤 가능한 메시지 표시 -->
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		{#if messages.length === 0}
			<!-- Empty state message when no messages exist -->
			<!-- 메시지가 없을 때의 빈 상태 표시 -->
			<div class="flex h-full items-center justify-center text-gray-500">
				<div class="text-center">
					<p class="text-lg font-medium">Generate Maps with IPCGRL</p>
					<p class="mt-1 text-sm">Enter your instructions below to create a map.</p>
				</div>
			</div>
		{:else}
			<!-- Message list with automatic scrolling -->
			<!-- 자동 스크롤이 있는 메시지 목록 -->
			<div class="flex flex-col gap-3">
				{#each messages as message (message.id)}
					<div
						class="flex {systemMode
							? 'justify-start'
							: message.isUser
								? 'justify-end'
								: 'justify-start'}"
					>
						<div
							class="rounded-lg px-3 py-2 break-words {systemMode
								? 'bg-gray-100 text-gray-900'
								: message.isUser
									? 'bg-blue-500 text-white'
									: 'bg-gray-100 text-gray-900'}"
						>
							<p class="text-sm">{message.text}</p>
							<p class="mt-1 text-xs opacity-70">
								{formatTimestamp(message.timestamp)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area - Fixed at bottom, never scrolls -->
	<!-- 입력 영역 - 하단 고정, 스크롤되지 않음 -->
	<div class="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
		<!-- Suggested Messages Area - Quick input options -->
		<!-- 제안 메시지 영역 - 빠른 입력 옵션 -->
		{#if suggestedMessages.length > 0 && !disabled}
			<div class="mb-2 flex flex-col items-start gap-2">
				{#each suggestedMessages as suggestion}
					<button
						type="button"
						class="focus:ring-opacity-50 max-w-xs rounded-full bg-gray-200 px-3 py-1 text-left text-xs whitespace-normal text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						onclick={() => handleSuggestedMessageClick(suggestion)}
					>
						{suggestion}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Input Controls - Textarea and buttons -->
		<!-- 입력 컨트롤 - 텍스트에어리어와 버튼들 -->
		<div class="flex items-end gap-2">
			<!-- Auto-resizing textarea container -->
			<!-- 자동 크기 조절 텍스트에어리어 컨테이너 -->
			<div class="flex-1">
				<textarea
					bind:this={textareaElement}
					bind:value={messageInput}
					{placeholder}
					disabled={disabled || isLoadingAPI}
					rows="1"
					class="focus:ring-opacity-50 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
					style="max-height: {maxHeight};"
					onkeydown={handleKeydown}
					oninput={handleInput}
				></textarea>
			</div>

			<!-- Voice Input Button - Future implementation -->
			<!-- 음성 입력 버튼 - 향후 구현 예정 -->
			{#if showMicrophone}
				<button
					type="button"
					class="focus:ring-opacity-50 flex items-center justify-center rounded-lg p-3 transition-all hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {isRecording
						? 'bg-red-100 text-red-600 hover:bg-red-200'
						: 'bg-white text-gray-600 shadow'}"
					onclick={handleMicrophoneToggle}
					disabled={disabled || isLoadingAPI}
					aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
					title={isRecording ? 'Stop recording' : 'Start voice input'}
				>
					<Icon iconName="microphone" width={20} height={20} />
				</button>
			{/if}

			<!-- Send Button - Triggers message submission -->
			<!-- 전송 버튼 - 메시지 전송 트리거 -->
			<button
				type="button"
				class="focus:ring-opacity-50 flex items-center justify-center rounded-lg bg-blue-500 p-3 text-white shadow transition-all hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
				onclick={handleSendMessage}
				disabled={disabled || !messageInput.trim() || isLoadingAPI}
				aria-label="Send message"
				title="Send message"
			>
				<Icon iconName="send" width={20} height={20} />
			</button>
		</div>

		<!-- Status Indicators - API loading and recording states -->
		<!-- 상태 표시기 - API 로딩 및 녹음 상태 -->
		{#if isLoadingAPI}
			<div
				class="mt-2 flex items-center gap-2 text-sm text-blue-600"
				data-testid="loading-indicator"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
				<span>AI is generating...</span>
			</div>
		{:else if isRecording}
			<div
				class="mt-2 flex items-center gap-2 text-sm text-red-600"
				data-testid="recording-indicator"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-red-600"></div>
				<span>{recognition ? 'Recording...' : 'Voice input not available'}</span>
			</div>
		{/if}
	</div>
</div>
