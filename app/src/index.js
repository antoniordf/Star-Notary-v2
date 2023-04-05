import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

document.addEventListener("DOMContentLoaded", function () {
  const createStarButton = document.getElementById("createStar");
  createStarButton.addEventListener("click", App.createStar.bind(App));
});

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    const starName = document.getElementById("starName");
    const starId = document.getElementById("starId");

    if (starName === null || starId === null) {
      console.error(
        "Star Name or Star ID input elements are not available yet"
      );
      return;
    }

    const name = starName.value;
    const id = starId.value;

    const { createStar } = this.meta.methods;
    console.log(createStar);
    await createStar(name, id).send({ from: this.account });
    App.setStatus(`New Star Owner is ${this.account}.`);
  },
};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live"
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545")
    );
  }

  App.start();
});
