import { ScopedSpotifyClient, SpotifyClient } from "./spotify/client";
import * as qs from "node:querystring";
import { v7 as uuidv7 } from "uuid";
import { JsonDatabase } from "./database";
import { Duration, add, parseISO, isPast } from "date-fns";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_CALLBACK_URI } =
  process.env;
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_CALLBACK_URI) {
  console.log("missing env");
  process.exit(1);
}

const db = new JsonDatabase();

for (const token of db.getUserTokens()) {
  const expiration = add(parseISO(token.timestamp), {
    seconds: token.expiresIn,
  });
  let client: ScopedSpotifyClient;
  if (isPast(expiration)) {
    console.log("token probably expired");
    client = await ScopedSpotifyClient.fromRefreshToken(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      token.refreshToken,
    );
    if (client.refreshToken !== token.refreshToken) {
      console.log("token expired, refresh token changed");
      // No need to verify ...maybe?
      db.upsertUserToken(token.userId, {
        accessToken: client.accessToken,
        scope: client.scope,
        expiresIn: client.expiresIn,
        refreshToken: client.refreshToken,
        tokenType: client.tokenType,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    console.log("using stored token");
    client = await ScopedSpotifyClient.fromAccessToken({
      accessToken: token.accessToken,
      scope: token.scope,
      expiresIn: token.expiresIn,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
    });
  }

  const playlists = await client.getCurrentUserPlaylists();
  if (!playlists.ok) {
    console.error(`Error getting current user playlists: ${playlists.error}`);
    continue;
  }

  console.log(
    `Playlists total=${playlists.body.total}, offset=${playlists.body.offset}, limit=${playlists.body.total}`,
  );
  for (const playlist of playlists.body.items) {
    const pl = db.addPlaylist(playlist);
    if (pl === null) {
      console.log(`Playlist in db is null ${playlist.name} (${playlist.id}`);
    } else {
      console.log(`Added playlist ${pl.name} (${pl.id})`);
    }
  }
}
