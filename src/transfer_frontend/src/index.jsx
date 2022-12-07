import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

import { Audio } from 'react-loader-spinner'

import PlugConnect from '@psychedelic/plug-connect';
import { Principal } from '@dfinity/principal';


import { getAccountId, getTokenIdentifier } from '../components/utils';
import ext721 from '../idls/ext721.did'

const App = () => {

  const [collectionCanister, setCollectionCanister] = useState("");
  const [princiapals, setPrincipals] = useState("");
  const [connect, setConnect] = useState("Please Connect you Wallet!");
  const [loader, setLoader] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [from, setFrom] = useState("");

  //plug connection and method call
  const CollectionCanisterId = "rw7qm-eiaaa-aaaak-aaiqq-cai";
  const whitelist = [CollectionCanisterId];

  //transfer request
  // const TransferRequest = IDL.Record({
  //   'to' : User,
  //   'token' : TokenIdentifier,
  //   'notify' : IDL.Bool,
  //   'from' : User,
  //   'memo' : Memo,
  //   'subaccount' : IDL.Opt(SubAccount),
  //   'amount' : Balance,
  // });

  const sample_batch = {
    idl: ext721,
    canisterId: CollectionCanisterId,
    methodName: 'transfer',
    args: [Principal.fromText(princiapals),
    getTokenIdentifier(CollectionCanisterId, tokenIndex),
    false,
    Principal.fromText(from),
    [],
    null,
    Number(1)
    ],
    onSuccess: async (res) => {
      alert('transferred xtc successfully');
    },
    onFail: (res) => {
      alert('transfer xtc error', res);
    },
  };

  const handleTransfer = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const collectionActor = await window.ic.plug.createActor({
      canisterId: CollectionCanisterId,
      interfaceFactory: collectionCanisterIDL,
    });

    try {
      setLoader(true)
      const sessionData = window.ic.plug.sessionManager.sessionData;
      const to = princiapals;
      const f = sessionData.principalId;
      setFrom(f);
      const transactions = [sample_batch];
      await window.ic.plug.batchTransactions(transactions)
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
    }
  };

  const ConnectCallback = async (event) => {
    setWallet(window.ic.plug.principalId);
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
              whitelist={whitelist}
              onConnectCallback={ConnectCallback}
            />
          </div>
        </div>
        <br></br>
        <div style={{ marginTop: 50 }}>
          <div>Transfer NFT of Collection from your wallet!</div>
          <div><input
            name="Collection"
            placeholder="Collection Canister ID?"
            required
            onChange={(event) => setCollectionCanister(event.target.value)}
            value={collectionCanister}
          ></input>
          </div>
          <div><input
            name="principals"
            placeholder="principal ids?"
            required
            onChange={(event) => setPrincipals(event.target.value)}
            value={princiapals}
          ></input>
          </div>
          <button
            style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
            className=""
            onClick={handleTransfer}>
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));