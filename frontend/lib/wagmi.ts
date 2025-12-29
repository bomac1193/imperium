import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Imperium',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [polygon, polygonMumbai, hardhat],
  ssr: true,
});

export const supportedChains = [polygon, polygonMumbai, hardhat];
