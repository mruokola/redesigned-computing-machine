import { SpotifyClient } from "./spotify/client";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.log("missing env");
  process.exit(1);
}

const client = await SpotifyClient.fromClientCredentials(
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
);

const track = await client.getTrack("4Bqr7kdHRuoxQf53PajVmm");
console.log(JSON.stringify(track, null, 4));
