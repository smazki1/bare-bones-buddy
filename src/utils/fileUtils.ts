export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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