import { useEffect, useState } from "react";
import "./App.css";
import { WalletSelect } from "@talismn/connect-components";
import { PolkadotjsWallet, SubWallet, TalismanWallet, FearlessWallet, EnkryptWallet } from "@talismn/connect-wallets"
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress  } from '@polkadot/extension-dapp';
import Keyring from '@polkadot/keyring';



function App() {
  const [address, setAddress] = useState(null);
  // 1. Input Data
  const providerWsURL = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
  const txCall =
  '0xbd0204630003000100a10f031000040000010403000f0000c16ff28623130000010403000f0000c16ff286230006010780bb4703010079012600013a67000000000000000000000000000000000000000000000000000000000000000e88b6b910d1c929854034eaf66be202fa4e1625000000000000000000000000000000000000000000000000000000000000000010e8927fbc000d0100000103004e21340c3465ec0aa91542de3d4c5f4fc1def526';

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

  const sendXCM = async () => {
    // 2. Create Substrate API Provider
    const substrateProvider = new WsProvider(providerWsURL);
    const api = await ApiPromise.create({ provider: substrateProvider });
  
    // 3. Enable extension and retrieve accounts
    await web3Enable('Bonvo cross chain');
    const accounts = await web3Accounts();
  
    if (accounts.length === 0) {
      console.error('No accounts found. Please install and unlock Polkadot.js extension wallet.');
      return;
    }
  
    const account = address; // Select the first account for signing
  
    // 4. Create Keyring Instance
    const keyring = new Keyring({ type: 'sr25519' });
  
    // 5. Create the Extrinsic
    const tx = api.tx(txCall);
    console.log(account);
    // 6. Sign the transaction using the extension-dapp wallet
    const injector = await web3FromAddress(account);
    console.log(injector)
    tx.signAndSend(account, { signer: injector.signer }, ({ status, events }) => {
      if (status.isInBlock) {
        console.log(`Transaction included in block with hash: ${status.asInBlock}`);
      } else if (status.isFinalized) {
        console.log(`Transaction finalized at block hash: ${status.asFinalized}`);
      } else if (status.isError) {
        console.error('Transaction error:', status.asError);
      }
    });
  
    api.disconnect();
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
      <button onClick={async() => {await sendXCM()}}>counter</button>
    )}
    
  </div>
  );
}

export default App;
