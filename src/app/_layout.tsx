import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { QuestionsProvider } from '@/hooks/use-questions';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QuestionsProvider>
        <Stack screenOptions={{ headerShown: false, title: 'Round robin' }} />
      </QuestionsProvider>
    </ThemeProvider>
  );
}
