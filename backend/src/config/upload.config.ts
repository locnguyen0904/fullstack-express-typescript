export const S3_ACL = 'public-read';

export const FILE_SIZE_LIMIT: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 30 * 1024 * 1024, // 30 MB
  ebook: 100 * 1024 * 1024, // 100 MB
  others: 30 * 1024 * 1024, // 30 MB
};

export const MAX_FILE_SIZE = Object.values(FILE_SIZE_LIMIT).reduce(
  (prev, curr) => (prev < curr ? curr : prev),
  Number.MIN_VALUE
);

export const ALLOW_MIME_TYPE: Record<string, string[]> = {
  image: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
  video: ['video/mp4'],
  ebook: ['application/epub+zip'],
  others: ['application/pdf'],
};

export const DEFAULT_S3_CONTENT_TYPE = 'application/octet-stream';

export const S3_CONTENT_DISPOSITION = 'inline';
