<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import { twMerge } from 'tailwind-merge';
	import type { ClassValue } from 'svelte/elements';

	const { class: className } = $props<{ class?: ClassValue }>();

	// 활성 탭 상태 관리
	// biome-ignore lint/style/useConst: Svelte5 문법 때문에 사용
	let activeTab = $state<'chat' | 'edit'>('chat');
</script>

<!-- 
=== CUSTOM TAB COMPONENT - FLEXBOX LAYOUT ===

DaisyUI의 기본 탭 구조 대신 완전한 커스텀 Flexbox 레이아웃을 사용합니다.
이를 통해 CSS Grid와의 호환성 문제를 해결하고 정확한 높이 계산을 보장합니다.

🎯 LAYOUT OBJECTIVES (레이아웃 목표):
1. 부모 컨테이너의 전체 높이 활용 (뷰포트 초과 방지)
2. 탭 버튼 영역: 고정 높이 (auto)
3. 탭 콘텐츠 영역: 남은 공간 모두 차지 (flex-1)
4. 스크롤은 각 탭 콘텐츠 내부에서만 발생

📐 HEIGHT CALCULATION FLOW (높이 계산 흐름):
h-screen (100vh)
├── Header (auto height)
└── Main Grid (1fr = 남은 높이)
    └── Right Panel (Grid item = 부모 높이 상속)
        └── TabbedView (h-full = 부모 높이 100%)
            ├── Tab Buttons (flex-shrink-0 = 고정)
            └── Tab Content (flex-1 = 남은 공간)

🔑 KEY CSS PRINCIPLES (핵심 CSS 원칙):
- Flexbox: 명시적 높이 계산 가능
- flex-1: 사용 가능한 공간을 모두 차지
- min-height: 0: Flexbox 아이템 축소 허용
- 절대적 높이 대신 상대적 공간 분배 사용

=== END SECTION ===
-->
<div class={twMerge('bg-base-100 flex h-full flex-col', className)}>
	<!-- Tab Navigation - Enhanced DaisyUI tabs-boxed style -->
	<!-- 탭 네비게이션 - 향상된 DaisyUI tabs-boxed 스타일 -->
	<div class="tabs tabs-boxed bg-base-200 flex-shrink-0 gap-2 p-2">
		<button
			type="button"
			class="tab flex-1 rounded-lg font-medium transition-all duration-300 {activeTab === 'chat'
				? 'bg-primary text-primary-content scale-105 border-0 shadow-lg'
				: 'text-base-content/60 hover:text-base-content hover:bg-base-300/70 hover:scale-102 hover:shadow-md'}"
			onclick={() => (activeTab = 'chat')}
		>
			💬 Chat
		</button>
		<button
			type="button"
			class="tab flex-1 rounded-lg font-medium transition-all duration-300 {activeTab === 'edit'
				? 'bg-primary text-primary-content scale-105 border-0 shadow-lg'
				: 'text-base-content/60 hover:text-base-content hover:bg-base-300/70 hover:scale-102 hover:shadow-md'}"
			onclick={() => (activeTab = 'edit')}
		>
			✏️ Edit
		</button>
	</div>

	<!-- Tab Content - Takes all remaining height -->
	<!-- 탭 콘텐츠 - 남은 높이를 모두 차지 -->
	<div class="bg-base-100 min-h-0 flex-1">
		{#if activeTab === 'chat'}
			<Chat />
		{:else if activeTab === 'edit'}
			<div class="bg-base-100 h-full p-4">
				<!-- TODO: Edit 탭의 실제 내용을 여기에 추가하세요. -->
				<div class="card bg-base-200 border-base-300 border shadow-sm">
					<div class="card-body">
						<h2 class="card-title text-base-content flex items-center gap-2">
							<span class="text-lg">✏️</span>
							Edit 기능
						</h2>
						<p class="text-base-content/70">
							Edit 탭 내용입니다. 여기에 에디터 또는 다른 컴포넌트를 추가할 수 있습니다.
						</p>
						<div class="card-actions mt-4 justify-end">
							<button class="btn btn-primary btn-sm"> 기능 추가 예정 </button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
