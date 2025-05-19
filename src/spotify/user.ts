import { ExternalUrls, Image } from "./common";

interface ExplicitContent {
  filter_enabled: boolean;
  filter_locked: boolean;
}

interface Followers {
  href?: string;
  total: number;
}

export interface User {
  country: string;
  display_name: string;
  email?: string;
  explicit_content: ExplicitContent;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  image: Image[];
  product: string;
  type: string;
  uri: string;
}
