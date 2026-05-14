<script setup>
import { computed, ref } from 'vue'
import ActionPanel from '../components/ActionPanel.vue'
import StatusBar from '../components/StatusBar.vue'
import locations from '../data/location.json'
import { useGameEngineStore } from '../store/gameEngine'
import { usePlayerStore } from '../store/player'

const engine = useGameEngineStore()
const player = usePlayerStore()
const activeLocationId = ref(locations[0].id)

const activeLocation = computed(() => locations.find((location) => location.id === activeLocationId.value) ?? locations[0])

const attributes = computed(() => [
  { label: '体魄', value: player.physique },
  { label: '魅力', value: player.charm },
  { label: '意志', value: player.willpower },
  { label: '暴露', value: `${player.exposure}%` },
])
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-abyss text-stone-100">
    <div class="stage-backdrop" :style="{ backgroundImage: `url(${activeLocation.image})` }" />
    <div class="stage-vignette" />

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
      <StatusBar />

      <section class="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="stage-card">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="section-kicker">Saint Demon Academy</p>
              <h1 class="mt-2 font-display text-4xl text-parchment sm:text-5xl">{{ activeLocation.name }}</h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-stone-300">{{ activeLocation.tagline }}</p>
            </div>

            <dl class="grid grid-cols-4 gap-2 rounded-lg border border-white/10 bg-black/20 p-2 sm:min-w-80">
              <div v-for="item in attributes" :key="item.label" class="rounded-md bg-white/[0.04] p-3 text-center">
                <dt class="text-xs text-stone-400">{{ item.label }}</dt>
                <dd class="mt-1 font-display text-xl text-parchment">{{ item.value }}</dd>
              </div>
            </dl>
          </div>

          <section class="log-screen mt-6">
            <div class="mb-4 flex items-center justify-between gap-4 border-b border-brass/20 pb-3">
              <p class="section-kicker">剧本节点日志</p>
              <p class="text-xs text-stone-400">{{ player.name }}</p>
            </div>
            <TransitionGroup name="log" tag="div" class="space-y-3">
              <p v-for="entry in engine.logEntries" :key="entry" class="log-line">
                {{ entry }}
              </p>
            </TransitionGroup>
          </section>
        </div>

        <ActionPanel :location-id="activeLocationId" @change-location="activeLocationId = $event" />
      </section>
    </div>
  </main>
</template>
