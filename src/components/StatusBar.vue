<script setup>
import { useGameEngineStore } from '../store/gameEngine'
import { usePlayerStore } from '../store/player'

const engine = useGameEngineStore()
const player = usePlayerStore()
</script>

<template>
  <header class="status-shell">
    <section class="status-card status-card-wide">
      <p class="status-label">时间</p>
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="font-display text-2xl text-parchment sm:text-3xl">{{ engine.timeLabel }}</p>
          <p class="text-xs text-stone-300">{{ engine.dateLabel }} / {{ engine.phase }}</p>
        </div>
        <div class="rounded-full border border-brass/35 bg-brass/10 px-3 py-1 text-xs text-brass">
          倒计时看板
        </div>
      </div>
    </section>

    <section class="status-card">
      <p class="status-label">体力</p>
      <div class="mt-2 flex items-center gap-3">
        <div class="h-3 flex-1 overflow-hidden rounded-full bg-black/35 ring-1 ring-white/10">
          <div class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-brass" :style="{ width: `${player.staminaRatio}%` }" />
        </div>
        <strong class="min-w-14 text-right text-parchment">{{ player.stamina }}/{{ player.maxStamina }}</strong>
      </div>
    </section>

    <section class="status-card">
      <p class="status-label">资金</p>
      <p class="mt-1 font-display text-2xl text-parchment">{{ player.funds }} 银币</p>
    </section>

    <section class="status-card">
      <p class="status-label">潜伏风险</p>
      <div class="mt-1 flex items-baseline justify-between gap-3">
        <p class="font-display text-2xl text-parchment">{{ player.stealthRisk }}%</p>
        <span class="rounded-full border border-red-300/25 bg-red-950/55 px-2 py-1 text-xs text-red-100">
          {{ player.dangerLevel }}
        </span>
      </div>
    </section>
  </header>
</template>
