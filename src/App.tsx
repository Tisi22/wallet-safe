import React, { useEffect, useCallback, useState, Fragment } from 'react';
import { Unity, useUnityContext } from "react-unity-webgl";
import OpenSafeBox from './SafeBox';
//import App from './SafeBoxTry';


function AppUnity() {

  const [isConnect, setIsConnect] = useState(false);

  //const { OpenSafeBox, getAddress } = App();

  //UNITY
  const { unityProvider, addEventListener, removeEventListener, sendMessage } =
  useUnityContext({
    loaderUrl: "Build/Test.loader.js",
    dataUrl: "Build/Test.data",
    frameworkUrl: "Build/Test.framework.js",
    codeUrl: "Build/Test.wasm",
  });


  const OpenSafe = useCallback(() => {
    setIsConnect(true);
    console.log("Work");

    /*getAddress().then(address => {
      let attempts = 0;
      // Loop to keep trying if address is null
      while (address == null && attempts < 5) {
          // Since getAddress returns a promise, you'll need to handle it each time
          getAddress().then(newAddress => {
              address = newAddress;
          });
          attempts += 1;
          console.log('Attempt', attempts, 'address:', address);  // Debug log
      }
      if (address != null) {
          sendMessage("ConnectSafe", "setAccount", address);
      } else {
          console.error('Failed to retrieve address after 5 attempts');
      }
    });*/

  }, []); //[getAddress, sendMessage]); 

  /*const SendTransactionUnity = useCallback(() => {
    const ABIObject = [
      {
        "constant": false,
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "mint",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const ABI = JSON.stringify(ABIObject); 
    const contract = "0x.....";
    const method = "mint";
    const amount = "1"; 
    SendTransactionEthers(ABI, contract, method, amount);
  }, []);*/

  

  useEffect(() => {
    addEventListener("ConnectSafe", OpenSafe);
    //addEventListener("SendTransaction", SendTransactionUnity);
    return () => {
      removeEventListener("ConnectSafe", OpenSafe);
      //removeEventListener("SendTransaction", SendTransactionUnity);
    };
  }, [addEventListener, removeEventListener, OpenSafe]);

  return (
    <>
      <Unity unityProvider={unityProvider} style={{ width: 1100, height: 700 }} />
      {isConnect && <OpenSafeBox />}
    </>
  );

}



export default AppUnity
