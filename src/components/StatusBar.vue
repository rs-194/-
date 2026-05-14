<script setup>
import { useGameEngineStore } from '../store/gameEngine'
import { usePlayerStore } from '../store/player'

const engine = useGameEngineStore()
const player = usePlayerStore()
</script>

<template>
  <header class="mobile-status">
    <div class="min-w-0">
      <p class="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200/80">Saint Demon Academy</p>
      <p class="mt-0.5 text-xs text-slate-300">{{ engine.dateLabel }} / {{ engine.timeLabel }} / {{ engine.phase }}</p>
    </div>

    <div class="grid flex-1 grid-cols-3 gap-2">
      <div class="meter-chip">
        <span>体力</span>
        <div class="meter-track"><div class="meter-fill bg-red-500" :style="{ width: `${player.staminaRatio}%` }" /></div>
        <strong>{{ player.stamina }}</strong>
      </div>
      <div class="meter-chip">
        <span>风险</span>
        <div class="meter-track"><div class="meter-fill bg-cyan-300" :style="{ width: `${player.stealthRisk}%` }" /></div>
        <strong>{{ player.stealthRisk }}</strong>
      </div>
      <div class="meter-chip">
        <span>暴露</span>
        <div class="meter-track"><div class="meter-fill bg-fuchsia-300" :style="{ width: `${player.exposure}%` }" /></div>
        <strong>{{ player.exposure }}</strong>
      </div>
    </div>
  </header>
</template>
