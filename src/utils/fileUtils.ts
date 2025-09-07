export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImageToDataUrl = async (
  file: File,
  {
    maxWidth = 1600,
    maxHeight = 1200,
    maxSizeKB = 200,
    mimeType = 'image/webp',
    initialQuality = 0.8,
    minQuality = 0.5
  }: {
    maxWidth?: number;
    maxHeight?: number;
    maxSizeKB?: number;
    mimeType?: string;
    initialQuality?: number;
    minQuality?: number;
  } = {}
): Promise<string> => {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const targetW = Math.round(img.width * scale);
  const targetH = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  let quality = initialQuality;
  let dataUrl = canvas.toDataURL(mimeType, quality);
  const maxBytes = maxSizeKB * 1024;

  // Reduce quality until under size or minQuality reached
  while (dataUrl.length * 0.75 > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.1);
    dataUrl = canvas.toDataURL(mimeType, quality);
  }

  // Cleanup
  URL.revokeObjectURL(img.src);
  return dataUrl;
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type) && file.size <= 12 * 1024 * 1024; // 12MB limit
};

export const isValidVideoFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm'];
  console.log('Video file validation:', {
    fileType: file.type,
    isValidType: validTypes.includes(file.type),
    fileSize: file.size,
    isValidSize: file.size <= 12 * 1024 * 1024,
    validTypes
  });
  return validTypes.includes(file.type) && file.size <= 12 * 1024 * 1024; // 12MB limit
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};