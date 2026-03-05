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
  notifications: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setNotifications: (enabled: boolean) => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'dark',
      notifications: true,
      setTheme: (theme) => set({ theme }),
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

export interface CityFlow {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  amount: number;
  streams: number;
  listeners: number;
  source: string;
  songId: number;
  songTitle: string;
  growth: number;       // % change from previous period
  timestamp: number;
}

// ── City-level royalty flows (70+ cities worldwide) ──────────────────────────
const now = Date.now();
export const MOCK_CITY_FLOWS: CityFlow[] = [
  // ── North America ──
  { id: 'nyc-1', city: 'New York', region: 'US', country: 'United States', lat: 40.7128, lng: -74.006, amount: 18200, streams: 2420000, listeners: 890000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 14.2, timestamp: now },
  { id: 'nyc-2', city: 'New York', region: 'US', country: 'United States', lat: 40.7128, lng: -74.006, amount: 12800, streams: 1680000, listeners: 620000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 8.5, timestamp: now },
  { id: 'la-1', city: 'Los Angeles', region: 'US', country: 'United States', lat: 34.0522, lng: -118.2437, amount: 15600, streams: 2080000, listeners: 760000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 11.3, timestamp: now },
  { id: 'la-2', city: 'Los Angeles', region: 'US', country: 'United States', lat: 34.0522, lng: -118.2437, amount: 9400, streams: 1240000, listeners: 480000, source: 'youtube', songId: 3, songTitle: 'Take the Throne', growth: 22.1, timestamp: now },
  { id: 'chi-1', city: 'Chicago', region: 'US', country: 'United States', lat: 41.8781, lng: -87.6298, amount: 7800, streams: 1040000, listeners: 380000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 6.8, timestamp: now },
  { id: 'atl-1', city: 'Atlanta', region: 'US', country: 'United States', lat: 33.749, lng: -84.388, amount: 9200, streams: 1220000, listeners: 450000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 31.5, timestamp: now },
  { id: 'mia-1', city: 'Miami', region: 'US', country: 'United States', lat: 25.7617, lng: -80.1918, amount: 6400, streams: 850000, listeners: 310000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 18.4, timestamp: now },
  { id: 'hou-1', city: 'Houston', region: 'US', country: 'United States', lat: 29.7604, lng: -95.3698, amount: 5100, streams: 680000, listeners: 250000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 9.2, timestamp: now },
  { id: 'sf-1', city: 'San Francisco', region: 'US', country: 'United States', lat: 37.7749, lng: -122.4194, amount: 4800, streams: 640000, listeners: 230000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 5.6, timestamp: now },
  { id: 'det-1', city: 'Detroit', region: 'US', country: 'United States', lat: 42.3314, lng: -83.0458, amount: 3200, streams: 420000, listeners: 155000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 42.1, timestamp: now },
  { id: 'tor-1', city: 'Toronto', region: 'CA', country: 'Canada', lat: 43.6532, lng: -79.3832, amount: 8400, streams: 1120000, listeners: 410000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 12.7, timestamp: now },
  { id: 'van-1', city: 'Vancouver', region: 'CA', country: 'Canada', lat: 49.2827, lng: -123.1207, amount: 3600, streams: 480000, listeners: 175000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 7.3, timestamp: now },
  { id: 'mex-1', city: 'Mexico City', region: 'MX', country: 'Mexico', lat: 19.4326, lng: -99.1332, amount: 4800, streams: 640000, listeners: 235000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 28.9, timestamp: now },

  // ── Europe ──
  { id: 'lon-1', city: 'London', region: 'GB', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, amount: 14200, streams: 1890000, listeners: 695000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 10.1, timestamp: now },
  { id: 'lon-2', city: 'London', region: 'GB', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, amount: 8600, streams: 1140000, listeners: 420000, source: 'apple', songId: 3, songTitle: 'Take the Throne', growth: 15.8, timestamp: now },
  { id: 'ber-1', city: 'Berlin', region: 'DE', country: 'Germany', lat: 52.52, lng: 13.405, amount: 7200, streams: 960000, listeners: 350000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 8.4, timestamp: now },
  { id: 'ber-2', city: 'Berlin', region: 'DE', country: 'Germany', lat: 52.52, lng: 13.405, amount: 3800, streams: 500000, listeners: 185000, source: 'deezer', songId: 2, songTitle: 'No Masters', growth: 5.2, timestamp: now },
  { id: 'par-1', city: 'Paris', region: 'FR', country: 'France', lat: 48.8566, lng: 2.3522, amount: 9400, streams: 1250000, listeners: 460000, source: 'deezer', songId: 1, songTitle: 'Break the Chain', growth: 13.6, timestamp: now },
  { id: 'ams-1', city: 'Amsterdam', region: 'NL', country: 'Netherlands', lat: 52.3676, lng: 4.9041, amount: 4200, streams: 560000, listeners: 205000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 9.1, timestamp: now },
  { id: 'sto-1', city: 'Stockholm', region: 'SE', country: 'Sweden', lat: 59.3293, lng: 18.0686, amount: 5100, streams: 680000, listeners: 250000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 7.8, timestamp: now },
  { id: 'mad-1', city: 'Madrid', region: 'ES', country: 'Spain', lat: 40.4168, lng: -3.7038, amount: 3600, streams: 480000, listeners: 176000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 19.4, timestamp: now },
  { id: 'bar-1', city: 'Barcelona', region: 'ES', country: 'Spain', lat: 41.3874, lng: 2.1686, amount: 2900, streams: 386000, listeners: 142000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 16.2, timestamp: now },
  { id: 'mil-1', city: 'Milan', region: 'IT', country: 'Italy', lat: 45.4642, lng: 9.19, amount: 3100, streams: 412000, listeners: 151000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 11.5, timestamp: now },
  { id: 'lis-1', city: 'Lisbon', region: 'PT', country: 'Portugal', lat: 38.7223, lng: -9.1393, amount: 1800, streams: 240000, listeners: 88000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 24.3, timestamp: now },
  { id: 'war-1', city: 'Warsaw', region: 'PL', country: 'Poland', lat: 52.2297, lng: 21.0122, amount: 2400, streams: 320000, listeners: 117000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 35.1, timestamp: now },
  { id: 'cop-1', city: 'Copenhagen', region: 'DK', country: 'Denmark', lat: 55.6761, lng: 12.5683, amount: 2200, streams: 292000, listeners: 107000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 6.4, timestamp: now },

  // ── Asia-Pacific ──
  { id: 'tok-1', city: 'Tokyo', region: 'JP', country: 'Japan', lat: 35.6762, lng: 139.6503, amount: 8900, streams: 1180000, listeners: 435000, source: 'apple', songId: 1, songTitle: 'Break the Chain', growth: 4.2, timestamp: now },
  { id: 'tok-2', city: 'Tokyo', region: 'JP', country: 'Japan', lat: 35.6762, lng: 139.6503, amount: 4100, streams: 546000, listeners: 200000, source: 'youtube', songId: 3, songTitle: 'Take the Throne', growth: 18.6, timestamp: now },
  { id: 'seo-1', city: 'Seoul', region: 'KR', country: 'South Korea', lat: 37.5665, lng: 126.978, amount: 7400, streams: 984000, listeners: 362000, source: 'youtube', songId: 1, songTitle: 'Break the Chain', growth: 26.3, timestamp: now },
  { id: 'seo-2', city: 'Seoul', region: 'KR', country: 'South Korea', lat: 37.5665, lng: 126.978, amount: 3200, streams: 426000, listeners: 156000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 14.8, timestamp: now },
  { id: 'mum-1', city: 'Mumbai', region: 'IN', country: 'India', lat: 19.076, lng: 72.8777, amount: 3400, streams: 452000, listeners: 166000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 45.2, timestamp: now },
  { id: 'del-1', city: 'Delhi', region: 'IN', country: 'India', lat: 28.7041, lng: 77.1025, amount: 2800, streams: 372000, listeners: 137000, source: 'youtube', songId: 3, songTitle: 'Take the Throne', growth: 52.8, timestamp: now },
  { id: 'ban-1', city: 'Bangkok', region: 'TH', country: 'Thailand', lat: 13.7563, lng: 100.5018, amount: 2100, streams: 280000, listeners: 103000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 33.4, timestamp: now },
  { id: 'jkt-1', city: 'Jakarta', region: 'ID', country: 'Indonesia', lat: -6.2088, lng: 106.8456, amount: 3600, streams: 480000, listeners: 176000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 41.7, timestamp: now },
  { id: 'sgp-1', city: 'Singapore', region: 'SG', country: 'Singapore', lat: 1.3521, lng: 103.8198, amount: 2600, streams: 346000, listeners: 127000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 12.1, timestamp: now },
  { id: 'mnl-1', city: 'Manila', region: 'PH', country: 'Philippines', lat: 14.5995, lng: 120.9842, amount: 2900, streams: 386000, listeners: 142000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 38.6, timestamp: now },
  { id: 'sha-1', city: 'Shanghai', region: 'CN', country: 'China', lat: 31.2304, lng: 121.4737, amount: 1200, streams: 160000, listeners: 59000, source: 'other', songId: 1, songTitle: 'Break the Chain', growth: 8.9, timestamp: now },
  { id: 'hk-1', city: 'Hong Kong', region: 'HK', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, amount: 1800, streams: 240000, listeners: 88000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 10.4, timestamp: now },

  // ── Africa ──
  { id: 'lag-1', city: 'Lagos', region: 'NG', country: 'Nigeria', lat: 6.5244, lng: 3.3792, amount: 6200, streams: 824000, listeners: 303000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 68.4, timestamp: now },
  { id: 'lag-2', city: 'Lagos', region: 'NG', country: 'Nigeria', lat: 6.5244, lng: 3.3792, amount: 4100, streams: 546000, listeners: 200000, source: 'other', songId: 3, songTitle: 'Take the Throne', growth: 54.2, timestamp: now },
  { id: 'nai-1', city: 'Nairobi', region: 'KE', country: 'Kenya', lat: -1.2921, lng: 36.8219, amount: 3800, streams: 506000, listeners: 186000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 72.1, timestamp: now },
  { id: 'job-1', city: 'Johannesburg', region: 'ZA', country: 'South Africa', lat: -26.2041, lng: 28.0473, amount: 4600, streams: 612000, listeners: 225000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 38.9, timestamp: now },
  { id: 'acc-1', city: 'Accra', region: 'GH', country: 'Ghana', lat: 5.6037, lng: -0.187, amount: 2400, streams: 320000, listeners: 117000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 81.3, timestamp: now },
  { id: 'cpt-1', city: 'Cape Town', region: 'ZA', country: 'South Africa', lat: -33.9249, lng: 18.4241, amount: 2100, streams: 280000, listeners: 103000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 29.6, timestamp: now },
  { id: 'dar-1', city: 'Dar es Salaam', region: 'TZ', country: 'Tanzania', lat: -6.7924, lng: 39.2083, amount: 1400, streams: 186000, listeners: 68000, source: 'other', songId: 1, songTitle: 'Break the Chain', growth: 92.4, timestamp: now },
  { id: 'kam-1', city: 'Kampala', region: 'UG', country: 'Uganda', lat: 0.3476, lng: 32.5825, amount: 1100, streams: 146000, listeners: 54000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 105.2, timestamp: now },
  { id: 'kin-1', city: 'Kinshasa', region: 'CD', country: 'DR Congo', lat: -4.4419, lng: 15.2663, amount: 800, streams: 106000, listeners: 39000, source: 'other', songId: 1, songTitle: 'Break the Chain', growth: 120.0, timestamp: now },
  { id: 'cas-1', city: 'Casablanca', region: 'MA', country: 'Morocco', lat: 33.5731, lng: -7.5898, amount: 1600, streams: 213000, listeners: 78000, source: 'deezer', songId: 2, songTitle: 'No Masters', growth: 34.5, timestamp: now },
  { id: 'cai-1', city: 'Cairo', region: 'EG', country: 'Egypt', lat: 30.0444, lng: 31.2357, amount: 1900, streams: 253000, listeners: 93000, source: 'youtube', songId: 3, songTitle: 'Take the Throne', growth: 47.8, timestamp: now },

  // ── Latin America ──
  { id: 'sao-1', city: 'São Paulo', region: 'BR', country: 'Brazil', lat: -23.5505, lng: -46.6333, amount: 8100, streams: 1078000, listeners: 396000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 22.6, timestamp: now },
  { id: 'sao-2', city: 'São Paulo', region: 'BR', country: 'Brazil', lat: -23.5505, lng: -46.6333, amount: 3400, streams: 452000, listeners: 166000, source: 'youtube', songId: 3, songTitle: 'Take the Throne', growth: 31.2, timestamp: now },
  { id: 'rio-1', city: 'Rio de Janeiro', region: 'BR', country: 'Brazil', lat: -22.9068, lng: -43.1729, amount: 4200, streams: 559000, listeners: 205000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 18.9, timestamp: now },
  { id: 'bog-1', city: 'Bogotá', region: 'CO', country: 'Colombia', lat: 4.711, lng: -74.0721, amount: 3100, streams: 412000, listeners: 151000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 36.4, timestamp: now },
  { id: 'bue-1', city: 'Buenos Aires', region: 'AR', country: 'Argentina', lat: -34.6037, lng: -58.3816, amount: 3800, streams: 506000, listeners: 186000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 15.8, timestamp: now },
  { id: 'lim-1', city: 'Lima', region: 'PE', country: 'Peru', lat: -12.0464, lng: -77.0428, amount: 2200, streams: 293000, listeners: 107000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 28.3, timestamp: now },
  { id: 'san-1', city: 'Santiago', region: 'CL', country: 'Chile', lat: -33.4489, lng: -70.6693, amount: 2600, streams: 346000, listeners: 127000, source: 'apple', songId: 1, songTitle: 'Break the Chain', growth: 11.7, timestamp: now },

  // ── Oceania ──
  { id: 'syd-1', city: 'Sydney', region: 'AU', country: 'Australia', lat: -33.8688, lng: 151.2093, amount: 5400, streams: 719000, listeners: 264000, source: 'spotify', songId: 1, songTitle: 'Break the Chain', growth: 9.8, timestamp: now },
  { id: 'mel-1', city: 'Melbourne', region: 'AU', country: 'Australia', lat: -37.8136, lng: 144.9631, amount: 3800, streams: 506000, listeners: 186000, source: 'apple', songId: 2, songTitle: 'No Masters', growth: 7.4, timestamp: now },
  { id: 'akl-1', city: 'Auckland', region: 'NZ', country: 'New Zealand', lat: -36.8485, lng: 174.7633, amount: 1600, streams: 213000, listeners: 78000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 13.2, timestamp: now },

  // ── Middle East ──
  { id: 'dub-1', city: 'Dubai', region: 'AE', country: 'UAE', lat: 25.2048, lng: 55.2708, amount: 3200, streams: 426000, listeners: 156000, source: 'apple', songId: 1, songTitle: 'Break the Chain', growth: 21.4, timestamp: now },
  { id: 'riy-1', city: 'Riyadh', region: 'SA', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, amount: 2400, streams: 320000, listeners: 117000, source: 'spotify', songId: 2, songTitle: 'No Masters', growth: 44.6, timestamp: now },
  { id: 'ist-1', city: 'Istanbul', region: 'TR', country: 'Turkey', lat: 41.0082, lng: 28.9784, amount: 3600, streams: 480000, listeners: 176000, source: 'spotify', songId: 3, songTitle: 'Take the Throne', growth: 27.3, timestamp: now },
  { id: 'tlv-1', city: 'Tel Aviv', region: 'IL', country: 'Israel', lat: 32.0853, lng: 34.7818, amount: 1800, streams: 240000, listeners: 88000, source: 'apple', songId: 1, songTitle: 'Break the Chain', growth: 8.1, timestamp: now },
];

