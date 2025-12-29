import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface Song {
  songId: bigint;
  isrc: string;
  title: string;
  primaryCreator: string;
  metadataURI: string;
  contentHash: string;
  registeredAt: bigint;
  verified: boolean;
  active: boolean;
}

interface Split {
  recipient: string;
  percentage: number;
  role: string;
  active: boolean;
}

interface RoyaltyFlow {
  region: string;
  amount: number;
  lat: number;
  lng: number;
  source: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// App Store
// ═══════════════════════════════════════════════════════════════════════════════

interface AppState {
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // User State
  userSongs: Song[];
  setUserSongs: (songs: Song[]) => void;
  addUserSong: (song: Song) => void;

  // Royalty Flows (for visualization)
  royaltyFlows: RoyaltyFlow[];
  setRoyaltyFlows: (flows: RoyaltyFlow[]) => void;
  addRoyaltyFlow: (flow: RoyaltyFlow) => void;

  // Selected Song
  selectedSongId: bigint | null;
  setSelectedSongId: (id: bigint | null) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export const useAppStore = create<AppState>()((set) => ({
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // User State
  userSongs: [],
  setUserSongs: (songs) => set({ userSongs: songs }),
  addUserSong: (song) => set((state) => ({ userSongs: [...state.userSongs, song] })),

  // Royalty Flows
  royaltyFlows: [],
  setRoyaltyFlows: (flows) => set({ royaltyFlows: flows }),
  addRoyaltyFlow: (flow) => set((state) => ({ royaltyFlows: [...state.royaltyFlows, flow] })),

  // Selected Song
  selectedSongId: null,
  setSelectedSongId: (id) => set({ selectedSongId: id }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// User Preferences Store (Persisted)
// ═══════════════════════════════════════════════════════════════════════════════

interface UserPreferences {
  theme: 'dark' | 'light';
  currency: 'USD' | 'EUR' | 'GBP';
  notifications: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP') => void;
  setNotifications: (enabled: boolean) => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'dark',
      currency: 'USD',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: 'imperium-preferences',
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Mock Data for Development
// ═══════════════════════════════════════════════════════════════════════════════

export const MOCK_ROYALTY_FLOWS: RoyaltyFlow[] = [
  { region: 'US', amount: 45000, lat: 39.8283, lng: -98.5795, source: 'spotify', timestamp: Date.now() },
  { region: 'GB', amount: 18500, lat: 55.3781, lng: -3.4360, source: 'apple', timestamp: Date.now() },
  { region: 'DE', amount: 12300, lat: 51.1657, lng: 10.4515, source: 'spotify', timestamp: Date.now() },
  { region: 'JP', amount: 9800, lat: 36.2048, lng: 138.2529, source: 'youtube', timestamp: Date.now() },
  { region: 'BR', amount: 7600, lat: -14.2350, lng: -51.9253, source: 'spotify', timestamp: Date.now() },
  { region: 'FR', amount: 8900, lat: 46.2276, lng: 2.2137, source: 'deezer', timestamp: Date.now() },
  { region: 'AU', amount: 6500, lat: -25.2744, lng: 133.7751, source: 'apple', timestamp: Date.now() },
  { region: 'CA', amount: 11200, lat: 56.1304, lng: -106.3468, source: 'spotify', timestamp: Date.now() },
  { region: 'MX', amount: 4300, lat: 23.6345, lng: -102.5528, source: 'spotify', timestamp: Date.now() },
  { region: 'KR', amount: 8100, lat: 35.9078, lng: 127.7669, source: 'youtube', timestamp: Date.now() },
];

export const MOCK_SOURCES = [
  { name: 'Spotify', amount: 78500, percentage: 45, color: '#1DB954' },
  { name: 'Apple Music', amount: 42000, percentage: 24, color: '#FC3C44' },
  { name: 'YouTube', amount: 28000, percentage: 16, color: '#FF0000' },
  { name: 'Amazon', amount: 15000, percentage: 9, color: '#FF9900' },
  { name: 'Other', amount: 10500, percentage: 6, color: '#8B5CF6' },
];
