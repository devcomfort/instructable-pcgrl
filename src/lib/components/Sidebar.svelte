<script lang="ts">
	import { Button } from './Button';
</script>

<div class="flex w-[200px] flex-1 flex-col gap-[10px] border-r border-gray-300 bg-gray-100 p-5">
	<Button iconName="pencil" />
	<Button iconName="bin" />
	<Button iconName="erase" />
	<!-- 
		NOTE: 플레이 모드는 제거함.
		      현재 연구에서 플레이어 타일이 존재하지 않음, 기본 위치를 정할 수 없어서 플레이 모드를 제거함.
	-->
	<!-- <Button iconName="play" /> -->
	<Button iconName="share" />
</div>
