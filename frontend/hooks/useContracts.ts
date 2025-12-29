import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import {
  SONG_REGISTRY_ABI,
  ROYALTY_SPLIT_ABI,
  PAYOUT_MODULE_ABI,
  IMPERIUM_TOKEN_ABI
} from '@/lib/abis';
import { parseEther, formatEther, formatUnits } from 'viem';

// ═══════════════════════════════════════════════════════════════════════════════
// Song Registry Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useTotalSongs() {
  return useReadContract({
    address: CONTRACTS.SONG_REGISTRY as `0x${string}`,
    abi: SONG_REGISTRY_ABI,
    functionName: 'totalSongs',
  });
}

export function useGetSong(songId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.SONG_REGISTRY as `0x${string}`,
    abi: SONG_REGISTRY_ABI,
    functionName: 'getSong',
    args: songId ? [songId] : undefined,
    query: {
      enabled: !!songId,
    },
  });
}

export function useCreatorSongs(creator: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.SONG_REGISTRY as `0x${string}`,
    abi: SONG_REGISTRY_ABI,
    functionName: 'getCreatorSongs',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  });
}

export function useRegisterSong() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const registerSong = async (
    isrc: string,
    title: string,
    metadataURI: string,
    contentHash: `0x${string}`
  ) => {
    writeContract({
      address: CONTRACTS.SONG_REGISTRY as `0x${string}`,
      abi: SONG_REGISTRY_ABI,
      functionName: 'registerSong',
      args: [isrc, title, metadataURI, contentHash],
    });
  };

  return { registerSong, hash, isPending, isConfirming, isSuccess, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Royalty Split Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useGetSplits(songId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.ROYALTY_SPLIT as `0x${string}`,
    abi: ROYALTY_SPLIT_ABI,
    functionName: 'getSplits',
    args: songId ? [songId] : undefined,
    query: {
      enabled: !!songId,
    },
  });
}

export function useConfigureSplits() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const configureSplits = async (
    songId: bigint,
    recipients: `0x${string}`[],
    percentages: bigint[],
    roles: string[]
  ) => {
    writeContract({
      address: CONTRACTS.ROYALTY_SPLIT as `0x${string}`,
      abi: ROYALTY_SPLIT_ABI,
      functionName: 'configureSplits',
      args: [songId, recipients, percentages, roles],
    });
  };

  return { configureSplits, hash, isPending, isConfirming, isSuccess, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Payout Module Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useClaimableBalance(recipient: `0x${string}` | undefined, token: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PAYOUT_MODULE as `0x${string}`,
    abi: PAYOUT_MODULE_ABI,
    functionName: 'getClaimableBalance',
    args: recipient ? [recipient, token] : undefined,
    query: {
      enabled: !!recipient,
    },
  });
}

export function useAllClaimableBalances(recipient: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.PAYOUT_MODULE as `0x${string}`,
    abi: PAYOUT_MODULE_ABI,
    functionName: 'getAllClaimableBalances',
    args: recipient ? [recipient] : undefined,
    query: {
      enabled: !!recipient,
    },
  });
}

export function useSongTotalEarnings(songId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.PAYOUT_MODULE as `0x${string}`,
    abi: PAYOUT_MODULE_ABI,
    functionName: 'getTotalEarnings',
    args: songId ? [songId] : undefined,
    query: {
      enabled: !!songId,
    },
  });
}

export function useClaimRoyalties() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRoyalties = async (token: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.PAYOUT_MODULE as `0x${string}`,
      abi: PAYOUT_MODULE_ABI,
      functionName: 'claimRoyalties',
      args: [token],
    });
  };

  const claimAllRoyalties = async () => {
    writeContract({
      address: CONTRACTS.PAYOUT_MODULE as `0x${string}`,
      abi: PAYOUT_MODULE_ABI,
      functionName: 'claimAllRoyalties',
    });
  };

  return { claimRoyalties, claimAllRoyalties, hash, isPending, isConfirming, isSuccess, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Imperium Token Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useTokenInfo(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.IMPERIUM_TOKEN as `0x${string}`,
    abi: IMPERIUM_TOKEN_ABI,
    functionName: 'getTokenInfo',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });
}

export function useTokenIdForSong(songId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.IMPERIUM_TOKEN as `0x${string}`,
    abi: IMPERIUM_TOKEN_ABI,
    functionName: 'getTokenIdForSong',
    args: songId ? [songId] : undefined,
    query: {
      enabled: !!songId,
    },
  });
}

export function useTokenBalance(account: `0x${string}` | undefined, tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.IMPERIUM_TOKEN as `0x${string}`,
    abi: IMPERIUM_TOKEN_ABI,
    functionName: 'balanceOf',
    args: account && tokenId ? [account, tokenId] : undefined,
    query: {
      enabled: !!account && !!tokenId,
    },
  });
}

export function useMintTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintTokens = async (tokenId: bigint, amount: bigint, value: bigint) => {
    writeContract({
      address: CONTRACTS.IMPERIUM_TOKEN as `0x${string}`,
      abi: IMPERIUM_TOKEN_ABI,
      functionName: 'mintTokens',
      args: [tokenId, amount],
      value,
    });
  };

  return { mintTokens, hash, isPending, isConfirming, isSuccess, error };
}

export function useCreateToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createToken = async (
    songId: bigint,
    maxSupply: bigint,
    pricePerToken: bigint,
    paymentToken: `0x${string}`,
    royaltyShareBps: bigint,
    uri: string
  ) => {
    writeContract({
      address: CONTRACTS.IMPERIUM_TOKEN as `0x${string}`,
      abi: IMPERIUM_TOKEN_ABI,
      functionName: 'createToken',
      args: [songId, maxSupply, pricePerToken, paymentToken, royaltyShareBps, uri],
    });
  };

  return { createToken, hash, isPending, isConfirming, isSuccess, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useFormatUSDC(amount: bigint | undefined) {
  if (!amount) return '0.00';
  return formatUnits(amount, 6);
}

export function useFormatETH(amount: bigint | undefined) {
  if (!amount) return '0.00';
  return formatEther(amount);
}
