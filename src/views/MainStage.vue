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

function changeLocation(locationId) {
  activeLocationId.value = locationId
  engine.drawEvent(activeLocation.value, engine.getTimeSnapshot())
}

function resolveEvent(choice) {
  player.changeStamina(choice.stamina ?? 0)
  player.changeFunds(choice.funds ?? 0)
  player.changeRisk(choice.risk ?? 0)
  player.changeExposure(choice.exposure ?? 0)
  engine.spendClock(choice.costHours ?? 0, choice.costMinutes ?? 0)
  engine.pushLog(choice.result)
  engine.clearEvent()
}
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

          <Transition name="event">
            <section v-if="engine.activeEvent" class="event-cover">
              <div class="event-card">
                <div class="flex flex-col gap-3 border-b border-brass/25 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="section-kicker">奇葩意外支线 / {{ engine.activeEvent.locationName }}</p>
                    <h2 class="mt-2 font-display text-3xl text-parchment">{{ engine.activeEvent.title }}</h2>
                  </div>
                  <p class="rounded-full border border-brass/30 bg-black/30 px-3 py-1 text-xs text-brass">
                    {{ engine.activeEvent.triggeredAt }}
                  </p>
                </div>

                <p class="mt-5 text-sm leading-7 text-stone-200">{{ engine.activeEvent.summary }}</p>

                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    v-for="choice in engine.activeEvent.choices"
                    :key="choice.id"
                    type="button"
                    class="event-choice"
                    @click="resolveEvent(choice)"
                  >
                    <span class="block text-left text-sm font-semibold text-parchment">{{ choice.label }}</span>
                    <span class="mt-2 block text-left text-xs leading-5 text-stone-300">
                      耗时 {{ choice.costHours ?? 0 }}h {{ choice.costMinutes ?? 0 }}m
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </Transition>
        </div>

        <ActionPanel :location-id="activeLocationId" @change-location="changeLocation" />
      </section>
    </div>
  </main>
</template>
