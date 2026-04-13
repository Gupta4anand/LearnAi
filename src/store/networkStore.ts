import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  setNetworkStatus: (status: { isConnected: boolean | null; isInternetReachable: boolean | null }) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: null,
  isInternetReachable: null,
  setNetworkStatus: ({ isConnected, isInternetReachable }) =>
    set({
      isConnected,
      isInternetReachable,
    }),
}));
