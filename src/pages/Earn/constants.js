// 42 - Testnet
// 4 - Rinkeby
// 1 - Mainnet

"WETH": "0xD909178CC99d318e4D46e7E66a972955859670E1",
"factory": "0xd15754c4cbed8e5E0b427ABB95b4D61D2B236C03",
"routerv2": "0x902dae2961f5A49322c7a83Eff1D5725358E9Ab0",
"multicall": "0x4E2cfca20580747AdBA58cd677A998f8B261Fc21"

export const contractAddresses = {
    erc20: {
      42: '0x9C821fF00DBb2D3D2C908f39bB497766eac2d8c6',
      4: '0x7D08Dc5285A06c21aC5f4742C31B9D097607aaBc',
      1: '0x3db6ba6ab6f95efed1a6e794cad492faaabf294d',
      1287: '0xfA18F19F75A97cfE7D4FF0832aa37539091aE4Fc',
    },
    farm: {
      42: '0xbFd181cb0c8E23b65805Dded3863Dce6517402A7',
      4: '0x0030A8A46AEA824eCA127F36d449D654cC8AC8A6',
      1: '0xbfd181cb0c8e23b65805dded3863dce6517402a7',
      1287: '0x046cbCF689a4881Cd4276964F6431577cEe793a7'
    },
    weth: {
      42: '0xf3a6679b266899042276804930b3bfbaf807f15b',
      4: '0x2fcc4dba284dcf665091718e4d0dab53a416dfe7',
      1: '0x9cd7403ac4856071581e1f5a298317d9a72a19cf',
      1287: '0xD909178CC99d318e4D46e7E66a972955859670E1'
    },
  }
  
  export const supportedPools = [
    {
      id: 'ban',
      version: 'V1',
      name: 'Bananaswap',
      pid: 0,
      lpAddresses: {
        42: '0x74414F027FDCda5DaacFa4d35F29C0d6c5020776',
        4: '0x7D721dDB45C1eaCceD8Dc4a3698a21b93eb7f9c3',
        1: '0x9cd7403ac4856071581e1f5a298317d9a72a19cf',
      },
      tokenAddresses: { ...contractAddresses.erc20 },
      symbol: 'GLMR-BAN LP',
      tokenSymbol: 'BAN',
      icon: '',
      pool: '100%',
    },
  ]