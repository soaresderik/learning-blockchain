import { contractAddress, abi } from './constants.js';
import { ethers } from './ethers-5.6.min.js'

(async() => {
    while(typeof window.ethereum == "undefined") {
        alert("No metamask");
    }

    const connectBtn = document.querySelector("#connectBtn");
    const balanceBtn = document.querySelector("#balanceBtn");
    const withdrawBtn = document.querySelector("#withdrawBtn");
    const fundBtn = document.querySelector("#fundBtn");

    connectBtn.onclick = connect;
    balanceBtn.onclick = getBalance;
    withdrawBtn.onclick = withdraw;
    fundBtn.onclick = fund;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    async function getBalance() {
        try {
            const balance = await provider.getBalance(contractAddress);
            console.log(ethers.utils.formatEther(balance));
        } catch (error) {
            console.log(error);
        }
    }

    async function withdraw() {
        console.log("Sacando...");
        try {
            await provider.send("eth_requestAccounts", []);

            const response = await contract.withdraw();
            await listenTxMine(response, provider);
        } catch (error) {
            console.log(error);
        }
    }

    async function connect() {
        await window.ethereum.request({ method: "eth_requestAccounts"})
        connectBtn.innerHTML = "Connected!";
    }

    async function fund() {
        const amount = document.querySelector("#ethAmount").value;
        console.log(`Funding with ${amount}...`);

        try {
            const txResponse = await contract.fund({ value: ethers.utils.parseEther(amount)});
            await listenTxMine(txResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }

    function listenTxMine(txResponse, provider) {
        console.log(`Minning ${txResponse.hash}`);
        return new Promise((res, rej) => {
            try {
                provider.once(txResponse.hash, (receipt) => {
                    console.log(`Completed with ${receipt.confirmations} confirmations`);
                });

                res();
            } catch (err) {
                rej(err);
            }
        })
    }

})()

