import { NextRequest, NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  const ytdlp = new YtDlp();

  // Define your storage path (e.g., a 'downloads' folder in your project)
  const outputPath = path.resolve('./public/music');

  try {
    const result = await ytdlp
      .download(url)
      .extractAudio()
      .audioFormat('mp3')
      .audioQuality('0') // Best VBR quality
      .output(outputPath)
      .on('progress', (p) => {
        // You can use WebSockets or SSE to send this to the frontend
        console.log(`Progress: ${p.percentage_str}`);
      })
      .run();

    return NextResponse.json({ success: true, files: result.filePaths });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}