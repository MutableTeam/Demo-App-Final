export const IDL = {
  version: "0.1.0",
  name: "mutable_platform",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "mutablePlatform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
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
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidInstruction",
      msg: "Invalid Instruction",
    },
  ],
}
