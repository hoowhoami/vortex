/**
 * Generic Douban data fetching function
 * @param url Request URL
 * @returns Promise<T> Returns data of specified type
 */
export async function fetchDoubanData<T>(url: string): Promise<T> {
  // Add timeout control
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  // Set request options including signal and headers
  const fetchOptions = {
    signal: controller.signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "https://movie.douban.com/",
      Accept: "application/json, text/plain, */*",
      Origin: "https://movie.douban.com",
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
