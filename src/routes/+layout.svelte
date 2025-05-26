<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import TabbedView from '$lib/components/TabbedView.svelte';
	import '../tailwind.css';
</script>

<!-- 
=== VIEWPORT LAYOUT FOUNDATION - CRITICAL SYSTEM COMPONENT ===

이것은 전체 애플리케이션의 레이아웃 기반 시스템입니다.
수정하기 전에 반드시 다음 내용을 이해하고 진행하세요:

🎯 LAYOUT OBJECTIVES (레이아웃 목표):
1. 스크롤바 없는 전체 뷰포트 활용
2. 헤더 고정, 메인 영역 가변 크기
3. 모든 기기에서 반응형 동작
4. CSS Grid를 통한 정확한 공간 계산

📐 LAYOUT STRUCTURE (레이아웃 구조):
┌─────────────────────────────────────┐ ← h-screen w-screen
│ Header (auto height)                │ ← grid-rows-[auto_1fr]의 auto
├─────────────────────────────────────┤
│ Main Content (remaining space)      │ ← grid-rows-[auto_1fr]의 1fr
│ ┌─────────────┬─────────────────────┐│
│ │ Slot        │ TabbedView          ││ ← grid-cols-[4fr_1fr]
│ │ (+page)     │ (Chat/Edit)         ││
│ │             │                     ││
│ └─────────────┴─────────────────────┘│
└─────────────────────────────────────┘

🔑 KEY CSS CLASSES EXPLANATION (핵심 CSS 클래스 설명):
- h-screen w-screen: 정확한 뷰포트 크기 (100vh, 100vw와 동일하지만 더 정확)
- overflow-hidden: 전체 레이아웃에서 스크롤바 방지
- grid-rows-[auto_1fr]: 헤더는 내용 크기, 나머지는 남은 공간 모두 차지
- grid-cols-[4fr_1fr]: 왼쪽 4/5, 오른쪽 1/5 비율
- min-h-0: Grid/Flex 아이템이 올바르게 축소되도록 허용

⚠️  CRITICAL WARNINGS (중요 경고):
- max-h-* 또는 h-* 절대값 사용 금지 → 뷰포트 오버플로우 발생
- overflow-visible 변경 금지 → 스크롤바 생성
- flex 레이아웃으로 변경 금지 → 정확한 공간 계산 불가
- min-h-0 제거 금지 → flexbox shrinking 문제 발생

🔧 MODIFICATION GUIDELINES (수정 가이드라인):
1. 색상, 간격, 테두리 등 → 안전하게 수정 가능
2. 레이아웃 방향 (grid-cols 비율) → 신중하게 수정 가능
3. 높이 관련 클래스 → 수정 전 전체 테스트 필요
4. overflow 설정 → 절대 수정 금지

=== END CRITICAL SECTION ===
-->
<div class="grid h-screen w-screen grid-rows-[auto_1fr] overflow-hidden">
	<!-- Header Section: Fixed height, content-dependent size -->
	<!-- 헤더 영역: 고정 높이, 내용에 따라 크기 결정 -->
	<Header />

	<!-- Main Content Section: Takes all remaining vertical space -->
	<!-- 메인 컨텐츠 영역: 남은 세로 공간을 모두 차지 -->
	<div class="grid min-h-0 grid-cols-[4fr_1fr] gap-2 overflow-hidden p-2">
		<!-- Left Panel: Slot content (4/5 width) -->
		<!-- 왼쪽 패널: 슬롯 컨텐츠 (전체 너비의 4/5) -->
		<div class="min-h-0 overflow-hidden">
			<slot />
		</div>

		<!-- Right Panel: TabbedView (1/5 width) -->
		<!-- 오른쪽 패널: 탭 뷰 (전체 너비의 1/5) -->
		<div class="min-h-0 overflow-hidden">
			<TabbedView />
		</div>
	</div>
</div>
