import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/networkStore';

export function initializeNetworkMonitoring() {
  const syncStatus = (state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
    const online = Boolean(state.isConnected && (state.isInternetReachable ?? true));
    onlineManager.setOnline(online);
    useNetworkStore.getState().setNetworkStatus({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
    });
  };

  NetInfo.fetch().then(syncStatus);
  const unsubscribe = NetInfo.addEventListener(syncStatus);

  return unsubscribe;
}
