import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarVisible = ref(true)
  const sidebarWidth = ref(360)
  const markerPopupVisible = ref(false)

  return {
    sidebarVisible,
    sidebarWidth,
    markerPopupVisible,
  }
})
