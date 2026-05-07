export interface YtDlpFlatEntry {
    id: string;
    title: string;
    url?: string;
    _type?: string;
}

export interface YtDlpPlaylistResponse {
    title: string;
    entries: YtDlpFlatEntry[];
}

export interface VideoTrack {
    id: string;
    title: string;
    trackNumber: number;
    progress: number;
    status: 'idle' | 'downloading' | 'completed' | 'error';
    selected: boolean;
}

export interface YtDlpEntry {
    id: string;
    title: string;
}