import { ChainId } from 'moonbeamswap'
import React from 'react'

import { Text } from 'rebass'

import styled from 'styled-components'

import Logo from '../../assets/images/mainlogo.png'
import { useActiveWeb3React } from '../../hooks'
//import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'

import Settings from '../Settings'
import Menu from '../Menu'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import { bananasAddress, bananasABI} from '../conf.js'
import { ethers } from 'ethers'
// import VersionSwitch from './VersionSwitch'

declare let window: any;

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  text-decoration: none;
  text-decoration-style: unset;

  :hover {
    cursor: pointer;
  }
`

const AccountElement = styled.div<{ }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #006633;
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;

  :focus {
    border: 1px solid blue;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: 'MainNet',
  [ChainId.STANDALONE]: 'Moonbeam Development',
  [ChainId.MOONROCK]: 'Moonrock Rococo',
  [ChainId.MOONBASE]: 'Moonbase Alpha',
  [ChainId.MOONSHADOW]: 'Moonshadow Westend',
}

console.log(NETWORK_LABELS)

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  console.log(chainId, ChainId)
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  //const [isDark] = useDarkModeManager()
  async function fetchGLMB() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    const bananasContract = new ethers.Contract(bananasAddress, bananasABI, provider);
    let tokens = await bananasContract.balanceOf(signerAddress)
    tokens = ethers.utils.formatUnits(tokens, 18)
    tokens = Number(tokens)
    let bansDiv = await window.document.getElementById("bans")
   if (bansDiv) {
    bansDiv.innerText = `${tokens.toFixed(4)} 🍌`
   }
  }fetchGLMB();
  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start' }} padding="1rem">
        <HeaderElement className='headernav'>
          <Title href=".">
            <UniIcon>
              <img className='logo' src={Logo} alt="BANANASWAP logo" />
            </UniIcon>
          </Title>
        </HeaderElement>
        <HeaderControls>
          <HeaderElement>
            <AccountElement style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <>
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {userEthBalance?.toSignificant(4)} DEV
                </BalanceText>
                <BalanceText id="bans" style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                A
              </BalanceText>
              </>
              ) : null}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            {/* <VersionSwitch /> */}
            <Settings />
            <Menu />
          </HeaderElementWrap>
        </HeaderControls>
      </RowBetween>
    </HeaderFrame>
  )
}
