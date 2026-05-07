import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    
    const { trackId, playlistTitle, basePath } = await req.json();
    const videoUrl = `https://www.youtube.com/watch?v=${trackId}`;
        
    const cleanedTitle = playlistTitle.replace(/^Album\s*-\s*/i, "");
    const safeFolderName = cleanedTitle.replace(/[\\/:*?"<>|]/g, "");
        
    let finalDir: string;
    
    if (basePath) {      
      const normalizedBase = path.normalize(basePath);
      finalDir = path.join(normalizedBase, safeFolderName);
    } else {
      finalDir = path.join(process.cwd(), 'public', 'music', safeFolderName);
    }

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const outputTemplate = path.join(finalDir, '%(title)s.%(ext)s');

    return new Promise<NextResponse>((resolve) => {
        const ls = spawn('yt-dlp', [
          '-x', 
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '-o', outputTemplate,
          videoUrl
        ]);
  
        ls.stderr.on('data', (data: Buffer) => {
          console.error(`yt-dlp error: ${data.toString()}`);
        });
  
        ls.on('close', (code: number) => {
          if (code === 0) {
            resolve(NextResponse.json({ success: true }));
          } else {
            resolve(NextResponse.json({ success: false }, { status: 500 }));
          }
        });
      });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}