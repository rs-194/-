<script setup>
import { computed, ref } from 'vue'
import StatusBar from '../components/StatusBar.vue'
import StoryTheatre from '../components/StoryTheatre.vue'
import locations from '../data/location.json'
import { useGameEngineStore } from '../store/gameEngine'
import { usePlayerStore } from '../store/player'

const engine = useGameEngineStore()
const player = usePlayerStore()
const activeLocationId = ref(locations[0].id)
const isMapOpen = ref(false)

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

const storyBlocks = computed(() => {
  const blocks = [
    {
      id: `ambient-${activeLocation.value.id}`,
      type: 'ambient',
      kicker: '环境提示',
      title: activeLocation.value.name,
      text: activeLocation.value.tagline,
      meta: engine.timeLabel,
    },
  ]

  if (engine.activeEvent) {
    blocks.push({
      id: `event-${engine.activeEvent.id}`,
      type: 'event',
      kicker: `危红羁绊触点 / ${engine.activeEvent.locationName}`,
      title: engine.activeEvent.title,
      text: engine.activeEvent.summary,
      meta: engine.activeEvent.triggeredAt,
      choices: engine.activeEvent.choices,
    })
  }

  engine.logEntries.forEach((entry, index) => {
    blocks.push({
      id: `log-${index}-${entry}`,
      type: 'log',
      kicker: index === 0 ? '最新记录' : '校内回声',
      text: entry,
      meta: index === 0 ? engine.phase : null,
    })
  })

  return blocks
})

const mobileActions = computed(() => activeLocation.value.actions.slice(0, 2))

function travelToLocation(locationId) {
  if (locationId === activeLocationId.value) {
    isMapOpen.value = false
    return
  }

  activeLocationId.value = locationId
  engine.drawEvent(activeLocation.value, engine.getTimeSnapshot())
  isMapOpen.value = false
}

function runAction(action) {
  player.changeStamina(action.stamina ?? 0)
  player.changeFunds(action.funds ?? 0)
  player.changeRisk(action.risk ?? 0)
  player.changeExposure(action.exposure ?? 0)
  engine.performAction(action)
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
      <aside class="desktop-left-panel custom-scrollbar">
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
            <p class="section-kicker">DoL式动态剧本模版槽</p>
            <h1 class="mt-2 truncate font-display text-3xl text-slate-100 lg:text-5xl">{{ activeLocation.name }}</h1>
          </div>
          <div class="hidden rounded-full border border-red-400/30 bg-red-950/30 px-3 py-1 text-xs text-red-100 lg:block">
            {{ engine.timeLabel }}
          </div>
        </div>

        <StoryTheatre :blocks="storyBlocks" @resolve-event="resolveEvent" />
      </section>

      <aside class="desktop-right-panel custom-scrollbar">
        <section class="radar-card">
          <div class="flex items-center justify-between">
            <p class="section-kicker">全学校暗格雷达</p>
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
              @click="travelToLocation(location.id)"
            >
              <span>{{ location.name }}</span>
            </button>
          </div>
        </section>

        <section class="mt-4">
          <p class="section-kicker">地理换轨导航</p>
          <div class="mt-3 grid gap-2">
            <button
              v-for="location in locations"
              :key="location.id"
              type="button"
              class="location-jump"
              :class="{ 'location-jump-active': location.id === activeLocationId }"
              @click="travelToLocation(location.id)"
            >
              {{ location.name }}
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

        <section class="mt-4">
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

    <nav class="bottom-action-bar lg:hidden" aria-label="移动端行动栏">
      <button
        v-for="action in mobileActions"
        :key="action.id"
        type="button"
        class="bottom-action"
        @click="runAction(action)"
      >
        <span class="text-[10px] uppercase tracking-[0.18em] text-slate-400">行动</span>
        <span class="mt-1 line-clamp-2 text-sm font-semibold text-slate-100">{{ action.label }}</span>
      </button>
    </nav>

    <button type="button" class="map-orb lg:hidden" aria-label="打开全学校暗格地图" @click="isMapOpen = true">
      <span class="text-lg">⌖</span>
      <span class="text-[10px] uppercase tracking-[0.18em]">MAP</span>
    </button>

    <Transition name="drawer">
      <section v-if="isMapOpen" class="mobile-map-drawer lg:hidden">
        <div class="drawer-handle" />
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="section-kicker">全学校网块暗格</p>
            <h2 class="mt-1 font-display text-2xl text-slate-100">地理换轨导航</h2>
          </div>
          <button type="button" class="drawer-close" @click="isMapOpen = false">返回</button>
        </div>

        <div class="mt-4 grid gap-2">
          <button
            v-for="location in locations"
            :key="location.id"
            type="button"
            class="drawer-location"
            :class="{ 'drawer-location-active': location.id === activeLocationId }"
            @click="travelToLocation(location.id)"
          >
            <span class="font-semibold text-slate-100">{{ location.name }}</span>
            <span class="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{{ location.tagline }}</span>
          </button>
        </div>
      </section>
    </Transition>
  </main>
</template>
