import { CurrencyAmount, JSBI, Token, Trade, ChainId } from 'moonbeamswap'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { StakeTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'

import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { usePairs } from '../../data/Reserves'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { Pair } from 'moonbeamswap'
import '.././style.css'
import { Contracts } from './contracts.js'
import { ethers } from 'ethers'

import Stake from './components/Stake'
import { lpTokenAddress, farmAddress, bananasAddress, lpTokenABI, farmABI, bananasABI} from './conf.js'

import BigNumber from 'bignumber.js'
import { cpuUsage } from 'process'

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
    console.log(currencies)
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENSAddress(recipient)
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

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

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
  console.log('max', maxAmountSpend(currencyBalances[LP]))
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))
  const handleMaxInput = useCallback(() => {
    alert('o')
  }, [maxAmountInput, onUserInput])

  console.log(Field.INPUT)
  async function go() {
let tokenAmount = await window.document.getElementsByClassName('token-amount-input')
console.log(tokenAmount[0].value)
  }
  async function replace() {
  let imgLp =   await window.document.querySelector('#swap-currency-input2 > div > div.sc-cqCuEk.bFUFXO > button > span')
if (imgLp) {
 imgLp.innerHTML = `<img src="http://localhost:3000/bananascoin.png" width='34px;'></img><span style="padding-left: 0.3rem;">BAN</span>`
}
const provider = new ethers.providers.Web3Provider(window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner()
const signerAddress = await signer.getAddress()
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
  const dpid = 1
  

  return (
    <>
     <AppBody>
<StakeTabs active={'earn'} />
<AutoColumn width="500px" gap="lg" justify="center">
  <img src="http://localhost:3000/bananascoin.png" width='150px'></img>
<Text textAlign="center">Stake your LP tokens to get extra $BANANAS rewards</Text>
<CurrencyInputPanel 


              label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
           
             value={formattedAmounts[Field.INPUT]}
                
              currency={LP}
            
              onUserInput={handleTypeInput}
          
        
              
              onCurrencySelect={handleInputSelect}
              disableCurrencySelect={true}

             
                    /*
              otherCurrency={currencies[Field.OUTPUT]}
              
*/  

              id="swap-currency-input2"
            />
    <ButtonPrimary id="join-pool-button" as={Link} style={{ padding: 16 }} onClick={StakeLP}>
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
