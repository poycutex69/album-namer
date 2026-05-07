'use server';

import fs from 'fs/promises';
import path from 'path';
import nodeID3 from 'node-id3';
import { findBestMatch } from '@/utils/matcher';

export async function processMusicFiles(formData: FormData) {
  const folderPath = formData.get('folderPath') as string;
  const artist = formData.get('artist') as string;
  const album = formData.get('album') as string;
  const year = formData.get('year') as string;
  const rawSongs = formData.get('songs') as string;

  const songList = rawSongs.split('\n').filter(s => s.trim() !== '');

  try {
    // 1. Fast RegEx for both formats
    const audioRegex = /\.(mp3|flac)$/i;
    const allFiles = await fs.readdir(folderPath);
    const files = allFiles.filter(file => audioRegex.test(file));

    const operations = files.map((fileName) => {
      const matchedTitle = findBestMatch(fileName, songList);
      if (!matchedTitle) return null;

      const trackIndex = songList.indexOf(matchedTitle);
      const oldPath = path.join(folderPath, fileName);
      
      // 2. Grab the extension to keep it the same
      const ext = path.extname(fileName); 
      
      // 3. Sanitize the name (Crucial: removes characters like '?' that crashed us earlier)
      const safeTitle = matchedTitle.replace(/[\\/:*?"<>|]/g, "").trim();
      
      const newFileName = `${(trackIndex + 1).toString().padStart(2, '0')} - ${safeTitle}${ext}`;
      const newPath = path.join(folderPath, newFileName);

      return { 
        oldPath, 
        newPath, 
        title: matchedTitle, 
        track: trackIndex + 1,
        isMp3: ext.toLowerCase() === '.mp3' 
      };
    }).filter((op): op is NonNullable<typeof op> => op !== null);

    if (operations.length === 0) return { success: false, error: "No matches found." };

    for (const op of operations) {
      // 4. Tagging ONLY for MP3
      if (op.isMp3) {
        const tags = {
          title: op.title,
          artist,
          album,
          year,
          trackNumber: op.track.toString()
        };
        // Synchronous write ensures the file isn't "busy" when we rename it
        nodeID3.write(tags, op.oldPath);
      }

      // 5. Rename for EVERYONE (MP3 and FLAC)
      await fs.rename(op.oldPath, op.newPath);
    }

    return { success: true, message: `Successfully processed ${operations.length} tracks.` };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Process failed. Check if files are open in another app.' };
  }
}