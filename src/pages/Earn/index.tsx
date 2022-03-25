import { CurrencyAmount, JSBI, Token, ChainId } from 'moonbeamswap'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { StakeTabs } from '../../components/NavigationTabs'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import '.././style.css'
import { ethers } from 'ethers'

import Stake from './components/Stake'
import { lpTokenAddress, farmAddress, lpTokenABI, farmABI} from './conf.js'

declare let window: any;

export default function Swap() {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

 const LP = new Token(ChainId.MOONBASE, '0x205A1AecA18DDCB130825B961BcE897302690A5d', 18, 'BAN', 'Bananaswap')

    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
      currencies[Field.INPUT],
      currencies[Field.OUTPUT],
      typedValue
    )
    console.log(onWrap)
    console.log(currencies, wrapInputError)
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const toggledVersion = useToggledVersion()
    const trade = showWrap
      ? undefined
      : {
          [Version.v2]: v2Trade
        }[toggledVersion]
  
    const parsedAmounts = showWrap
      ? {
          [Field.INPUT]: parsedAmount,
          [Field.OUTPUT]: parsedAmount
        }
      : {
          [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
          [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
        }
  
    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
    console.log(onSwitchTokens,isValid,onChangeRecipient)

  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )
  console.log(fetchingV2PairBalances)
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )
console.log(liquidityTokensWithBalances)
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )


  const noRoute = !route
  const [allowedSlippage] = useUserSlippageTolerance()
  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)
  console.log(userHasSpecifiedInputOutput, noRoute, approveCallback)
  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])




  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))
  const handleMaxInput = useCallback(() => {
    alert('o')
  }, [maxAmountInput, onUserInput])

  console.log(Field.INPUT, handleTypeOutput, atMaxAmountInput, handleMaxInput, maxAmountInput, onUserInput, recipient)

  async function replace() {
  let imgLp =   await window.document.querySelector('#swap-currency-input2 > div > div.sc-cqCuEk.bFUFXO > button > span')
if (imgLp) {
 imgLp.innerHTML = `<img src="http://localhost:3000/bananascoin.png" width='34px;'></img><span style="padding-left: 0.3rem;">BAN</span>`
}
const provider = new ethers.providers.Web3Provider(window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner()
const signerAddress = await signer.getAddress()
console.log(signerAddress)
const farmContract = new ethers.Contract(farmAddress, farmABI, provider);
let rewardsPerBlock = await farmContract.rewardPerBlock()
rewardsPerBlock = ethers.utils.formatUnits(rewardsPerBlock, 18)
let APR = rewardsPerBlock * 1855058
let APRp = window.document.getElementById('apr')
APRp.innerText = `APY: ${Number(APR).toFixed(2)} %`

  }
  replace();

async function StakeLP() {
  const provider2 = new ethers.providers.Web3Provider(window.ethereum)
  await provider2.send("eth_requestAccounts", []);
  const signer2 = provider2.getSigner()
  console.log(signer2)
  let tokenAmount = await window.document.getElementsByClassName('token-amount-input')
  const amountToDeposit = tokenAmount[0].value
  const numberOfDecimals = 18
  var spNb = ethers.utils.parseUnits(amountToDeposit, numberOfDecimals);
  const farmContract = new ethers.Contract(farmAddress, farmABI, signer2);
  const LPContract = new ethers.Contract(lpTokenAddress, lpTokenABI, signer2);
  const Approve = await LPContract.approve(farmAddress, spNb)
  const tx = await Approve.wait()
  const event = tx.events[0];
  const enterStaking = await farmContract.deposit("0", spNb)
  }
  return (
    <>
     <AppBody>
<StakeTabs active={'earn'} />
<AutoColumn >
  <img src="http://localhost:3000/bananascoin.png" width='150px'></img>
<Text textAlign="center">Stake your LP tokens to get extra $BANANAS rewards</Text>
<CurrencyInputPanel 
              label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
             value={formattedAmounts[Field.INPUT]}
              currency={LP}
              onUserInput={handleTypeInput}  
              onCurrencySelect={handleInputSelect}
              disableCurrencySelect={true}
              showMaxButton={false}
              showCommonBases
              id="swap-currency-input2"
                    /*
              otherCurrency={currencies[Field.OUTPUT]}
              
*/  
            />
    <ButtonPrimary id="join-pool-button" onClick={StakeLP}>
      <Text fontWeight={500} fontSize={20}>
        {t('stakeLp')}
      </Text>
   
    </ButtonPrimary>
    <Text>
        2 transactions to complete
      </Text>
    <Text fontWeight={500} fontSize={20}>
    <Text id="apr"></Text> 
      </Text>
      
    <Stake />
    </AutoColumn>
    
</AppBody>
    </>
  )
}

//465: {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
