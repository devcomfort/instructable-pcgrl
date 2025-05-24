<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	const {
		placeholder = 'Type your message...',
		disabled = false,
		maxHeight = '200px',
		showMicrophone = true,
		initialMessages = [],
		class: className
	} = $props<{
		placeholder?: string;
		disabled?: boolean;
		maxHeight?: string;
		showMicrophone?: boolean;
		initialMessages?: Array<{ id: string; text: string; timestamp: Date; isUser: boolean }>;
		class?: ClassValue;
	}>();

	// State management
	// 상태 관리
	let messageInput: string = $state('');
	let textareaElement: HTMLTextAreaElement;
	let isRecording: boolean = $state(false);

	// Message history for chat display
	// 채팅 표시를 위한 메시지 히스토리
	const messages: Array<{ id: string; text: string; timestamp: Date; isUser: boolean }> = $state([
		...initialMessages
	]);

	/**
	 * Handle sending a message
	 * Validates input, adds to message history, and clears the input
	 *
	 * ---
	 *
	 * 메시지 전송 처리
	 * 입력 검증, 메시지 히스토리 추가, 입력창 초기화
	 */
	function handleSendMessage() {
		const trimmedMessage = messageInput.trim();
		if (trimmedMessage && !disabled) {
			// Add user message to history
			// 사용자 메시지를 히스토리에 추가
			messages.push({
				id: crypto.randomUUID(),
				text: trimmedMessage,
				timestamp: new Date(),
				isUser: true
			});

			// Clear input and reset textarea height
			// 입력창 초기화 및 textarea 높이 리셋
			messageInput = '';
			resetTextareaHeight();

			// TODO: Integrate with chat API or backend service
			// TODO: 채팅 API 또는 백엔드 서비스와 연동
		}
	}

	/**
	 * Handle voice recording toggle
	 * Placeholder for future voice input functionality
	 *
	 * ---
	 *
	 * 음성 녹음 토글 처리
	 * 향후 음성 입력 기능을 위한 플레이스홀더
	 */
	function handleMicrophoneToggle() {
		isRecording = !isRecording;

		// TODO: Implement speech recognition API integration
		// TODO: 음성 인식 API 연동 구현
		if (isRecording) {
			console.log('[Chat] Starting voice recording...');
			// Future: Start speech recognition
			// 향후: 음성 인식 시작
		} else {
			console.log('[Chat] Stopping voice recording...');
			// Future: Stop speech recognition and process result
			// 향후: 음성 인식 중지 및 결과 처리
		}
	}

	/**
	 * Handle keyboard events in textarea
	 * Send message on Enter (without Shift) and manage textarea height
	 *
	 * ---
	 *
	 * textarea 키보드 이벤트 처리
	 * Enter 키로 메시지 전송 (Shift 없이) 및 textarea 높이 관리
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	}

	/**
	 * Auto-resize textarea based on content
	 * Maintains smooth UX with dynamic height adjustment
	 *
	 * ---
	 *
	 * 내용에 따른 textarea 자동 크기 조정
	 * 동적 높이 조정으로 부드러운 UX 유지
	 */
	function handleInput() {
		if (textareaElement) {
			// Reset height to calculate new height
			// 새 높이 계산을 위해 높이 리셋
			textareaElement.style.height = 'auto';

			// Set new height based on scroll height, with max limit
			// 스크롤 높이 기준 새 높이 설정, 최대 제한 포함
			const newHeight = Math.min(textareaElement.scrollHeight, Number.parseInt(maxHeight));
			textareaElement.style.height = `${newHeight}px`;
		}
	}

	/**
	 * Reset textarea height to default
	 * Used after sending message to maintain consistent appearance
	 *
	 * ---
	 *
	 * textarea 높이를 기본값으로 리셋
	 * 메시지 전송 후 일관된 외관 유지를 위해 사용
	 */
	function resetTextareaHeight() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
		}
	}

	/**
	 * Format timestamp for message display
	 * Returns human-readable time format
	 *
	 * ---
	 *
	 * 메시지 표시용 타임스탬프 포맷
	 * 인간이 읽기 쉬운 시간 형식 반환
	 */
	function formatTimestamp(timestamp: Date): string {
		return timestamp.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- 
Chat component with modern UI design matching project style
Includes message history display and input area with voice recording capability
Input area features auto-resizing textarea and microphone toggle button

---

프로젝트 스타일에 맞는 현대적 UI 디자인의 채팅 컴포넌트
메시지 히스토리 표시 및 음성 녹음 기능이 있는 입력 영역 포함
입력 영역은 자동 크기 조정 textarea와 마이크 토글 버튼 제공
-->
<div
	class={twMerge(
		'flex h-full flex-col rounded-lg border border-gray-300 bg-white shadow-sm',
		className
	)}
>
	<!-- Message History Area -->
	<!-- 메시지 히스토리 영역 -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if messages.length === 0}
			<!-- Empty state message -->
			<!-- 빈 상태 메시지 -->
			<div class="flex h-full items-center justify-center text-gray-500">
				<div class="text-center">
					<p class="text-lg font-medium">Start a conversation</p>
					<p class="mt-1 text-sm">Type a message below to begin</p>
				</div>
			</div>
		{:else}
			<!-- Message list -->
			<!-- 메시지 목록 -->
			<div class="space-y-3">
				{#each messages as message (message.id)}
					<div class="flex {message.isUser ? 'justify-end' : 'justify-start'}">
						<div
							class="max-w-[80%] rounded-lg px-3 py-2 {message.isUser
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

	<!-- Input Area -->
	<!-- 입력 영역 -->
	<div class="border-t border-gray-200 bg-gray-50 p-4">
		<div class="flex items-end gap-2">
			<!-- Text Input with Auto-resize -->
			<!-- 자동 크기 조정 텍스트 입력 -->
			<div class="flex-1">
				<textarea
					bind:this={textareaElement}
					bind:value={messageInput}
					{placeholder}
					{disabled}
					rows="1"
					class="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-500"
					style="max-height: {maxHeight};"
					onkeydown={handleKeydown}
					oninput={handleInput}
				></textarea>
			</div>

			<!-- Voice Input Button -->
			<!-- 음성 입력 버튼 -->
			{#if showMicrophone}
				<button
					type="button"
					class="flex items-center justify-center rounded-lg p-3 transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 {isRecording
						? 'bg-red-100 text-red-600 hover:bg-red-200'
						: 'bg-white text-gray-600 shadow'}"
					onclick={handleMicrophoneToggle}
					{disabled}
					aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
					title={isRecording ? 'Stop recording' : 'Start voice input'}
				>
					<Icon iconName="microphone" width={20} height={20} />
				</button>
			{/if}

			<!-- Send Button -->
			<!-- 전송 버튼 -->
			<button
				type="button"
				class="flex items-center justify-center rounded-lg bg-blue-500 p-3 text-white shadow transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
				onclick={handleSendMessage}
				disabled={disabled || !messageInput.trim()}
				aria-label="Send message"
				title="Send message"
			>
				<Icon iconName="send" width={20} height={20} />
			</button>
		</div>

		<!-- Recording Status Indicator -->
		<!-- 녹음 상태 표시기 -->
		{#if isRecording}
			<div class="mt-2 flex items-center gap-2 text-sm text-red-600">
				<div class="h-2 w-2 animate-pulse rounded-full bg-red-600"></div>
				<span>Recording... (Feature coming soon)</span>
			</div>
		{/if}
	</div>
</div>
