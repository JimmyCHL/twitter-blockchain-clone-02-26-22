require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/ZXOYtt4PUUREUHWhHdMFjRhYf3sZOo_u",
      accounts: [
        "3106623c49435e6175f24fcc31a0baa52c38b6a4014054b356f3eea868c37953",
      ],
    },
  },
};
