import { Track } from "./track";

interface Error {
  status: Number;
  message: string;
}

interface ClientCredentials {
  access_token: string;
  token_type: string;
  expires_in: Number;
}

export class SpotifyClient {
  private constructor(
    private readonly accessToken: string,
    private readonly tokenType: string,
    private readonly expiresIn: string,
  ) {}

  public static async fromClientCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<SpotifyClient> {
    // https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
    const response: Response = await fetch(
      `https://accounts.spotify.com/api/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(body));
    }
    return new SpotifyClient(
      body.access_token,
      body.token_type,
      body.expires_in,
    );
  }

  public async get<T>(endpoint: string): Promise<T | Error> {
    const response: Response = await fetch(
      `https://api.spotify.com/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    const body: any = await response.json();
    if (response.ok) {
      return body as T;
    }
    return body as Error;
  }

  public async getTrack(id: string): Promise<Track | Error> {
    return await this.get<Track>(`v1/tracks/${id}`);
  }
}
