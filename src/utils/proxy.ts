// 代理
export const getProxyUrl = (url: string, checkHttp = true) => {
  const proxy = import.meta.env.VITE_PROXY_URL;
  if (proxy && url) {
    if (checkHttp) {
      if (url?.includes('http://')) {
        return `${proxy}?url=${encodeURIComponent(url)}`;
      } else {
        return url;
      }
    } else {
      return `${proxy}?url=${encodeURIComponent(url)}`;
    }
  }
  return url;
};
