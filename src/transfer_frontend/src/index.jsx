import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

import { Audio } from 'react-loader-spinner'

import PlugConnect from '@psychedelic/plug-connect';
import { Principal } from '@dfinity/principal';

import ext721Did from "../idls/ext721.did";


import { getAccountId, getTokenIdentifier } from '../components/utils';

import {
  getCachedUserNFTs,
  getNFTActor,
  NFTCollection,
  NFTDetails,
  getTokenActor,
  TokenInterfaces,
  getAddresses,
  addAddress,
  removeAddress,
  getAllUserNFTs,
  FungibleMetadata,
} from '@psychedelic/dab-js';

const App = () => {

  const [collectionCanister, setCollectionCanister] = useState("");
  const [princiapals, setPrincipals] = useState([]);
  const [connect, setConnect] = useState("Please Connect you Wallet!");
  const [loader, setLoader] = useState(false);
  const [from, setFrom] = useState("");

  //plug connection and method call
  const whitelist = ["rw7qm-eiaaa-aaaak-aaiqq-cai", "gikg4-eaaaa-aaaam-qaieq-cai"];


  const handleCollectionChange = async (event) => {
    setCollectionCanister(event.target.value);
    // console.log(collectionCanister)
  }
  const handlePrincipalChange = async (event) => {
    const str = event.target.value;
    setPrincipals(str.split(','));
  }
  // const handleIndexChange = async (event) => {
  //   const str = event.target.value;
  //   setTokenIndex(str.split(','));
  // }

  const handleTransfer = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    // const collectionActor = await window.ic.plug.createActor({
    //   canisterId: CollectionCanisterId,
    //   interfaceFactory: ext721Did,
    // });

    setLoader(true)
    try {
      const tokenIds = [];
      const userCollection = await getNFTCollections();
      for(let i = 0; i< userCollection.length; i++){
        if(userCollection[i].canisterId == collectionCanister){
          // console.log(userCollection[i]);
          const obj = userCollection[i].tokens;
          for(let j = 0;j<obj.length;j++){
            tokenIds.push(obj[j].id);
          }
        }
      }
      console.log(tokenIds)


      const sessionData = window.ic.plug.sessionManager.sessionData;
      const to = princiapals;
      const tokenIdentifiers = tokenIds;
      const f = sessionData.principalId;
      const dummyMemmo = new Array(32).fill(0);
      setFrom(f);

      const txs = [];
      if(tokenIdentifiers.length < to.length){
        console.log(tokenIdentifiers);
        console.log(to);
        alert("You do not hold enoguh NFT's in this collection!");
        setLoader(false);
        return;
      }
      for(let i = 0; i< to.length; i++){
        const tx = {
          idl: ext721Did,
          canisterId: collectionCanister,
          methodName: 'transfer',
          args: [{
            to: { principal: Principal.fromText(to[i])},
            from: { principal: Principal.fromText(f)},
            token: tokenIdentifiers[i],
            amount: BigInt(1),
            memo: new Array(32).fill(0),
            notify: false,
            subaccount: [],
          }],
          onSuccess: async (res) => {
            console.log('transfer success!');
          },
          onFail: (res) => {
            console.log('transfer error', res);
          },
        };
        txs.push(tx);
      }

      await window.ic.plug.batchTransactions(txs)
    }
    catch (err) {
      console.log(err);
      setLoader(false)
    }
    setLoader(false)
  };

  const getNFTCollections = async (event) => {
    const principal = from;
    const agent = window.ic.plug.agent;
    const sessionData = window.ic.plug.sessionManager.sessionData;
    const f = sessionData.principalId;
    const collections = await getAllUserNFTs({
      agent,
      user: f
    });
    // console.log(JSON.stringify(collections, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    return collections;
  }

  const ConnectCallback = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (isConnected) {
      setConnect("Connected!");
    }
    else {
      setConnect("Please Connect you Wallet!");
    }
  };

  useEffect(() => {
    async function checkConnection() {
      const isConnected = await window.ic.plug.isConnected();
      if (isConnected) {
        setConnect("Connected!");
      }
    }
    checkConnection();
  }, []);


  return (
    <div style={{ "fontSize": "30px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "center", backgroundColor: "Black", position: "fixed", width: "100%" }}>
          <div style={{ marginRight: 50 }}>
            {
              loader && (<Audio
                height="30"
                width="30"
                radius="9"
                color='green'
                ariaLabel='three-dots-loading'
                wrapperStyle
                wrapperClass
              />)
            }
          </div>
          <div style={{ color: "Green", backgroundColor: "Yellow", marginRight: 100 }}>
            {connect}
          </div>
          <div>
            <PlugConnect
              dark='true'
              whitelist={whitelist}
              onConnectCallback={ConnectCallback}
            />
          </div>
        </div>
        <br></br>
        <div style={{ marginTop: 50 }}>
          <div>Transfer NFT of Collection from your wallet!</div>
          <div><input
            style={{ width: 1000, height: 30 }}
            name="Collection"
            placeholder="Collection Canister ID?"
            required
            onInput={handleCollectionChange}
            value={collectionCanister}
          ></input>
          </div>
          <div><input
            style={{ width: 1000, height: 30 }}
            name="principals"
            placeholder="principal ids?"
            required
            onInput={handlePrincipalChange}
            value={princiapals}
          ></input>
          </div>
          {/* <div><input
            name="indices"
            placeholder="Nft indices? (, separated)?"
            required
            onInput={handleIndexChange}
            value={tokenIndex}
          ></input>
          </div> */}
          <button
            style={{ backgroundColor: "black", color: "white", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 1000, height: 30 }}
            className=""
            onClick={handleTransfer}>
            Transfer
          </button>
        </div>
      </div>
      <br></br>
      <br></br>
      {/* <div>
        <button
          style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 200, height: 50 }}
          className=""
          onClick={getNFTCollections}>
          Check NFT Balance?
        </button>
        <div>{balance}</div>
      </div> */}
    </div>
  );
};

render(<App />, document.getElementById("app"));