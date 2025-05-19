import { ScopedSpotifyClient, SpotifyClient } from "./spotify/client";
import express, { Request, Response } from "express";
import * as qs from "node:querystring";
import { v7 as uuidv7 } from "uuid";
import { JsonDatabase } from "./database";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_CALLBACK_URI } =
  process.env;
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_CALLBACK_URI) {
  console.log("missing env");
  process.exit(1);
}

const db = new JsonDatabase();
const app = express();

app.get("/login", async (req: Request, res: Response) => {
  const scope = "user-read-private";
  const state = uuidv7();
  const authState = db.addAuthState({ scope, stateId: state });
  const redirectQuery = qs.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: authState.scope,
    redirect_uri: SPOTIFY_CALLBACK_URI,
    state: authState.stateId,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${redirectQuery}`);
});

app.get("/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (
    !code ||
    typeof code !== "string" ||
    !state ||
    typeof state !== "string"
  ) {
    res.send("Erroneous code or state!");
    return;
  }

  const authState = db.getAuthState(state);
  if (!authState) {
    res.send("Invalid state!");
    return;
  }

  const client = await ScopedSpotifyClient.fromAuthorizationCode(
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    code,
    SPOTIFY_CALLBACK_URI,
  );

  if (client.scope !== authState.scope) {
    res.send("Invalid scope!");
    return;
  }

  db.removeAuthState(authState.stateId);

  const me = await client.getCurrentUser();
  if (!me.ok) {
    res.send(`Invalid response for me: ${me.error.message}`);
    return;
  }

  const userToken = db.addUserToken({
    userId: me.body.id,
    accessToken: client.accessToken,
    scope: client.scope,
    expiresIn: client.expiresIn,
    refreshToken: client.refreshToken,
    tokenType: client.tokenType,
    timestamp: new Date().toISOString(),
  });
  if (!userToken) {
    res.send(`Error processing token`);
    return;
  }

  const user = db.upsertUser(me.body.id, me.body);
  if (!user) {
    res.send(`Error processing user`);
    return;
  }

  res.send(`Thanks!
    <br>
    <a href="/">root</a>`);
});

app.get("/users", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(db.getUsers()));
});

app.get("/authstates", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(db.getAuthStates()));
});

app.get("/usertokens", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(db.getUserTokens()));
});

app.get("/dbdump", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(db.dump()));
});

app.get("/", async (req: Request, res: Response) => {
  res.send(`
    <a href="/users">/users</a>
    <br>
    <a href="/authstates">/authstates</a>
    <br>
    <a href="/usertokens">/usertokens</a>
    <br>
    <a href="/dbdump">/dbdump</a>
    <br><br>
    <a href="/login">/login</a>
    <br>
    <a href="/callback">/callback</a>
    `);
});

app.listen(3000);
