export interface ExternalIds {
  isrc: string;
  ean: string;
  upc: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  url: string;
  height?: Number;
  width?: Number;
}

export interface Restriction {
  reason: string;
}
