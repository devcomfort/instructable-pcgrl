<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import toast from 'svelte-french-toast';

	// TODO: undo/redo를 시도할 때, 실패한다면 alert 등의 UX를 고려한 방법을 통해 알려줄 수 있으면 좋을 것 같아.

	// 페이지 로드 시 키보드 단축키 설정
	onMount(() => {
		if (typeof window !== 'undefined') {
			// 키보드 단축키 처리
			const handleKeyDown = (event: KeyboardEvent) => {
				// 입력 필드에서는 단축키 무시
				const target = event.target as HTMLElement;
				if (
					target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.isContentEditable
				) {
					return;
				}

				// Ctrl+Z 또는 Cmd+Z (undo)
				if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
					event.preventDefault();
					handleUndo();
				}
				// Ctrl+Y 또는 Cmd+Y 또는 Ctrl+Shift+Z (redo)
				else if (
					((event.ctrlKey || event.metaKey) && event.key === 'y') ||
					((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
				) {
					event.preventDefault();
					handleRedo();
				}
			};

			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	/**
	 * URL 변화를 감지하여 undo/redo 성공 여부를 확인하고 toast를 표시
	 */
	function detectUrlChangeAndToast(operation: 'undo' | 'redo', previousUrl: string) {
		const checkUrlChange = () => {
			const currentUrl = window.location.href;
			if (currentUrl !== previousUrl) {
				// URL이 변경되었으면 성공
				toast.success(operation === 'undo' ? 'Undone successfully.' : 'Redone successfully.');
			} else {
				// URL이 변경되지 않았으면 실패 (더 이상 이동할 히스토리가 없음)
				toast.error(operation === 'undo' ? 'No more states to undo.' : 'No more states to redo.');
			}
		};

		// 약간의 지연을 두고 URL 변화 확인 (브라우저 히스토리 이동 완료 대기)
		setTimeout(checkUrlChange, 100);
	}

	// undo 함수
	function handleUndo() {
		try {
			const previousUrl = window.location.href;
			history.back();
			detectUrlChangeAndToast('undo', previousUrl);
		} catch (e) {
			console.error('Undo 실행 중 오류가 발생했습니다:', e);
			toast.error('Failed to undo.');
		}
	}

	// redo 함수
	function handleRedo() {
		try {
			const previousUrl = window.location.href;
			history.forward();
			detectUrlChangeAndToast('redo', previousUrl);
		} catch (e) {
			console.error('Redo 실행 중 오류가 발생했습니다:', e);
			toast.error('Failed to redo.');
		}
	}
</script>

<!-- 
History component with properly sized icons matching Button component style
Uses custom Icon component instead of direct Iconify for consistent sizing
Implements undo/redo using History API with URL change detection and toast feedback

---

Button 컴포넌트 스타일에 맞는 적절한 크기의 아이콘을 가진 히스토리 컴포넌트
일관된 크기를 위해 직접 Iconify 대신 사용자 정의 Icon 컴포넌트 사용
History API를 사용한 undo/redo 구현과 URL 변화 감지 및 toast 피드백 포함
-->
<div class="flex gap-2 rounded-md bg-gray-100 p-2">
	<button
		class="focus:ring-opacity-50 flex items-center justify-center rounded-lg bg-white p-3 shadow transition-all duration-200 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		onclick={handleUndo}
		aria-label="Undo"
		title="이전 상태로 되돌리기 (Ctrl+Z)"
	>
		<Icon iconName="undo" width={24} height={24} />
	</button>
	<button
		class="focus:ring-opacity-50 flex items-center justify-center rounded-lg bg-white p-3 shadow transition-all duration-200 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		onclick={handleRedo}
		aria-label="Redo"
		title="다음 상태로 이동하기 (Ctrl+Y)"
	>
		<Icon iconName="redo" width={24} height={24} />
	</button>
</div>
