import { defineStore } from 'pinia'

const weekdays = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜']

function padHour(hour) {
  return String(hour).padStart(2, '0')
}

export const useGameEngineStore = defineStore('gameEngine', {
  state: () => ({
    day: 1,
    weekdayIndex: 0,
    hour: 7,
    minute: 0,
    logEntries: ['钟楼第七声刚落下，你在圣魔学院偏厅醒来。'],
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
    spendClock(hours = 1, minutes = 0) {
      const totalMinutes = this.hour * 60 + this.minute + hours * 60 + minutes
      const elapsedDays = Math.floor(totalMinutes / 1440)
      const remaining = totalMinutes % 1440

      this.hour = Math.floor(remaining / 60)
      this.minute = remaining % 60

      if (elapsedDays > 0) {
        this.day += elapsedDays
        this.weekdayIndex = (this.weekdayIndex + elapsedDays) % weekdays.length
        this.pushLog(`昼夜翻过 ${elapsedDays} 次，学院的暗红钟盘重新校准了时间。`)
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
