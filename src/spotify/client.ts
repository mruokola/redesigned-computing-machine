// TODO what was this for again?
interface ClientCredentials {
  access_token: string;
  token_type: string;
  expires_in: Number;
}

export { SpotifyClient } from "./client/base";
export { ScopedSpotifyClient } from "./client/scoped";
