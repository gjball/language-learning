import { Platform, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Spacing } from '@/constants/theme';

/**
 * The web address students should open. A configured public address
 * (EXPO_PUBLIC_APP_URL) wins, so the QR code always points at the public site
 * even when the teacher is viewing a private preview copy of it. Otherwise,
 * in a browser, it is wherever the app is being served from.
 */
export function getAppAddress(): string | null {
  const configured = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured && /^https?:\/\/[^/]+$/.test(configured)) return configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  return null;
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
