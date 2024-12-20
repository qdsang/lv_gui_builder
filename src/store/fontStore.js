import { defineStore } from 'pinia'

export const useFontStore = defineStore('font', {
  state: () => ({
    currentFont: null,
    convertHistory: [],
    isConverting: false
  }),

  actions: {
    async convertFont(fontFile, settings) {
      this.isConverting = true
      try {
        // TODO: 实现字体转换逻辑
        const result = await this.callFontConvertAPI(fontFile, settings)
        
        this.convertHistory.push({
          timestamp: new Date(),
          fileName: fontFile.name,
          settings,
          result
        })
        
        return result
      } catch (error) {
        console.error('Font conversion failed:', error)
        throw error
      } finally {
        this.isConverting = false
      }
    },

    async callFontConvertAPI(fontFile, settings) {
      // TODO: 实现与后端API的通信
    }
  }
}) 