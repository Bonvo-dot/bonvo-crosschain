import { useEffect, useState } from "react";
import "./App.css";
import { WalletSelect } from "@talismn/connect-components";
import { PolkadotjsWallet, TalismanWallet } from "@talismn/connect-wallets"
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource, web3FromAddress } from '@polkadot/extension-dapp';
import { signatureVerify } from '@polkadot/util-crypto';

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

    const account = accounts[0]; // Select the first account for signing
    console.log('account:', accounts[0]);

    const injector = await web3FromAddress(account.address);
    // const injector = await web3FromSource(account.meta.source);
    const signRaw = injector?.signer?.signRaw;

    // Option A: First sign message
    // if (!!signRaw) {
    //   // after making sure that signRaw is defined
    //   // we can use it to sign our message

    //   const { signature } = await signRaw({
    //       address: account.address,
    //       data: txCall,
    //       type: 'bytes',
    //       version: substrateProvider.EXTRINSIC_VERSION // Added this to prevent error: Unsupported unsigned extrinsic version 116
    //   });
    //   console.log("Got signed message: ", signature);
    //   const { isValid } = signatureVerify(txCall, signature, account.address);
    //   console.log("Is valid signature: ", isValid);

    //   // NO idea if this is how to send it. 
    // }

    // Option B: Sign and send message. Fails even before signing with Invalid base58 character "[" (0x5b) at index 0
    const injector2 = await web3FromAddress(account.address);
    const signer = injector2.signer;
    api.setSigner(signer);
    await api.tx(txCall).signAndSend(account.address, { signer }, (result) => {
      if (result.status.isInBlock) {
        console.log(`Transaction included in blockHash ${result.status.asInBlock}`);
      }
    });
    api.disconnect();
  };

  useEffect(() => {
    console.log(address);
    Accounts();
    SelectedAddress(address);
  }, [])

  const [buttonText, setButtonText] = useState('Open Wallet');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleClick = () => {
    setButtonClicked(!buttonClicked);
    debugger;

    if (!address) {
      setButtonText('Try It');
    } else {
      sendXCM();
      setButtonDisabled(true);
    }

    // Add functionality for the button click here
  };

  return (
    <div className="App">


      <div className="container">
        <header>
          <img src="https://static.wixstatic.com/media/04671a_4e5e50c23d7d4af68347b565ba1bdbed~mv2.png/v1/fill/w_1000,h_123,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/04671a_4e5e50c23d7d4af68347b565ba1bdbed~mv2.png" className="logo" alt="logo" />
          <h1 className="title">Bonvo Rental POC</h1>
          <h2 className="subtitle">Cross-Chain XCM proof of concept to use the moonbase Uniswap functionality</h2>
        </header>
        <main>
          <p className="description">
            Implementing XCM features is crucial for our platform as it enhances interoperability and expands the functionality of our blockchain ecosystem. By integrating XCM, we can seamlessly communicate and interact with other blockchains within the Polkadot ecosystem, tapping into Moonbeam's EVM and unlocking collaboration opportunities. This enables our platform to leverage the benefits of multiple chains, bridge the gap between networks, and provide enhanced services and user experiences. Overall, XCM empowers our platform to be an innovative player in the blockchain landscape, fostering growth and expanding possibilities for our users.
            <br /><br />
            <b>Reference:</b>
            <br /> Info on XCM and Moonbase: <a href="https://docs.moonbeam.network/tutorials/interoperability/uniswapv2-swap-xcm/">Uniswap V2 Swap from Polkadot via XCM</a>
            <br />info cross-chain messaging: <a href="https://docs.moonbeam.network/learn/features/xchain-plans/">Cross-Chain integration</a>
          </p>

          {!address ?
            <WalletSelect
              dappName={"Talisman"}
              walletList={[
                new TalismanWallet(),
                new PolkadotjsWallet(),
              ]}
              triggerComponent={
                <button
                  className={`cta-button`}
                  onClick={handleClick}
                  disabled={buttonDisabled}
                >
                  {buttonText}
                </button>
              }
              onUpdatedAccounts={(accounts) => { SelectedAddress(accounts[0].address); }}
            />
            : <button
              className={`cta-button clicked`}
              onClick={handleClick}
              disabled={buttonDisabled}
            >
              {buttonText}
            </button>
          }

        </main>
        <footer>
          <p>Created by</p>

          <a href="https://bonvonft.com"><img src="https://www.bonvonft.com/assets/img/logo_floating.png" className="logo" alt="logo" /></a>
          <p>&copy; 2023 Bonvo. All rights reserved.</p>
        </footer>
      </div>




    </div>
  );
}

export default App;
