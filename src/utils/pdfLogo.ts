/** Rasterise saved logos, including SVG/WebP, into a format jsPDF can embed. */
export async function preparePdfLogo(dataUrl: string): Promise<{ dataUrl: string; width: number; height: number }> {
  if (!dataUrl.startsWith('data:image/')) throw new Error('Invalid company logo.');
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Could not read the company logo.'));
    image.src = dataUrl;
  });
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) throw new Error('The company logo has no image dimensions.');
  const scale = Math.min(1, 1200 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the company logo.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL('image/png'), width, height };
}
