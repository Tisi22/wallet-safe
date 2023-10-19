import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  UserInfo,
  WALLET_ADAPTERS
} from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { Web3AuthOptions } from '@web3auth/modal';
import { EthHashInfo } from '@safe-global/safe-react-components';
import { Box, Divider, Grid, Typography } from '@mui/material';

//import { Web3AuthEventListener } from './src1/index';

import {AuthKitSignInData} from './src1/types';
import { Web3AuthModalPack} from './src1/packes/Web3AuthModalPack';
import {Web3AuthEventListener} from './src1/packes/types'

import { ethers } from 'ethers'
import Safe, { EthersAdapter, PredictedSafeProps } from '@safe-global/protocol-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'


const connectedHandler: Web3AuthEventListener = (data) => console.log('CONNECTED', data)
const disconnectedHandler: Web3AuthEventListener = (data) => console.log('DISCONNECTED', data)

let address: string | null = null;

const login = async (web3AuthModalPack: Web3AuthModalPack | undefined) => {
  if (!web3AuthModalPack) return

  const signInInfo = await web3AuthModalPack.signIn()
  console.log('SIGN IN RESPONSE: ', signInInfo)

  address = signInInfo.eoa;

  const userInfo = await web3AuthModalPack.getUserInfo()
  console.log('USER INFO: ', userInfo)
}

function App() {

    let providerWeb3;
    let EtherProvider;
    
    const OpenSafeBox = () => {

        console.log("Entra1");
        const [web3AuthModalPack, setWeb3AuthModalPack] = useState<Web3AuthModalPack>()
        const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<AuthKitSignInData | null>(
            null
        )
        const [userInfo, setUserInfo] = useState<Partial<UserInfo>>()
        const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)
        
      
        useEffect(() => {
            ;(async () => {
              const options: Web3AuthOptions = {
                clientId: 'BMwV2h32ns4ku-xhvp2qzdjFaWdje1UrmBqk49ZEDM4zf0AhbObIw2oIEXdbs0L6ByzumL-zwgvJkqiNMiareFY',
                web3AuthNetwork: 'testnet',
                chainConfig: {
                  chainNamespace: "eip155",
                  chainId: '0x5',
                  rpcTarget: `https://eth-goerli.public.blastapi.io`
                },
                uiConfig: {
                  theme: 'dark',
                  loginMethodsOrder: ['google', 'facebook']
                }
              }
        
              const modalConfig = {
                [WALLET_ADAPTERS.TORUS_EVM]: {
                  label: 'torus',
                  showOnModal: false
                },
                [WALLET_ADAPTERS.METAMASK]: {
                  label: 'metamask',
                  showOnDesktop: true,
                  showOnMobile: false
                }
              }
        
              const openloginAdapter = new OpenloginAdapter({
                loginSettings: {
                  mfaLevel: 'mandatory'
                },
                adapterSettings: {
                  uxMode: 'popup',
                  whiteLabel: {
                    name: 'Safe'
                  }
                }
              })
        
              const web3AuthModalPack = new Web3AuthModalPack({
                txServiceUrl: 'https://safe-transaction-goerli.safe.global'
              })
        
              await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig })
        
              web3AuthModalPack.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)
              web3AuthModalPack.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)
        
              setWeb3AuthModalPack(web3AuthModalPack)

              providerWeb3 = web3AuthModalPack.getProvider();

              EtherProvider = providerWeb3 ? new ethers.providers.Web3Provider(providerWeb3) : null;
                if (!EtherProvider) return;
        
              return () => {
                web3AuthModalPack.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)
                web3AuthModalPack.unsubscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)
              }
            })()
        }, [])
      
        useEffect(() => {
          if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
            ;(async () => {
              await login(web3AuthModalPack)
            })()
          }
          
        }, [web3AuthModalPack])
      
        return (
          <>
            {safeAuthSignInResponse?.eoa && (
              <Grid container>
                <Grid item md={4} p={4}>
                  <Typography variant="h3" color="secondary" fontWeight={700}>
                    Owner account
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <EthHashInfo
                    address={safeAuthSignInResponse.eoa}
                    showCopyButton
                    showPrefix
                    prefix={getPrefix('0x5')}
                  />
                </Grid>
                <Grid item md={8} p={4}>
                  <>
                    <Typography variant="h3" color="secondary" fontWeight={700}>
                      Available Safes
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    {safeAuthSignInResponse?.safes?.length ? (
                      safeAuthSignInResponse?.safes?.map((safe, index) => (
                        <Box sx={{ my: 3 }} key={index}>
                          <EthHashInfo address={safe} showCopyButton shortAddress={false} />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1" color="secondary" fontWeight={700}>
                        No Available Safes
                      </Typography>
                    )}
                  </>
                </Grid>
              </Grid>
            )}
          </>
        )
    }

    /*const sendTransaction = async (safeAddress: string) => {  // Add async here
        if (!web3AuthModalPack || !web3AuthModalPack.getProvider()) return;
    
        const EtherProvider = provider ? new ethers.providers.Web3Provider(provider) : null;
        if (!EtherProvider) return;
        const signer = EtherProvider.getSigner();
    
        const ethAdapter = new EthersAdapter({
          ethers,
          signerOrProvider: signer || provider,
        });
    
        const safeSDK = await Safe.create({
          ethAdapter,
          safeAddress,
        });
    
        const safeTransactionData: MetaTransactionData = {
          to: '0x...',
          data: '0x...',
          value: ethers.utils.parseUnits('0.0001', 'ether').toString(),
        };
    
        const safeTransaction = await safeSDK.createTransaction({ safeTransactionData });
        return safeTransaction;
    }

    const sendTransactionEthers = async (ABI: string, contract: string, method: string, amount: string) => {
        if (!web3AuthModalPack || !web3AuthModalPack.getProvider()) return;
    
        const EtherProvider = provider ? new ethers.providers.Web3Provider(provider) : null;
        if (!EtherProvider) return;
    
        const signer = EtherProvider.getSigner();
        const contractInstance = new ethers.Contract(contract, JSON.parse(ABI), signer);

    
        try {
            const tx = await contractInstance[method](amount);
            const receipt = await tx.wait();
            // Assuming the ID is returned as a log or event in the transaction receipt
            const id = receipt.logs ? receipt.logs[0].data : null;  
            return id ? ethers.utils.parseBytes32String(id) : null;
        } catch (error) {
            console.log('Transaction error:', error);
        }
    };*/

    const getAddress = (): Promise<string | null> => {
        return Promise.resolve(address);
    };
    

    const memoizedOpenSafeBox = useMemo(() => OpenSafeBox, []);
    //const memoizedSendTransactionEthers = useMemo(() => sendTransactionEthers, [provider]);
    const memoizedGetAddress = useMemo(() => getAddress, [providerWeb3]);

    return {
        OpenSafeBox: memoizedOpenSafeBox,
        //SendTransactionEthers: memoizedSendTransactionEthers,
        getAddress: memoizedGetAddress,
    };
    
}


const getPrefix = (chainId: string) => {
  switch (chainId) {
    case '0x1':
      return 'eth'
    case '0x5':
      return 'gor'
    case '0x100':
      return 'gno'
    case '0x137':
      return 'matic'
    default:
      return 'eth'
  }
}

export default App;