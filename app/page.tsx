'use client';

import React, { useState, useMemo } from 'react';
import { processMusicFiles } from '@/actions/process-music';
import { getFiles } from '@/actions/get-files';
import { findBestMatch } from '@/utils/matcher';

export default function MediaManager() {
  const [folderPath, setFolderPath] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [year, setYear] = useState('');
  const [songs, setSongs] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  // Live preview logic
  const filePreview = useMemo(() => {
    const songList = songs.split('\n').filter(s => s.trim() !== '');
  
    return files.map((fileName) => {
      // Attempt to find a match in your list
      const matchedTitle = findBestMatch(fileName, songList);
      // Find the index of that match in your list to determine the track number
      const trackIndex = matchedTitle ? songList.indexOf(matchedTitle) : -1;
  
      return {
        original: fileName,
        // Create a formatted preview name (e.g., "01 Song Name.mp3")
        preview: matchedTitle 
          ? `${(trackIndex + 1).toString().padStart(2, '0')} ${matchedTitle.trim()}.mp3`
          : fileName,
        // Store the index for use in the Server Action later
        trackNumber: trackIndex + 1 
      };
    });
  }, [songs, files]);

  const handleFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await getFiles(folderPath);
    if (result.success && result.files) {
      // Use the OR operator to provide an empty array fallback
      setFiles(result.files || []); 
    } else {
      setFiles([]); // Reset to empty if the fetch fails
      console.error(result.error || "No files found.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Processing with metadata:', { folderPath, artist, album, year });
    const formData = new FormData();
    formData.append('folderPath', folderPath);
    formData.append('artist', artist);
    formData.append('album', album);
    formData.append('year', year);
    formData.append('songs', songs);

    const result = await processMusicFiles(formData);
    if (result.success) {
        alert("Success!");
    } else {
        alert(result.error);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-[min(100%,90rem)] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6">Media File Manager</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Folder Path */}
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Target Folder Path"
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2" />
              <input type="text" placeholder="Album" value={album} onChange={(e) => setAlbum(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2" />
              <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2" />
            </div>

            <textarea
              rows={20}
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
              placeholder="Paste track titles here (1 per line)..."
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-sm"
            />
            <button type="button" onClick={handleFiles} className="w-full py-3 bg-white text-neutral-950 font-semibold rounded-lg">Preview File Names</button>
            <button type="submit" className="w-full py-3 bg-white text-neutral-950 font-semibold rounded-lg">
              Process Files
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Preview List */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Rename Preview</h2>
          <div className="space-y-2">
            {filePreview.length === 0 ? (
              <p className="text-neutral-600 italic">Enter song titles to see the rename preview...</p>
            ) : (
              filePreview.map((file, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono bg-neutral-950 p-3 rounded border border-neutral-800">
                  <span className="text-neutral-500 min-w-0 flex-1 break-words">{file.original}</span>
                  <span className="text-neutral-400 shrink-0 pt-0.5">→</span>
                  <span className="text-green-400 min-w-0 flex-1 break-words">{file.preview}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}