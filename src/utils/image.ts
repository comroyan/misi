/**
 * Image processing utilities
 * Resizes screenshot dimensions, compresses to high-clarity WebP/JPEG,
 * and preserves readable text in mobile screenshots.
 */

export interface ProcessedImage {
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function processScreenshot(
  file: File,
  maxDimension = 1440,
  quality = 0.85
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Basic type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat format gambar.'));
      img.onload = () => {
        let { width, height } = img;

        // Scale down proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context tidak tersedia.'));
          return;
        }

        // Clean background and draw image
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp with high text readability
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengompres gambar.'));
              return;
            }

            const previewUrl = URL.createObjectURL(blob);
            resolve({
              blob,
              previewUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height,
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
