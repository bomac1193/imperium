import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy, base, baseSepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Imperium',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [polygon, polygonAmoy, base, baseSepolia, hardhat],
  ssr: true,
});

export const supportedChains = [polygon, polygonAmoy, base, baseSepolia, hardhat];
