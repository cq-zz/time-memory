const IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/** Returns an error message string when the file is not an allowed image, otherwise null. */
export function validateImage(file) {
  if (!file) return 'No file selected';

  const mimeType = file.type || '';
  if (!IMAGE_ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return 'Unsupported image format';
  }

  return null;
}
