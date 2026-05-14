import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    name: '无名候补生',
    stamina: 82,
    maxStamina: 100,
    physique: 12,
    charm: 9,
    willpower: 14,
    funds: 36,
    stealthRisk: 18,
    exposure: 6,
  }),
  getters: {
    staminaRatio: (state) => Math.round((state.stamina / state.maxStamina) * 100),
    dangerLevel: (state) => {
      if (state.exposure >= 70 || state.stealthRisk >= 70) return '危急'
      if (state.exposure >= 40 || state.stealthRisk >= 40) return '警戒'
      return '隐秘'
    },
  },
  actions: {
    setStat(key, value) {
      if (!(key in this.$state)) return
      this[key] = value
    },
    changeStamina(delta) {
      this.stamina = Math.min(this.maxStamina, Math.max(0, this.stamina + delta))
    },
    changeFunds(delta) {
      this.funds = Math.max(0, this.funds + delta)
    },
    changeRisk(delta) {
      this.stealthRisk = Math.min(100, Math.max(0, this.stealthRisk + delta))
    },
    changeExposure(delta) {
      this.exposure = Math.min(100, Math.max(0, this.exposure + delta))
    },
  },
})
