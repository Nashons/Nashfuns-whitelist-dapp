import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  //walletConnected keeps track of whether users wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  //joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

   // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

   // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3modalRef = useRef();

   /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

   const getProviderOrSigner = async (needSigner = false) => {
    //connect to metamask
    //since we store web3modal as a reference, we need to access the current value to get access to the underlying object
    const provider = await web3modalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if user is not connected to the goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if ( chainId !== 5){
      window.alert("change network to goerli");
      throw new Error("change network to rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer
    }
    return web3Provider
   }

   /**
    * addAddressToWhitelist adds the current connected address to the whitelist
    */

   const addAddressToWhitelist = async () => {
    try{
      //we need a signer here since this is a write transaction
      const signer = await getProviderOrSigner(true);

      //create a new instance of the contract with a signer which allows update methods
      const whiteListContract = new Contract (
        WHITELIST_CONTRACT_ADDRESS, abi, signer
      );

      //call the addAddressToWhitelist from the contract 
      const tx = await whiteListContract.addAddressToWhitelist();
      setLoading(true);

      //wait for the tx to get mined
      await tx.wait();
      setLoading(false);

      //get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err)
    }
   }

   /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
   const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

   /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */

   const checkIfAddressInWhitelist = async () => {
    try {
      //we will need the signer later to get the users address
      //even though it is a read transaction, since signers are just special kinds of providers, 
      //we can use it in its place
      const signer = await getProviderOrSigner(true);
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      //get the address associated to the signer which is connected to metamask
      const address = await signer.getAddress();
      //call the whitelistedAddress from the contract
      const _joinedWhitelist = await whiteListContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
   };

   //connnect wallet: connects the metamask wallet
   const connectWallet = async () => {
    try{
      //get the provider from web3modal, which in our case is metamask
      //when used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
   };

   //renderButton: Returns a button based on the state of the dapp
   const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist){
        return (
          <div className = {styles.description}>Thanks for joining the whitelist</div>
        )
      } else if (loading) {
        return <button className={styles.button} >Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>Join the Whitelist</button>
        );
      }
    } else {
      return (
        <button onClick = {connectWallet} className={styles.button}>connect your Wallet</button>
      );
    }
   };

   //useEffects are used to react to changes in state of the website
   //The array at the end of function call represents what state changes will triger thus effect
   //in this case whenever the value of walletConnected changes, this effect will be called
useEffect(() => {
  //if wallet is not connected, create a new instance of web3modal and connect the metamask wallet
  if (!walletConnected){
  //The 'current' value is persisted throughout as long as this page is open
  web3modalRef.current = new Web3Modal({
    network: "goerli",
    providerOptions: {},
    disableInjectedProvider: false,
  });
  connectWallet();
  }
}, [walletConnected]); 

return (
  <div>
    <Head>
      <title>Whitelist Dapp</title>
      <meta name = "description" content = "whitelist-Dapp"/>
      <link rel = "icon" href= "/favicon.ico"/>
    </Head>
   <div className={styles.main}>
    <div className={styles.inner}>
    <div>
      <h1 className={styles.title}>Welcome to NashFuns Whitelist Dapp</h1>
      <div className = {styles.description}>
        Its an NFT collection for Nash Funs
      </div>
      <div className = {styles.description}>
        {numberOfWhitelisted} have already joined
      </div>
      {renderButton()}
    </div>
    <div>
      <img className = {styles.image} src = "./whitelist.png" />
    </div>
   </div>
   </div>
   <footer className = {styles.footer}>BY NASHONS AGATE</footer>
  </div>
)
}