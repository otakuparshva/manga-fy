import { STYLES, GENRES } from './constants';

export type UploadType = 'panel' | 'photo';

export type Style = typeof STYLES[number];

export type Genre = typeof GENRES[number];

export interface ProcessedImage {
  originalUrl: string;
  generatedUrl: string;
}

export interface ImageFile {
    file: File;
    previewUrl: string;
}
