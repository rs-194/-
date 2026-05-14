import { defineStore } from 'pinia'

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function padHour(hour) {
  return String(hour).padStart(2, '0')
}

export const useGameEngineStore = defineStore('gameEngine', {
  state: () => ({
    day: 1,
    weekdayIndex: 0,
    hour: 7,
    minute: 0,
    activeEvent: null,
    logEntries: ['晨间铃声响起，你在 Saint Demon Academy 的宿舍床位上醒来。走廊广播要求全体学生准时出操，违者留校察看。'],
  }),
  getters: {
    weekday: (state) => weekdays[state.weekdayIndex],
    timeLabel: (state) => `${padHour(state.hour)}:${String(state.minute).padStart(2, '0')}`,
    dateLabel() {
      return `第 ${this.day} 日 / ${this.weekday}`
    },
    phase: (state) => {
      if (state.hour < 6) return '深夜'
      if (state.hour < 12) return '晨间'
      if (state.hour < 18) return '午后'
      if (state.hour < 22) return '黄昏'
      return '夜间'
    },
  },
  actions: {
    getTimeSnapshot() {
      return {
        day: this.day,
        weekday: this.weekday,
        hour: this.hour,
        minute: this.minute,
        phase: this.phase,
      }
    },
    isEventAvailable(event, time) {
      const phases = event.phases ?? []
      const startHour = event.startHour ?? 0
      const endHour = event.endHour ?? 23
      const phaseMatched = phases.length === 0 || phases.includes(time.phase)
      const hourMatched =
        startHour <= endHour
          ? time.hour >= startHour && time.hour <= endHour
          : time.hour >= startHour || time.hour <= endHour

      return phaseMatched && hourMatched
    },
    pickWeightedEvent(events) {
      const totalWeight = events.reduce((sum, event) => sum + (event.weight ?? 1), 0)
      let roll = Math.random() * totalWeight

      return events.find((event) => {
        roll -= event.weight ?? 1
        return roll <= 0
      })
    },
    drawEvent(location, time = this.getTimeSnapshot()) {
      const candidates = (location.events ?? []).filter((event) => this.isEventAvailable(event, time))

      if (candidates.length === 0) {
        this.activeEvent = null
        this.pushLog(`你抵达${location.name}。储物柜门依次轻响，像有人在里面做点名。`)
        return null
      }

      const locationChance = location.eventChance ?? 0.25
      const phaseBonus = time.phase === '夜间' || time.phase === '深夜' ? 0.12 : 0
      const riskBonus = candidates.some((event) => event.tags?.includes('danger')) ? 0.03 : 0
      const chance = Math.min(0.85, locationChance + phaseBonus + riskBonus)

      if (Math.random() > chance) {
        this.activeEvent = null
        this.pushLog(`你抵达${location.name}。黑板上的粉笔灰自动排成校规编号，又很快散开。`)
        return null
      }

      const event = this.pickWeightedEvent(candidates)

      this.activeEvent = {
        ...event,
        locationId: location.id,
        locationName: location.name,
        triggeredAt: `${this.dateLabel} ${this.timeLabel}`,
      }
      this.pushLog(`异常支线触发：${event.title}`)

      return this.activeEvent
    },
    clearEvent() {
      this.activeEvent = null
    },
    spendClock(hours = 1, minutes = 0) {
      const totalMinutes = this.hour * 60 + this.minute + hours * 60 + minutes
      const elapsedDays = Math.floor(totalMinutes / 1440)
      const remaining = totalMinutes % 1440

      this.hour = Math.floor(remaining / 60)
      this.minute = remaining % 60

      if (elapsedDays > 0) {
        this.day += elapsedDays
        this.weekdayIndex = (this.weekdayIndex + elapsedDays) % weekdays.length
        this.pushLog(`校内广播跨过 ${elapsedDays} 次午夜，考勤系统把你的名字重新钉回名单。`)
      }
    },
    pushLog(message) {
      this.logEntries.unshift(message)
      this.logEntries = this.logEntries.slice(0, 12)
    },
    performAction(action) {
      this.spendClock(action.costHours ?? 1, action.costMinutes ?? 0)
      this.pushLog(action.result)
    },
  },
})
