import { TrackAlbum } from "./album";
import { SimplifiedArtist } from "./artist";
import { ExternalIds, ExternalUrls, Restriction } from "./common";

export interface Track {
  album: TrackAlbum;
  artists: SimplifiedArtist[];
  available_markets: string[];
  disc_number: Number;
  duration_ms: Number;
  explicit: boolean;
  external_ids: ExternalIds;
  exteranl_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: any; // TODO
  restrictions?: Restriction;
  name: string;
  popularity: Number;
  preview_url?: string;
  track_number: Number;
  type: string;
  uri: string;
  is_local: boolean;
}
