export interface FunkWhaleV1Track {
    id: number
    title: string
    mbid?: string
    duration?: number // seconds
    artist: { id: number; name: string; mbid?: string }
    album?: { id: number; title: string; mbid?: string }
}

export interface FunkWhaleV1Listen {
    id: number
    creation_date: string
    track: FunkWhaleV1Track
}

export interface FunkWhaleV1Response {
    count: number
    next: string | null
    previous: string | null
    results: FunkWhaleV1Listen[]
}
