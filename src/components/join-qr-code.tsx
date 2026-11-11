import { Platform, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/**
 * The web address students should open. In a browser this is wherever the app
 * is being served from; in the installed app it comes from EXPO_PUBLIC_APP_URL.
 */
function appAddress(): string | null {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.location.origin;
  }
  return process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '') ?? null;
}

/** A QR code that opens the app with the join code already filled in. */
export function JoinQrCode({ code }: { code: string }) {
  const address = appAddress();
  if (!address) return null;

  return (
    <View style={styles.container}>
      {/* White backing so the code scans in dark mode too. */}
      <View style={styles.code}>
        <QRCode value={`${address}/?code=${code}`} size={180} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        Scan to join, or go to
      </ThemedText>
      <ThemedText type="smallBold" style={styles.centered} selectable>
        {address.replace(/^https?:\/\//, '')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  code: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#ffffff',
    marginBottom: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
});
