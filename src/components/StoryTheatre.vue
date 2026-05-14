<script setup>
defineProps({
  blocks: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['resolve-event'])
</script>

<template>
  <section class="story-scroll custom-scrollbar" aria-label="剧情剧院">
    <TransitionGroup name="log" tag="div" class="story-block-list">
      <article
        v-for="block in blocks"
        :key="block.id"
        class="story-block"
        :class="{
          'story-block-ambient': block.type === 'ambient',
          'story-block-event': block.type === 'event',
          'story-block-log': block.type === 'log',
        }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="story-block-kicker">{{ block.kicker }}</p>
            <h3 v-if="block.title" class="mt-1 text-base font-semibold text-slate-100">{{ block.title }}</h3>
          </div>
          <span v-if="block.meta" class="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-slate-300">
            {{ block.meta }}
          </span>
        </div>

        <p class="mt-2 text-sm leading-7 text-slate-200">{{ block.text }}</p>

        <div v-if="block.choices?.length" class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="choice in block.choices"
            :key="choice.id"
            type="button"
            class="story-choice"
            @click="emit('resolve-event', choice)"
          >
            <span class="block text-left text-sm font-semibold text-slate-100">{{ choice.label }}</span>
            <span class="mt-1 block text-left text-[11px] text-slate-300">
              耗时 {{ choice.costHours ?? 0 }}h {{ choice.costMinutes ?? 0 }}m
            </span>
          </button>
        </div>
      </article>
    </TransitionGroup>
  </section>
</template>
