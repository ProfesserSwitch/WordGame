// src/utils/assetLoader.ts

export const preloadImages = async (
  sources: string[],
  onProgress: (progress: number) => void
): Promise<void> => {
  let loadedCount = 0;
  const total = sources.length;

  const loadSingleImage = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        onProgress(Math.round((loadedCount / total) * 100)); // คำนวณ %
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        // ถึง Error ก็ให้ Resolve ไปเลย เกมจะได้ไม่ค้าง (แต่อาจจะเห็นภาพดำ)
        loadedCount++;
        onProgress(Math.round((loadedCount / total) * 100));
        resolve();
      };
    });
  };

  // โหลดทุกรููปพร้อมกัน (Parallel)
  await Promise.all(sources.map(loadSingleImage));
};