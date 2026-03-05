/**
 * Imperium Split Templates
 * Pre-configured royalty split configurations
 *
 * IMPORTANT: These templates are UI-only configurations.
 * They do not modify contract logic - only pre-fill the split form.
 */

export interface SplitRecipient {
  role: string;
  percentage: number;
  description: string;
  placeholder: string;
}

export interface SplitTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipients: SplitRecipient[];
  locked: boolean; // If true, shows permanent lock warning
  popular: boolean;
}

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'producer-artist-5050',
    name: 'Producer / Artist (50/50)',
    description: 'Standard producer-artist split for collaborative releases',
    icon: 'Users',
    recipients: [
      {
        role: 'Artist',
        percentage: 50,
        description: 'Primary performing artist',
        placeholder: 'artist.eth or 0x...',
      },
      {
        role: 'Producer',
        percentage: 50,
        description: 'Beat maker / producer',
        placeholder: 'producer.eth or 0x...',
      },
    ],
    locked: false,
    popular: true,
  },
  {
    id: 'producer-artist-vocalist',
    name: 'Producer / Artist / Vocalist',
    description: 'Three-way split for tracks with featured vocals',
    icon: 'Mic2',
    recipients: [
      {
        role: 'Producer',
        percentage: 40,
        description: 'Beat maker / producer',
        placeholder: 'producer.eth or 0x...',
      },
      {
        role: 'Artist',
        percentage: 30,
        description: 'Primary artist / songwriter',
        placeholder: 'artist.eth or 0x...',
      },
      {
        role: 'Vocalist',
        percentage: 30,
        description: 'Featured vocalist',
        placeholder: 'vocalist.eth or 0x...',
      },
    ],
    locked: false,
    popular: true,
  },
  {
    id: 'collective-equal',
    name: 'Collective (Equal Split)',
    description: 'Equal shares for bands and collectives',
    icon: 'Users2',
    recipients: [
      {
        role: 'Member 1',
        percentage: 25,
        description: 'Collective member',
        placeholder: 'member1.eth or 0x...',
      },
      {
        role: 'Member 2',
        percentage: 25,
        description: 'Collective member',
        placeholder: 'member2.eth or 0x...',
      },
      {
        role: 'Member 3',
        percentage: 25,
        description: 'Collective member',
        placeholder: 'member3.eth or 0x...',
      },
      {
        role: 'Member 4',
        percentage: 25,
        description: 'Collective member',
        placeholder: 'member4.eth or 0x...',
      },
    ],
    locked: false,
    popular: false,
  },
  {
    id: 'label-lite',
    name: 'Label-Lite (Artist Majority)',
    description: 'Artist keeps majority with label/distributor cut',
    icon: 'Building2',
    recipients: [
      {
        role: 'Artist',
        percentage: 70,
        description: 'Primary artist',
        placeholder: 'artist.eth or 0x...',
      },
      {
        role: 'Label/Distro',
        percentage: 20,
        description: 'Label or distributor',
        placeholder: 'label.eth or 0x...',
      },
      {
        role: 'Manager',
        percentage: 10,
        description: 'Management fee',
        placeholder: 'manager.eth or 0x...',
      },
    ],
    locked: false,
    popular: true,
  },
  {
    id: 'solo-artist',
    name: 'Solo Artist',
    description: 'Single recipient - full ownership',
    icon: 'User',
    recipients: [
      {
        role: 'Artist',
        percentage: 100,
        description: 'Sole rights holder',
        placeholder: 'Your wallet address',
      },
    ],
    locked: false,
    popular: true,
  },
  {
    id: 'songwriter-split',
    name: 'Songwriter Split',
    description: 'Standard songwriter/composer division',
    icon: 'FileText',
    recipients: [
      {
        role: 'Lyricist',
        percentage: 50,
        description: 'Lyrics writer',
        placeholder: 'lyricist.eth or 0x...',
      },
      {
        role: 'Composer',
        percentage: 50,
        description: 'Music composer',
        placeholder: 'composer.eth or 0x...',
      },
    ],
    locked: false,
    popular: false,
  },
  {
    id: 'remix-split',
    name: 'Remix Split',
    description: 'Original artist + remixer division',
    icon: 'Repeat',
    recipients: [
      {
        role: 'Original Artist',
        percentage: 60,
        description: 'Rights to original composition',
        placeholder: 'original.eth or 0x...',
      },
      {
        role: 'Remixer',
        percentage: 40,
        description: 'Remix production fee',
        placeholder: 'remixer.eth or 0x...',
      },
    ],
    locked: false,
    popular: false,
  },
  {
    id: 'full-production',
    name: 'Full Production Team',
    description: 'Complete production credits split',
    icon: 'Layers',
    recipients: [
      {
        role: 'Artist',
        percentage: 35,
        description: 'Primary artist',
        placeholder: 'artist.eth or 0x...',
      },
      {
        role: 'Producer',
        percentage: 25,
        description: 'Production',
        placeholder: 'producer.eth or 0x...',
      },
      {
        role: 'Songwriter',
        percentage: 20,
        description: 'Songwriting',
        placeholder: 'writer.eth or 0x...',
      },
      {
        role: 'Engineer',
        percentage: 10,
        description: 'Mixing/Mastering',
        placeholder: 'engineer.eth or 0x...',
      },
      {
        role: 'Label',
        percentage: 10,
        description: 'Distribution/Marketing',
        placeholder: 'label.eth or 0x...',
      },
    ],
    locked: false,
    popular: false,
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): SplitTemplate | undefined {
  return SPLIT_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get popular templates
 */
export function getPopularTemplates(): SplitTemplate[] {
  return SPLIT_TEMPLATES.filter((t) => t.popular);
}

/**
 * Validate that a split configuration totals 100%
 */
export function validateSplitTotal(recipients: { percentage: number }[]): boolean {
  const total = recipients.reduce((sum, r) => sum + r.percentage, 0);
  return total === 100;
}

/**
 * Convert template recipients to form-ready format
 */
export function templateToFormData(
  template: SplitTemplate,
  userAddress?: string
): { address: string; percentage: number; role: string }[] {
  return template.recipients.map((r, index) => ({
    address: index === 0 && userAddress ? userAddress : '',
    percentage: r.percentage,
    role: r.role.toLowerCase().replace(/\s+/g, '_'),
  }));
}

/**
 * Calculate basis points from percentage
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Convert basis points to percentage
 */
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}
