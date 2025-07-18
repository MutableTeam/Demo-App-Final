export const IDL = {
  version: "0.1.0",
  name: "mutable_platform",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "platform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createGame",
      accounts: [
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "gameId",
          type: "string",
        },
        {
          name: "wagerAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "joinGame",
      accounts: [
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Platform",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "totalGames",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Game",
      type: {
        kind: "struct",
        fields: [
          {
            name: "gameId",
            type: "string",
          },
          {
            name: "players",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "wagerAmount",
            type: "u64",
          },
          {
            name: "status",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "GameFull",
      msg: "Game is already full",
    },
    {
      code: 6001,
      name: "GameNotFound",
      msg: "Game not found",
    },
  ],
}
