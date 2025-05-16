import { SimplifiedArtist } from "./artist";
import { ExternalUrls, Image, Restriction } from "./common";

export interface TrackAlbum {
  album_type: string;
  total_tracks: Number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: Restriction;
  type: string;
  uri: string;
  artists: SimplifiedArtist[];
}
