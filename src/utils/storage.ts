export const storage = {
  getItem(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      const { value, expires } = JSON.parse(item);
      if (!expires || expires >= Date.now()) {
        return value;
      } else {
        this.removeItem(key);
        return null;
      }
    }
    return null;
  },

  /**
   *
   * @param key
   * @param value
   * @param maxAge 相对缓存时间，单位s，默认1day，转换为expires(绝对时间)存储，传null不过期
   */
  setItem(key: string, value: string, maxAge: number | null = 60 * 60 * 24 * 1) {
    this.removeItem(key);
    const expires = maxAge && Date.now() + maxAge * 1000;
    localStorage.setItem(key, JSON.stringify({ value, expires }));
  },

  removeItem(key: string) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },
};
