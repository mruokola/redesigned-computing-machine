import { ExternalUrls, Image } from "./common";

export interface PlaylistOwner {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name?: string;
}

export interface SimplifiedPlaylistTracks {
  href: string;
  total: number;
}

export interface SimplifiedPlaylist {
  collaborative: boolean;
  description?: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: PlaylistOwner;
  public: boolean;
  snapshot_id: string;
  tracks: SimplifiedPlaylistTracks;
  type: string;
  uri: string;
}

export interface PagedPlaylist {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items: SimplifiedPlaylist[];
}
