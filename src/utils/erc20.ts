import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'

import ERC20ABI from '../constants/abi/erc20.json'
import { Contract } from 'web3-eth-contract'



export const getAllowance = async (
  lpContract: Contract,
  farmContract: Contract,
  account: string,
): Promise<string> => {
  try {
    const allowance: string = await lpContract.methods
      .allowance(account, farmContract.options.address)
      .call()
    return allowance
  } catch (e) {
    return '0'
  }
}
