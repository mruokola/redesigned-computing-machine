# redesigned-computing-machine

⚠️ Work in progress ⚠️

This project's purpose is to build something to archive and version a Spotify user's data such as playlists (created by, followed, an such) and listening habits (artists, albums, genres, etc.), and then later on to do some sort of analytics based on the data.

## Architecture

(Draft)

The main driving goals in architectural decisions are cost-efficiency and getting to run it on someone else's computer (cloud), while going about the planning and implementation as properly as I can and hopefully according to best practices. Of course this is also a learning exercise.

Thus the stack right now will be a bunch of AWS Lambda functions, DynamoDB, API Gateway and EventBridge:

![Architecture diagram with AWS services](./docs/architecture.png)

### Other documentation

(Draft)

Other documentation includes:

-   Sequence diagram for user authentication: [./docs/user authentication.mmd](./docs/user%20authentication.mmd)

## Usage (aka testing)

Tested with: Node v23.11.0, PNPM 9.11.0, tsc 5.4.5

```shell
pnpm i
```

### Express server for user auth

```shell
pnpm run start
```

Visit <http://127.0.0.1:3000/login>

All endpoints available at: <http://127.0.0.1:3000/>

Database is located in `db.json`

### Scheduled tasks

```shell
pnpm run scheduled
```

Fetches and stores each stored user's owned playlists

Database is located in `db.json`
