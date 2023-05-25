import { useEffect, useState } from "react";
import "./App.css";
import { WalletSelect } from "@talismn/connect-components";
import { PolkadotjsWallet, SubWallet, TalismanWallet, FearlessWallet, EnkryptWallet } from "@talismn/connect-wallets"
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';



function App() {
  const [address, setAddress] = useState(null);
  

  // get an array of wallets which are installed
  const Accounts = async () => {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('talisman');

    const allExtensions = allInjected.map(({ name, version }) => `${name} ${version}`);

    // returns an array of { address, meta: { name, source } }
    // meta.source contains the name of the extension that provides this account
    const allAccounts = await web3Accounts();
    console.log(address)
    console.log(allAccounts)
  }

  const SelectedAddress = (address) => {
    setAddress(address);
  };

  const myClick = () => {
    console.log(address);
  }

  useEffect(() => {
    console.log(address);
    Accounts();
    SelectedAddress(address);
  }, [])

  return (
    <div className="App">
    {!address ? (
      <WalletSelect
      dappName={"Talisman"}
      // onlyShowInstalled
      // makeInstallable
      walletList={[
        new TalismanWallet(),
        //new SubWallet(),
        //new FearlessWallet(),
        //new EnkryptWallet(),
        new PolkadotjsWallet(),
        //new SubWallet(),
      ]}
      // onlyShowInstalled
      triggerComponent={
        <button>Open Wallets</button>
      }
      onUpdatedAccounts={(accounts) => { SelectedAddress(accounts[0].address);  }}
    />
    ) : (
      <button onClick={() => {console.log(address)}}>counter</button>
    )}
    
  </div>
  );
}

export default App;
