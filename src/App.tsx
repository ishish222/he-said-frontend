import React, { useRef, useEffect, useState } from "react";
import "@fuel-wallet/sdk";
import { keccak256 } from 'js-sha3';
import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { HeSaidContractAbi__factory } from "./contracts";

// The address of the contract deployed the Fuel testnet
const CONTRACT_ID =
  "0x1bd8c524f06ceeb7dc8bcf6d206c885d57b74cd4fb440518f8fffe15158503e7";

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('Type something here...');
  const [verdictValue, setVerdictValue] = useState('Unknown');

  useEffect(() => {
    setTimeout(() => {
      checkConnection();
      setLoaded(true);
    }, 200)
  }, [connected])

  async function connect() {
    if (window.fuel) {
     try {
       await window.fuel.connect();
       const [account] = await window.fuel.accounts();
       setAccount(account);
       setConnected(true);
     } catch(err) {
       console.log("error connecting: ", err);
     }
    }
   }

  async function checkConnection() {
    if (window.fuel) {
      const isConnected = await window.fuel.isConnected();
      if (isConnected) {
        const [account] = await window.fuel.accounts();
        setAccount(account);
        setConnected(true);
      }
    }
  }

  async function say() {
    if (window.fuel) {
      const wallet = await window.fuel.getWallet(account);
      const contract = HeSaidContractAbi__factory.connect(CONTRACT_ID, wallet);
      // Creates a transactions to call the increment function
      // because it creates a TX and updates the contract state this requires the wallet to have enough coins to cover the costs and also to sign the Transaction
      try {
        const hash = keccak256(inputValue);
        let hashString = "0x" + hash.toString();
        console.log("Calculated hash:"+hashString);
        await contract.functions.say(hashString).txParams({ gasPrice: 1 }).call();
      } catch(err) {
        console.log("error sending transaction...", err);
      }
    }
  }

  async function did_say() {
    if (window.fuel) {
      const wallet = await window.fuel.getWallet(account);
      const contract = HeSaidContractAbi__factory.connect(CONTRACT_ID, wallet);
      // Creates a transactions to call the increment function
      // because it creates a TX and updates the contract state this requires the wallet to have enough coins to cover the costs and also to sign the Transaction
      try {
        const hash = keccak256(inputValue);
        let hashString = "0x" + hash.toString();
        console.log("Calculated hash:"+hashString);
        const { value } = await contract.functions.did_say(hashString).get();
        if(value == true) {
          console.log("True");
          setVerdictValue("True");
        } else {
          console.log("False");
          setVerdictValue("False");
        }
      } catch(err) {
        console.log("error sending transaction...", err);
      }
    }
  }

  if (!loaded) return null
  
  return (
    <>
      <div className="App">
        {
          connected ? (
            <>
               <h3>He Said She Said</h3><br/>
               <input type="text" placeholder={inputValue} onChange={event => setInputValue(event.target.value)}/>
               <br />
               <input type="text" placeholder={verdictValue} />
               <br />
               <button style={buttonStyle} onClick={say}>
                Say
              </button><br />
              <button style={buttonStyle} onClick={did_say}>
                Did say?
              </button><br />
            </>
          ) : (
            <button style={buttonStyle} onClick={connect}>Connect</button>
          )
        }
      </div>
    </>
  );
}

export default App;

const buttonStyle = {
  borderRadius: "48px",
  marginTop: "10px",
  backgroundColor: "#03ffc8",
  fontSize: "20px",
  fontWeight: "600",
  color: "rgba(0, 0, 0, .88)",
  border: "none",
  outline: "none",
  height: "60px",
  width: "400px",
  cursor: "pointer"
}
