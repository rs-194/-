<script setup>
import { computed, ref } from 'vue'
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
  { label: '资金', value: player.funds },
  { label: '体力', value: `${player.stamina}/${player.maxStamina}` },
  { label: '暴露', value: `${player.exposure}%` },
  { label: '潜伏', value: `${player.stealthRisk}%` },
  { label: '处分', value: player.dangerLevel },
])

const mobileControls = computed(() => [
  ...locations.map((location) => ({ id: `loc-${location.id}`, type: 'location', label: location.name, payload: location })),
  ...activeLocation.value.actions.map((action) => ({ id: `act-${action.id}`, type: 'action', label: action.label, payload: action })),
].slice(0, 4))

function changeLocation(locationId) {
  activeLocationId.value = locationId
  engine.drawEvent(activeLocation.value, engine.getTimeSnapshot())
}

function runAction(action) {
  player.changeStamina(action.stamina ?? 0)
  player.changeFunds(action.funds ?? 0)
  player.changeRisk(action.risk ?? 0)
  player.changeExposure(action.exposure ?? 0)
  engine.performAction(action)
}

function runMobileControl(control) {
  if (control.type === 'location') {
    changeLocation(control.payload.id)
    return
  }

  runAction(control.payload)
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
  <main class="stage-root">
    <div class="stage-backdrop" :style="{ backgroundImage: `url(${activeLocation.image})` }" />
    <div class="stage-vignette" />

    <StatusBar />

    <div class="stage-layout">
      <aside class="desktop-left-panel">
        <div class="portrait-card">
          <div class="portrait-noise" />
          <div class="relative z-10">
            <p class="section-kicker">候补学生档案</p>
            <h2 class="mt-2 font-display text-2xl text-slate-100">{{ player.name }}</h2>
            <p class="mt-2 text-xs leading-5 text-slate-300">寄宿高中部 / 夜间纪律观察名单 / 血液治疗待复核</p>
          </div>
        </div>

        <dl class="mt-4 grid grid-cols-2 gap-2">
          <div v-for="item in attributes" :key="item.label" class="stat-tile">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </aside>

      <section class="story-panel">
        <div class="story-header">
          <div class="min-w-0">
            <p class="section-kicker">校内异常记录</p>
            <h1 class="mt-2 truncate font-display text-3xl text-slate-100 lg:text-5xl">{{ activeLocation.name }}</h1>
          </div>
          <div class="hidden rounded-full border border-red-400/30 bg-red-950/30 px-3 py-1 text-xs text-red-100 lg:block">
            {{ engine.timeLabel }}
          </div>
        </div>

        <p class="mt-3 text-sm leading-6 text-slate-300 lg:max-w-2xl">{{ activeLocation.tagline }}</p>

        <section class="story-scroll">
          <TransitionGroup name="log" tag="div" class="space-y-3">
            <p v-for="entry in engine.logEntries" :key="entry" class="log-line">
              {{ entry }}
            </p>
          </TransitionGroup>
        </section>

        <Transition name="event">
          <section v-if="engine.activeEvent" class="event-cover">
            <div class="event-card">
              <div class="flex flex-col gap-3 border-b border-red-300/20 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="section-kicker">异常支线 / {{ engine.activeEvent.locationName }}</p>
                  <h2 class="mt-2 font-display text-3xl text-slate-100">{{ engine.activeEvent.title }}</h2>
                </div>
                <p class="rounded-full border border-red-300/25 bg-black/30 px-3 py-1 text-xs text-red-100">
                  {{ engine.activeEvent.triggeredAt }}
                </p>
              </div>

              <p class="mt-5 text-sm leading-7 text-slate-200">{{ engine.activeEvent.summary }}</p>

              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  v-for="choice in engine.activeEvent.choices"
                  :key="choice.id"
                  type="button"
                  class="event-choice"
                  @click="resolveEvent(choice)"
                >
                  <span class="block text-left text-sm font-semibold text-slate-100">{{ choice.label }}</span>
                  <span class="mt-2 block text-left text-xs leading-5 text-slate-300">
                    耗时 {{ choice.costHours ?? 0 }}h {{ choice.costMinutes ?? 0 }}m
                  </span>
                </button>
              </div>
            </div>
          </section>
        </Transition>
      </section>

      <aside class="desktop-right-panel">
        <section class="radar-card">
          <div class="flex items-center justify-between">
            <p class="section-kicker">全域高中雷达</p>
            <span class="text-xs text-red-200/80">LIVE</span>
          </div>
          <div class="radar-map">
            <button
              v-for="location in locations"
              :key="location.id"
              type="button"
              class="radar-dot"
              :class="{ 'radar-dot-active': location.id === activeLocationId }"
              :style="{ left: `${location.radar.x}%`, top: `${location.radar.y}%` }"
              @click="changeLocation(location.id)"
            >
              <span>{{ location.name }}</span>
            </button>
          </div>
        </section>

        <section class="mt-4">
          <p class="section-kicker">非人NPC状态</p>
          <div class="mt-3 space-y-3">
            <article v-for="npc in activeLocation.npcs" :key="npc.id" class="npc-row">
              <div class="npc-avatar">{{ npc.initial }}</div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-slate-100">{{ npc.name }}</h3>
                <p class="truncate text-xs text-slate-400">{{ npc.status }}</p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-slate-950">
                  <div class="h-full bg-red-500" :style="{ width: `${npc.threat}%` }" />
                </div>
              </div>
              <span class="text-xs text-red-200">{{ npc.threat }}</span>
            </article>
          </div>
        </section>

        <section class="mt-4 hidden lg:block">
          <p class="section-kicker">可执行日常</p>
          <div class="mt-3 grid gap-3">
            <button
              v-for="action in activeLocation.actions"
              :key="action.id"
              type="button"
              class="action-button"
              @click="runAction(action)"
            >
              <span class="text-left">
                <span class="block text-sm font-semibold text-slate-100">{{ action.label }}</span>
                <span class="mt-1 block text-xs text-slate-400">耗时 {{ action.costHours ?? 0 }}h {{ action.costMinutes ?? 0 }}m</span>
              </span>
              <span class="rounded-full bg-black/25 px-2 py-1 text-xs text-red-100">执行</span>
            </button>
          </div>
        </section>
      </aside>
    </div>

    <nav class="bottom-sheet lg:hidden" aria-label="移动端主控">
      <button
        v-for="control in mobileControls"
        :key="control.id"
        type="button"
        class="bottom-control"
        :class="{ 'bottom-control-active': control.type === 'location' && control.payload.id === activeLocationId }"
        @click="runMobileControl(control)"
      >
        <span class="text-[10px] uppercase tracking-[0.18em] text-slate-400">{{ control.type === 'location' ? '地点' : '行动' }}</span>
        <span class="mt-1 line-clamp-2 text-sm font-semibold text-slate-100">{{ control.label }}</span>
      </button>
    </nav>
  </main>
</template>