// ── Aggregate by country for the old interface ───────────────────────────────
function aggregateByCountry(flows: CityFlow[]): RoyaltyFlow[] {
  const map = new Map<string, RoyaltyFlow>();
  for (const f of flows) {
    const key = f.country;
    const existing = map.get(key);
    if (existing) {
      existing.amount += f.amount;
    } else {
      map.set(key, {
        region: f.country,
        amount: f.amount,
        lat: f.lat,
        lng: f.lng,
        source: f.source,
        timestamp: f.timestamp,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export const MOCK_ROYALTY_FLOWS: RoyaltyFlow[] = aggregateByCountry(MOCK_CITY_FLOWS);

// ── Aggregate by song ────────────────────────────────────────────────────────
export interface SongStats {
  songId: number;
  title: string;
  totalAmount: number;
  totalStreams: number;
  totalListeners: number;
  topCity: string;
  cityCount: number;
  avgGrowth: number;
}

export function aggregateBySong(flows: CityFlow[]): SongStats[] {
  const map = new Map<number, SongStats>();
  for (const f of flows) {
    const existing = map.get(f.songId);
    if (existing) {
      existing.totalAmount += f.amount;
      existing.totalStreams += f.streams;
      existing.totalListeners += f.listeners;
      existing.cityCount += 1;
      existing.avgGrowth = (existing.avgGrowth * (existing.cityCount - 1) + f.growth) / existing.cityCount;
      if (f.amount > (map.get(f.songId)?.totalAmount ?? 0)) {
        existing.topCity = f.city;
      }
    } else {
      map.set(f.songId, {
        songId: f.songId,
        title: f.songTitle,
        totalAmount: f.amount,
        totalStreams: f.streams,
        totalListeners: f.listeners,
        topCity: f.city,
        cityCount: 1,
        avgGrowth: f.growth,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

// ── Aggregate by city (merge per-song entries) ───────────────────────────────
export interface CityAggregate {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  totalAmount: number;
  totalStreams: number;
  totalListeners: number;
  songCount: number;
  topSource: string;
  avgGrowth: number;
}

export function aggregateByCity(flows: CityFlow[]): CityAggregate[] {
  const map = new Map<string, CityAggregate>();
  for (const f of flows) {
    const existing = map.get(f.city);
    if (existing) {
      existing.totalAmount += f.amount;
      existing.totalStreams += f.streams;
      existing.totalListeners += f.listeners;
      existing.songCount += 1;
      existing.avgGrowth = (existing.avgGrowth * (existing.songCount - 1) + f.growth) / existing.songCount;
    } else {
      map.set(f.city, {
        city: f.city,
        country: f.country,
        region: f.region,
        lat: f.lat,
        lng: f.lng,
        totalAmount: f.amount,
        totalStreams: f.streams,
        totalListeners: f.listeners,
        songCount: 1,
        topSource: f.source,
        avgGrowth: f.growth,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

export const MOCK_SOURCES = [
  { name: 'Spotify', amount: 78500, percentage: 45, color: '#F5F0E8' },
  { name: 'Apple Music', amount: 42000, percentage: 24, color: '#D4CFC6' },
  { name: 'YouTube', amount: 28000, percentage: 16, color: '#B3AFA6' },
  { name: 'Deezer', amount: 15000, percentage: 9, color: '#928F87' },
  { name: 'Other', amount: 10500, percentage: 6, color: '#716E68' },
];
