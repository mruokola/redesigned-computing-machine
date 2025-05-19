import { LowSync } from "lowdb/lib";
import { UserAuthState, UserToken } from "./model/user";
import { User } from "./spotify/user";
import { JSONFileSyncPreset } from "lowdb/node";
import { SimplifiedPlaylist } from "./spotify/playlist";

// TODO generic functions for each Spotify entity
// TODO maybe predicate as param for lowdb
interface Database {
  upsertUser(
    id: User["id"],
    user: Omit<Partial<User>, "id">,
  ): User | Promise<User>;
  getUser(id: User["id"]): User | Promise<User | null> | null;
  getUsers(): User[] | Promise<User[]>;

  addAuthState(
    authState: UserAuthState,
  ): UserAuthState | Promise<UserAuthState>;
  getAuthState(
    state: UserAuthState["stateId"],
  ): UserAuthState | Promise<UserAuthState | null> | null;
  removeAuthState(
    stateId: UserAuthState["stateId"],
  ): boolean | Promise<boolean>;
  getAuthStates(): UserAuthState[] | Promise<UserAuthState[]>;

  addUserToken(userToken: UserToken): UserToken | Promise<UserToken>;
  getUserToken(
    id: UserToken["userId"],
  ): UserToken | Promise<UserToken | null> | null;
  getUserTokens(): UserToken[] | Promise<UserToken[]>;
  upsertUserToken(
    id: UserToken["userId"],
    userToken: Omit<UserToken, "id">,
  ): UserToken | Promise<UserToken | null> | null;

  addPlaylist(
    playlist: SimplifiedPlaylist,
  ): SimplifiedPlaylist | Promise<SimplifiedPlaylist | null> | null;
  getPlaylist(
    id: SimplifiedPlaylist["id"],
  ): SimplifiedPlaylist | Promise<SimplifiedPlaylist | null> | null;
  getUserPlaylists(
    id: SimplifiedPlaylist["owner"]["id"],
  ): SimplifiedPlaylist[] | Promise<SimplifiedPlaylist[]>;
  getPlaylists(): SimplifiedPlaylist[] | Promise<SimplifiedPlaylist[]>;
  upsertPlaylist(
    id: SimplifiedPlaylist["id"],
    playlist: Omit<SimplifiedPlaylist, "id">,
  ): SimplifiedPlaylist | Promise<SimplifiedPlaylist | null> | null;

  dump(): any | Promise<any>;
}

interface JsonData {
  users: User[];
  userAuthStates: UserAuthState[];
  userTokens: UserToken[];
  playlists: SimplifiedPlaylist[];
}

export class JsonDatabase implements Database {
  private db: LowSync<JsonData>;

  public constructor() {
    this.db = JSONFileSyncPreset<JsonData>("db.json", {
      users: [],
      userAuthStates: [],
      userTokens: [],
      playlists: [],
    });
    // Init possibly empty db tables
    if (!this.db.data.users) {
      this.db.data.users = [];
    }
    if (!this.db.data.userAuthStates) {
      this.db.data.userAuthStates = [];
    }
    if (!this.db.data.userTokens) {
      this.db.data.userTokens = [];
    }
    if (!this.db.data.playlists) {
      this.db.data.playlists = [];
    }
  }

  dump(): any {
    return this.db.data;
  }

  upsertUser(id: User["id"], user: Omit<User, "id">): User {
    const index = this.db.data.users.findIndex((u) => u.id === id);
    if (index === -1) {
      const newLength = this.db.data.users.push({ ...user, id });
      this.db.write();
      return this.db.data.users[newLength - 1];
    }
    const existingUser = this.db.data.users[index];
    this.db.data.users[index] = { ...user, id };
    this.db.write();
    return this.db.data.users[index];
  }

  getUser(id: User["id"]): User | null {
    const index = this.db.data.users.findIndex((u) => u.id === id);
    return index === -1 ? null : this.db.data.users[index];
  }

  getUsers(): User[] {
    return this.db.data.users;
  }

  addAuthState(authState: UserAuthState): UserAuthState {
    this.db.data.userAuthStates.push(authState);
    this.db.write();
    return authState;
  }

  getAuthState(id: UserAuthState["stateId"]): UserAuthState | null {
    const index = this.db.data.userAuthStates.findIndex(
      (s) => s.stateId === id,
    );
    if (index === -1) {
      return null;
    }
    return this.db.data.userAuthStates[index];
  }

  getAuthStates(): UserAuthState[] {
    return this.db.data.userAuthStates;
  }

  removeAuthState(stateId: UserAuthState["stateId"]): boolean {
    const oldLen = this.db.data.userAuthStates.length;
    this.db.data.userAuthStates = this.db.data.userAuthStates.filter(
      (s) => s.stateId !== stateId,
    );
    this.db.write();
    return this.db.data.userAuthStates.length === oldLen;
  }

  addUserToken(userToken: UserToken): UserToken {
    const newLength = this.db.data.userTokens.push(userToken);
    this.db.write();
    return this.db.data.userTokens[newLength - 1];
  }

  getUserToken(id: UserToken["userId"]): UserToken | null {
    const index = this.db.data.userTokens.findIndex((t) => t.userId === id);
    if (index === -1) {
      return null;
    }
    return this.db.data.userTokens[index];
  }

  getUserTokens(): UserToken[] {
    return this.db.data.userTokens;
  }

  upsertUserToken(
    id: UserToken["userId"],
    userToken: Omit<UserToken, "userId">,
  ): UserToken | null {
    const index = this.db.data.userTokens.findIndex((t) => t.userId === id);
    if (index === -1) {
      return this.addUserToken({ ...userToken, userId: id });
    }
    this.db.data.userTokens[index] = { ...userToken, userId: id };
    this.db.write();
    return this.db.data.userTokens[index];
  }

  addPlaylist(playlist: SimplifiedPlaylist): SimplifiedPlaylist | null {
    const newLength = this.db.data.playlists.push(playlist);
    this.db.write();
    return this.db.data.playlists[newLength - 1];
  }
  getPlaylist(id: SimplifiedPlaylist["id"]): SimplifiedPlaylist | null {
    const index = this.db.data.playlists.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    return this.db.data.playlists[index];
  }
  getUserPlaylists(
    id: SimplifiedPlaylist["owner"]["id"],
  ): SimplifiedPlaylist[] {
    return this.db.data.playlists.filter((p) => p.owner.id === id);
  }
  getPlaylists(): SimplifiedPlaylist[] {
    return this.db.data.playlists;
  }
  upsertPlaylist(
    id: SimplifiedPlaylist["id"],
    playlist: Omit<SimplifiedPlaylist, "id">,
  ): SimplifiedPlaylist | null {
    const index = this.db.data.playlists.findIndex((p) => p.id === id);
    if (index === -1) {
      return this.addPlaylist({ ...playlist, id: id });
    }
    this.db.data.playlists[index] = { ...playlist, id: id };
    this.db.write();
    return this.db.data.playlists[index];
  }
}
