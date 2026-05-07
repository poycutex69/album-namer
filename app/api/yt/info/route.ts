import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { YtDlpPlaylistResponse } from '@/types/youtube';
const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
    try {
      const { url } = await req.json();
  
      const { stdout } = await execPromise(`yt-dlp --flat-playlist -J "${url}"`);
      
      // Cast the parsed JSON to our interface
      const data = JSON.parse(stdout) as YtDlpPlaylistResponse;
  
      return NextResponse.json({
        title: data.title,
        // No more 'any' here! entry is now recognized as YtDlpFlatEntry
        entries: data.entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
        }))
      });
    } catch (error: unknown) {
      // Standard way to handle the 'any' error on catch blocks
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }