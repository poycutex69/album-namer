## Album Namer & YouTube Playlist Downloader

This Next.js app provides two utilities:

1. Rename a folder of audio files (MP3/FLAC) to match a pasted track list, and write MP3 metadata for album/artist/year.
2. Download selected tracks from a YouTube playlist using `yt-dlp`, convert them to MP3, and save them into a local folder.

---

## System Requirements

### Prerequisites

- **Node.js**: recommended **Node 18+** (the app uses Next.js and server-side Node features).
- **npm** (or `pnpm`/`yarn`).
- **`yt-dlp`** installed and available in your system `PATH`.
  - Used by the playlist downloader endpoints.
- **`ffmpeg`** installed and available in your system `PATH`.
  - `yt-dlp` needs it to extract/convert audio to MP3.
- **Write access to local folders**
  - For the homepage, the server must be able to read the target folder and rename files inside it.
  - For the downloader, the server must be able to create folders and write MP3 files to the selected destination.

### Notes / Safety

- The homepage renames files in-place. Make sure you have backups or are operating on a correct folder.
- If audio files are open in another player/app, the rename step may fail.

---

## How to Setup

1. Clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser:
   - Homepage: `http://localhost:3000/`
   - YouTube downloader page: `http://localhost:3000/downloader`

---

## How to Use

## 1) Homepage: Rename & Tag Album Files

File: `app/page.tsx`

What it does:
- Reads filenames from the folder you provide.
- Matches each file to the best entry from your pasted track list.
- Renames **both MP3 and FLAC** files to a consistent format.
- Writes **MP3 metadata only** (album/artist/year + track number).

Steps:

1. **Target Folder Path**
   - Enter the absolute path to the folder containing your `.mp3` / `.flac` files.
   - Only files matching `*.mp3` or `*.flac` are considered.
2. **Artist / Album / Year**
   - These values are used to write metadata into MP3s.
3. **Paste track titles**
   - Paste titles into the textarea, **one per line**, in the intended order.
4. Click **Preview File Names**
   - You’ll see `original -> preview` rename results.
5. Click **Process Files**
   - The app renames matching files and writes MP3 tags.

Rename format:
- `NN - Title.ext`
  - `NN` is a 2-digit track number from your pasted list (track index + 1).
  - Title is sanitized to remove characters that are invalid in filenames on Windows.
- Note: the preview panel may show `.mp3` for the preview name, but the actual rename keeps your original extension (`.mp3` or `.flac`).

MP3 tagging:
- Uses `node-id3` to write:
  - `title`, `artist`, `album`, `year`, and `trackNumber`
- Tagging is applied **only** when the file extension is `.mp3`.

---

## 2) YouTube Playlist Downloader

File: `app/downloader/page.tsx`

What it does:
- Takes a YouTube **playlist URL**.
- Uses `yt-dlp --flat-playlist -J` to fetch playlist entries.
- Displays tracks with checkboxes.
- Downloads selected tracks one-by-one via `yt-dlp`, extracts audio as **MP3**, and saves them locally.

Steps:

1. **Local Save Destination**
   - Set `basePath` (default shown in the UI: `D:/mp3s`).
2. Paste a **YouTube playlist URL**.
3. Click **Load Playlist**
   - The app analyzes the playlist and lists tracks.
4. Select which tracks to download (checkboxes).
5. Click **Download Selected (N)**
   - Tracks marked as `completed` are skipped on subsequent downloads.
   - `error` tracks show a **Retry** button in the table.

Output location & naming:
- The app creates a folder named after the playlist title (sanitized).
- If the playlist title starts with `Album -` (case-insensitive), that prefix is removed for the folder name.
- MP3 files are saved as:
  - `%(title)s.mp3`

---

## Troubleshooting

- **Downloader fails with `yt-dlp` not found**
  - Ensure `yt-dlp` is installed and `yt-dlp` is in your `PATH`.
- **Downloader fails during conversion**
  - Ensure `ffmpeg` is installed and `ffmpeg` is in your `PATH`.
- **Homepage fails to rename**
  - Close any apps that currently have the audio files open.
  - Verify the folder path is correct and accessible by the Node server.

