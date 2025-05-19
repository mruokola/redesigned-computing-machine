import { Track } from "../track";

export interface Error {
  status: Number;
  message: string;
}

export type ApiSuccessResponse<T> = { ok: true; body: T };
export type ApiFailureResponse = { ok: false; error: Error };
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export interface SpotifyClientParams {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export class SpotifyClient {
  public readonly accessToken: string;
  public readonly tokenType: string;
  public readonly expiresIn: number;

  protected constructor(params: SpotifyClientParams) {
    this.accessToken = params.accessToken;
    this.tokenType = params.tokenType;
    this.expiresIn = params.expiresIn;
  }

  public static async fromClientCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<SpotifyClient> {
    // https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
    const form = new FormData();
    form.append("grant_type", "client_credentials");
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
    return new SpotifyClient({
      accessToken: body.access_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in,
    });
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response: Response = await fetch(
      `https://api.spotify.com/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    const body: any = await response.json();
    if (!response.ok) {
      return { ok: false, error: body as Error };
    }
    return { ok: true, body: body as T };
  }

  public async getTrack(id: string): Promise<ApiResponse<Track>> {
    return await this.get<Track>(`v1/tracks/${id}`);
  }
}
