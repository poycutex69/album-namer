// actions/get-files.ts
'use server';
import fs from 'fs/promises';

export async function getFiles(folderPath: string) {
  try {
    // Single-pass RegEx: $ means "ends with", i means "case-insensitive"
    const audioRegex = /\.(mp3|flac)$/i;

    const allFiles = await fs.readdir(folderPath);
    const files = allFiles.filter(file => audioRegex.test(file));

    return { success: true, files };
  } catch (e) {
    return { success: false, files: [], error: 'Could not read directory' };
  }
}