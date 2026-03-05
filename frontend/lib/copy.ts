/**
 * IMPERIUM MICROCOPY SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Voice: Declarative, Final, Legal
 * Archetype: The Ruler + Restrained Magician
 *
 * Rules:
 * - No "empower", "take control", "reimagine"
 * - No friendly confirmations
 * - State facts, not feelings
 * - Use period, not exclamation
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const Copy = {
  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION & HEADERS
  // ═══════════════════════════════════════════════════════════════════════════
  nav: {
    dashboard: 'Dashboard',
    register: 'Register',
    ledger: 'Royalty Ledger',
    splits: 'Split Management',
    settings: 'Settings',
    blackbox: 'Black Box Hunter',
    simulator: 'Simulator',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUTTON LABELS
  // ═══════════════════════════════════════════════════════════════════════════
  buttons: {
    connect: 'Connect Wallet',
    disconnect: 'Disconnect',
    register: 'Register',
    submit: 'Submit',
    confirm: 'Confirm',
    cancel: 'Cancel',
    claim: 'Claim',
    claimAll: 'Claim All',
    lock: 'Lock',
    lockPermanently: 'Lock Permanently',
    viewTransaction: 'View Transaction',
    viewDetails: 'View Details',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    export: 'Export',
    scan: 'Scan',
    fileClaim: 'File Claim',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════
  status: {
    // Transaction states
    pending: 'Pending',
    confirming: 'Confirming',
    confirmed: 'Confirmed',
    failed: 'Failed',

    // Song states
    registered: 'Registered',
    verified: 'Verified',
    deactivated: 'Deactivated',

    // Split states
    configured: 'Configured',
    locked: 'Locked',
    unlocked: 'Unlocked',

    // Payout states
    distributed: 'Distributed',
    claimable: 'Claimable',
    claimed: 'Claimed',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MESSAGES - Declarative, Legal Tone
  // ═══════════════════════════════════════════════════════════════════════════
  confirmations: {
    songRegistered: 'Song recorded on-chain.',
    songVerified: 'Song verification complete.',
    splitsConfigured: 'Splits configured.',
    splitsLocked: 'Splits permanently locked. This cannot be undone.',
    royaltyReceived: 'Royalty deposited.',
    royaltyClaimed: 'Settlement executed.',
    royaltyDistributed: 'Distribution complete.',
    walletConnected: 'Wallet connected.',
    transactionSubmitted: 'Transaction submitted.',
    transactionConfirmed: 'Transaction recorded.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════
  errors: {
    walletNotConnected: 'Wallet connection required.',
    insufficientBalance: 'Insufficient balance.',
    transactionFailed: 'Transaction failed.',
    transactionRejected: 'Transaction rejected.',
    invalidAddress: 'Invalid address.',
    invalidISRC: 'Invalid ISRC format.',
    splitsTotalInvalid: 'Split total must equal 100%.',
    splitsLocked: 'Splits are permanently locked.',
    unauthorized: 'Unauthorized action.',
    networkError: 'Network error. Retry.',
    unknownError: 'Error occurred.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS
  // ═══════════════════════════════════════════════════════════════════════════
  warnings: {
    irreversible: 'This action is irreversible.',
    permanentLock: 'Locking is permanent. Splits cannot be modified after lock.',
    gasRequired: 'Transaction requires gas fee.',
    reviewCarefully: 'Review carefully before confirming.',
    dataLoss: 'Unsaved changes will be lost.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM LABELS
  // ═══════════════════════════════════════════════════════════════════════════
  labels: {
    songTitle: 'Song Title',
    isrc: 'ISRC',
    metadataURI: 'Metadata URI',
    audioFile: 'Audio File',
    recipient: 'Recipient',
    percentage: 'Percentage',
    role: 'Role',
    amount: 'Amount',
    token: 'Token',
    source: 'Source',
    region: 'Region',
    timestamp: 'Timestamp',
    transaction: 'Transaction',
    address: 'Address',
    email: 'Email',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLACEHOLDERS
  // ═══════════════════════════════════════════════════════════════════════════
  placeholders: {
    songTitle: 'Enter song title',
    isrc: 'USRC12345678',
    metadataURI: 'ipfs://... or ar://...',
    walletAddress: '0x... or name.eth',
    email: 'your@email.com',
    search: 'Search...',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════════════════════════════════
  empty: {
    noSongs: 'No songs registered.',
    noRoyalties: 'No royalties recorded.',
    noTransactions: 'No transactions.',
    noClaims: 'No claims pending.',
    noResults: 'No results.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  metrics: {
    totalEarnings: 'Total Earnings',
    claimable: 'Claimable',
    distributed: 'Distributed',
    pendingPayouts: 'Pending Payouts',
    songsRegistered: 'Songs Registered',
    activeSplits: 'Active Splits',
    topRegion: 'Top Region',
    topSource: 'Top Source',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLACK BOX HUNTER
  // ═══════════════════════════════════════════════════════════════════════════
  blackbox: {
    title: 'Black Box Hunter',
    subtitle: 'Retroactive royalty recovery',
    scanningDatabases: 'Scanning databases...',
    matchFound: 'Match found.',
    claimPending: 'Claim pending.',
    claimFiled: 'Claim filed.',
    estimatedRecovery: 'Estimated recoverable',
    confidence: 'Confidence',
    lastScan: 'Last scan',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  notifications: {
    royaltyReceived: (amount: string, source: string, region: string) =>
      `${amount} from ${source} ${region} landed.`,
    royaltyClaimed: (amount: string) => `${amount} claimed to wallet.`,
    songVerified: (title: string) => `${title} verified.`,
    splitLocked: (title: string) => `${title} splits locked.`,
    blackboxMatch: (count: number, amount: string) =>
      `${count} unclaimed records found. ${amount} recoverable.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGAL / FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  legal: {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    disclaimer:
      'Imperium is a decentralized protocol. Users are responsible for their own transactions.',
    copyright: 'Imperium Protocol',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAND
  // ═══════════════════════════════════════════════════════════════════════════
  brand: {
    name: 'IMPERIUM',
    tagline: 'The sovereign ledger of independent music.',
    slogan: 'Own It. Break the Chain.',
  },
};

/**
 * Format currency with proper symbol
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', USDC: '$' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format address for display (truncated)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.endsWith('.eth')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Format date for ledger display
 */
export function formatLedgerDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default Copy;
