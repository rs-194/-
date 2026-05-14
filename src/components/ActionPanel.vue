<script setup>
import { computed } from 'vue'
import locations from '../data/location.json'
import { useGameEngineStore } from '../store/gameEngine'
import { usePlayerStore } from '../store/player'

const props = defineProps({
  locationId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['change-location'])

const engine = useGameEngineStore()
const player = usePlayerStore()

const currentLocation = computed(() => locations.find((location) => location.id === props.locationId) ?? locations[0])

function runAction(action) {
  player.changeStamina(action.stamina ?? 0)
  player.changeFunds(action.funds ?? 0)
  player.changeRisk(action.risk ?? 0)
  player.changeExposure(action.exposure ?? 0)
  engine.performAction(action)
}
</script>

<template>
  <aside class="panel-shell">
    <section>
      <p class="section-kicker">校园地点</p>
      <div class="mt-3 grid gap-2">
        <button
          v-for="location in locations"
          :key="location.id"
          type="button"
          class="location-button"
          :class="{ 'location-button-active': location.id === locationId }"
          @click="emit('change-location', location.id)"
        >
          {{ location.name }}
        </button>
      </div>
    </section>

    <section class="mt-8">
      <p class="section-kicker">日常安排</p>
      <div class="mt-3 grid gap-3">
        <button
          v-for="action in currentLocation.actions"
          :key="action.id"
          type="button"
          class="action-button"
          @click="runAction(action)"
        >
          <span class="text-left">
            <span class="block text-sm font-semibold text-parchment">{{ action.label }}</span>
            <span class="mt-1 block text-xs text-stone-300">
              耗时 {{ action.costHours ?? 0 }}h {{ action.costMinutes ?? 0 }}m
            </span>
          </span>
          <span class="rounded-full bg-black/25 px-2 py-1 text-xs text-brass">执行</span>
        </button>
      </div>
    </section>
  </aside>
</template>
