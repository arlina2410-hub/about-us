import { useSyncExternalStore } from 'react';
import { getInstallKind, subscribeInstall, type InstallKind } from './install';
import { isUpdateReady, subscribeUpdate } from './registerSW';

export function useUpdateReady(): boolean {
  return useSyncExternalStore(subscribeUpdate, isUpdateReady, () => false);
}

export function useInstallKind(): InstallKind {
  return useSyncExternalStore(subscribeInstall, getInstallKind, () => 'manual' as InstallKind);
}
