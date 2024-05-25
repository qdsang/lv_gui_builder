import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      isCollapse: true,
    };
  },
  getters: {},
  actions: {
    updateCollapse() {
      this.isCollapse = !this.isCollapse;
    },
  },
});
