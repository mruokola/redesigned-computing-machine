import { PagedPlaylist } from "../playlist";
import { User } from "../user";
import { ApiResponse, SpotifyClient, SpotifyClientParams } from "./base";

interface ScopedSpotifyClientParams extends SpotifyClientParams {
  scope: string;
  refreshToken: string;
}

export class ScopedSpotifyClient extends SpotifyClient {
  public readonly scope: string;
  public readonly refreshToken: string;

  private constructor(params: ScopedSpotifyClientParams) {
    super(params);
    this.scope = params.scope;
    this.refreshToken = params.refreshToken;
  }

  public static async fromAuthorizationCode(
    clientId: string,
    clientSecret: string,
    code: string,
    callbackUrl: string,
  ): Promise<ScopedSpotifyClient> {
    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    const form = new URLSearchParams();
    form.append("grant_type", "authorization_code");
    form.append("code", code);
    form.append("redirect_uri", callbackUrl);
    const response: Response = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
        },
        body: form,
      },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(body));
    }

    return new ScopedSpotifyClient({
      accessToken: body.access_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in,
      scope: body.scope,
      refreshToken: body.refresh_token,
    });
  }

  public static async fromRefreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<ScopedSpotifyClient> {
    const form = new URLSearchParams();
    form.append("grant_type", "refresh_token");
    form.append("refresh_token", refreshToken);
    const response: Response = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
        },
        body: form,
      },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(body));
    }

    return new ScopedSpotifyClient({
      accessToken: body.access_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in,
      scope: body.scope,
      refreshToken: body.refresh_token,
    });
  }

  public static async fromAccessToken(
    params: ScopedSpotifyClientParams,
  ): Promise<ScopedSpotifyClient> {
    return new ScopedSpotifyClient(params);
  }

  public async getCurrentUser(): Promise<ApiResponse<User>> {
    return await this.get<User>(`v1/me`);
  }

  public async getCurrentUserPlaylists(
    limit?: number,
    offset?: number,
  ): Promise<ApiResponse<PagedPlaylist>> {
    const query = new URLSearchParams();
    if (limit) {
      // Spotify default for limit is 20 if it's not provided, not setting it here
      if (limit < 1) {
        limit = 1;
      } else if (limit > 50) {
        limit = 50;
      }
      query.append("limit", limit.toString());
    }
    if (offset) {
      // Spotify default for offset is 0 if it's not provided, not setting it here
      if (offset < 0) {
        offset = 0;
      } else if (offset > 100_000) {
        offset = 100_000;
      }
      query.append("offset", offset.toString());
    }

    return await this.get<PagedPlaylist>(
      `v1/me/playlists${query.size > 0 ? "?" + query.toString() : ""}`,
    );
  }
}
