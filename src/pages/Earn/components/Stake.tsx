import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { Contract } from 'web3-eth-contract'

//import {Button} from '../../../components/Button'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import { AddIcon, RemoveIcon } from '../../../components/icons'
import IconButton from '../../../components/IconButton'
import Label from '../../../components/Label'
import Value from '../../../components/Value'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { lpTokenAddress, farmAddress, bananasAddress, lpTokenABI, farmABI, bananasABI} from '../conf.js'
import { ethers } from 'ethers'

/*
import useAllowance from '../../../hooks/useAllowance'
import useApprove from '../../../hooks/useApprove'
import useModal from '../../../hooks/useModal'
import useStake from '../../../hooks/useStake'
import useStakedBalance from '../../../hooks/useStakedBalance'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useUnstake from '../../../hooks/useUnstake'

import { getDisplayBalance } from '../../../utils/formatBalance'

import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
*/
//import imageUniswap from '../../../assets/img/logo-uniswap.svg'

interface StakeProps {
  lpContract: Contract,
  pid: number,
  tokenName: string
}

const Stake: React.FC<StakeProps> = ({ lpContract, pid, tokenName }) => {

async function unstake() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()
  const farmContract = new ethers.Contract(farmAddress, farmABI, signer);
  const deposited = await farmContract.deposited("0", signerAddress)
  const withdraw = await farmContract.withdraw("0", deposited)
}

async function fetchRewards() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()
  const farmContract = new ethers.Contract(farmAddress, farmABI, provider);
  let pending = await farmContract.pending("0", signerAddress)
  pending = ethers.utils.formatUnits(pending, 18)
  console.log(pending)
  let rewardsToReplace = window.document.getElementById('rewards-to-claim')
  rewardsToReplace.innerText = `${Number(pending).toFixed(4)} 🍌 to claim`

  let stakedBAN = await farmContract.userInfo("0", signerAddress)
  stakedBAN = ethers.utils.formatUnits(stakedBAN.amount, 18)
  console.log(stakedBAN)
  let stakedToReplace = window.document.getElementById('ban-staked')
  stakedToReplace.innerText = `${stakedBAN} 🍌 currently staked`

}
fetchRewards()


  return (
    <>
<ButtonLight id="unstake" as={Link} style={{ padding: 16 }} onClick={unstake}>
<Text fontWeight={500} fontSize={20}>
  Unstake your LP tokens
</Text>
</ButtonLight>
      <Text fontWeight={500} fontSize={20}>
        <Text id="rewards-to-claim"></Text> 
      </Text>



<Text fontWeight={500} fontSize={20}>
        <Text id="ban-staked"></Text> 
      </Text>
</>
            )
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`

export default Stake