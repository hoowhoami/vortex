import { dfid } from '@/api';
import { defineStore } from 'pinia';

interface App {
  dfid?: string;
}

export const useAppStore = defineStore('app', {
  persist: true,
  state: (): App => ({
    dfid: undefined,
  }),
  getters: {
    hasDfid(state) {
      return !!state.dfid;
    },
  },
  actions: {
    async fetchDfid() {
      if (this.hasDfid) {
        return;
      }
      this.dfid = undefined;
      const dfidResult = await dfid();
      this.dfid = dfidResult.dfid;
    },
  },
});
