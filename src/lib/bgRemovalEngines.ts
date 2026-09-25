import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

let segmenterInstance: ImageSegmenter | null = null;
let segmenterLoading: Promise<ImageSegmenter> | null = null;

/**
 * Initialize Google MediaPipe Image Segmenter (Selfie & Portrait)
 * Model size is only ~250 KB! Loads in under 0.2s and processes via WebGL GPU.
 */
export async function getMediaPipeSegmenter(): Promise<ImageSegmenter> {
  if (segmenterInstance) return segmenterInstance;
  if (segmenterLoading) return segmenterLoading;

  segmenterLoading = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
      segmenterInstance = segmenter;
      return segmenter;
    } catch (err) {
      console.warn('GPU delegate failed for MediaPipe, falling back to CPU:', err);
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
      segmenterInstance = segmenter;
      return segmenter;
    }
  })();

  return segmenterLoading;
}

/**
 * Perform ultra-fast background removal using Google MediaPipe
 * Returns Blob with transparent PNG
 */
export async function removeBackgroundMediaPipe(
  imageSource: string | HTMLImageElement
): Promise<Blob> {
  const segmenter = await getMediaPipeSegmenter();

  // Load image element
  let img: HTMLImageElement;
  if (typeof imageSource === 'string') {
    img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageSource;
    });
  } else {
    img = imageSource;
  }

  // Segment image
  const segmentationResult = segmenter.segment(img);
  const confidenceMasks = segmentationResult.confidenceMasks;

  if (!confidenceMasks || confidenceMasks.length === 0) {
    throw new Error('MediaPipe tidak menemukan objek.');
  }

  const mask = confidenceMasks[0];
  const maskData = mask.getAsFloat32Array();
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  // Create canvas for drawing cutout
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia.');

  // Draw original image to canvas
  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // Apply mask to alpha channel with smooth thresholding
  const maskWidth = mask.width;
  const maskHeight = mask.height;
  const scaleX = maskWidth / width;
  const scaleY = maskHeight / height;

  for (let y = 0; y < height; y++) {
    const maskY = Math.min(Math.floor(y * scaleY), maskHeight - 1);
    const rowOffset = y * width;
    const maskRowOffset = maskY * maskWidth;

    for (let x = 0; x < width; x++) {
      const maskX = Math.min(Math.floor(x * scaleX), maskWidth - 1);
      const maskVal = maskData[maskRowOffset + maskX];

      const pixelIdx = (rowOffset + x) * 4;
      // Soft alpha thresholding for feather edge
      let alphaMultiplier = 0;
      if (maskVal > 0.6) {
        alphaMultiplier = 1;
      } else if (maskVal > 0.2) {
        alphaMultiplier = (maskVal - 0.2) / 0.4;
      }

      pixels[pixelIdx + 3] = Math.round(pixels[pixelIdx + 3] * alphaMultiplier);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gagal menghasilkan blob transparan PNG.'));
    }, 'image/png');
  });
}
