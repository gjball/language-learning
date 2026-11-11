import { Platform, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Spacing } from '@/constants/theme';

/**
 * The web address students should open. In a browser this is wherever the app
 * is being served from; in the installed app it comes from EXPO_PUBLIC_APP_URL.
 */
export function getAppAddress(): string | null {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.location.origin;
  }
  return process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '') ?? null;
}

/** The link that opens the app with the join code already filled in. */
export function joinUrl(address: string, code: string): string {
  return `${address}/?code=${code}`;
}

/** A QR code on a white tile, so it scans in dark mode too. */
export function JoinQrCode({ url, size = 176 }: { url: string; size?: number }) {
  return (
    <View style={styles.tile}>
      <QRCode value={url} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: '#ffffff',
  },
});
