"use client";

import { useState } from 'react';
import { YtDlpEntry, VideoTrack } from '@/types/youtube';

export default function PlaylistDownloader() {
  const [url, setUrl] = useState('');
  const [tracks, setTracks] = useState<VideoTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [basePath, setBasePath] = useState('D:/mp3s');

  // Logic for checkboxes
  const toggleCheck = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const toggleAll = (checked: boolean) => {
    setTracks(prev => prev.map(t => ({ ...t, selected: checked })));
  };

  const selectedCount = tracks.filter(t => t.selected).length;
  const isAllSelected = tracks.length > 0 && selectedCount === tracks.length;

  const resetPage = () => {
    setTracks([]);
    setUrl('');
    setIsDownloading(false);
  };

  const downloadSelected = async (playlistTitle: string, basePath: string) => {
    setIsDownloading(true);
    
    // Only download tracks that are selected AND not already completed
    const tracksToDownload = tracks.filter(t => t.selected && t.status !== 'completed');

    for (const track of tracksToDownload) {
      try {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'downloading' } : t));
  
        const res = await fetch('/api/yt/download', {
          method: 'POST',
          body: JSON.stringify({ 
            trackId: track.id,
            playlistTitle: playlistTitle,
            basePath: basePath 
          }),
        });
  
        if (res.ok) {
          setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'completed' } : t));
        } else {
          setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'error' } : t));
        }
      } catch (error) {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'error' } : t));
      }
    }
    setIsDownloading(false);
  };

  const fetchPlaylistInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/yt/info', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      
      setPlaylistTitle(data.title);

      const playlistTracks = data.entries.map((entry: YtDlpEntry, index: number) => ({
        id: entry.id,
        title: entry.title,
        trackNumber: index + 1,
        progress: 0,
        status: 'idle',
        selected: true, // Default to checked
      }));
      setTracks(playlistTracks);
    } catch (err) {
      alert("Failed to fetch playlist info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">YouTube Playlist Downloader</h1>
      
      {/* UI for Base Path */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">
              Local Save Destination
          </label>
          <input 
              type="text" 
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              className="w-full bg-transparent text-white border-none focus:ring-0 p-0 text-sm"
          />
      </div>

      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube Playlist URL"
          className="flex-1 p-2 border rounded bg-slate-50 text-black"
        />
        <button 
          onClick={fetchPlaylistInfo}
          disabled={loading || !url}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Analyzing...' : 'Load Playlist'}
        </button>
      </div>

      {tracks.length > 0 && (
        <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
            <button 
                onClick={() => downloadSelected(playlistTitle, basePath)}
                disabled={isDownloading || selectedCount === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 font-medium"
            >
                {isDownloading ? 'Downloading...' : `Download Selected (${selectedCount})`}
            </button>
            <button 
                onClick={resetPage}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
                Reset
            </button>
            </div>
            <span className="text-gray-400 text-sm">{tracks.length} tracks found</span>
        </div>
      )}

      <div className="border rounded-lg border-white/10 overflow-hidden bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5">
            <tr className="text-gray-400 text-sm">
              <th className="p-4 border-b border-white/10 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 border-b border-white/10 w-12 text-center">#</th>
              <th className="p-4 border-b border-white/10">Title</th>
              <th className="p-4 border-b border-white/10">Status / Progress</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="group border-b border-white/5 transition-all duration-200 hover:bg-white/5 cursor-default">
                <td className="p-4 text-center">
                   <input 
                    type="checkbox" 
                    checked={track.selected}
                    onChange={() => toggleCheck(track.id)}
                    className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-4 text-gray-500 group-hover:text-blue-400 transition-colors text-center">{track.trackNumber}</td>
                <td className="p-4 font-medium text-white/90 group-hover:text-white">{track.title}</td>
                <td className="p-4">
                  {track.status === 'downloading' && (
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full animate-pulse" style={{ width: `100%` }}></div>
                    </div>
                  )}
                  
                  {track.status === 'completed' && (
                    <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                      ✅ Downloaded
                    </span>
                  )}

                  {track.status === 'idle' && (
                    <span className="text-gray-500 text-sm">Ready</span>
                  )}

                  {track.status === 'error' && (
                    <button 
                      onClick={() => downloadSelected(playlistTitle, basePath)}
                      className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded border border-red-500/50 hover:bg-red-500/30 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tracks.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-500">
            No tracks loaded. Enter a URL to start.
          </div>
        )}
      </div>
    </div>
  );
}