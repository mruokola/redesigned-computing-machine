export interface UserToken {
  userId: string;
  accessToken: string;
  scope: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
  timestamp: string;
}

export interface UserAuthState {
  stateId: string;
  scope: string;
}
