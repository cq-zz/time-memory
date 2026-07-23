import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, WorkSans_400Regular, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { useSettingsStore } from '../src/store/settings';
import { useMoodStore } from '../src/store/mood';
import { useCategoryStore } from '../src/store/categories';
import { useProfileStore } from '../src/store/profile';
import { useTheme } from '../src/utils/theme';
import ToastProvider from '../src/components/common/Toast';
import { AlertProvider } from '../src/hooks/useAlert';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const { Colors } = useTheme();

  useEffect(() => {
    loadSettings();
    // Secondary stores load in the background — never gate first render.
    useMoodStore.getState().loadMoods();
    useCategoryStore.getState().loadCategories();
    useProfileStore.getState().loadProfile();
  }, []);

  if (!fontsLoaded || !settingsLoaded) {
    return null;
  }

  return (
    <ToastProvider>
      <AlertProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: Colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
      </AlertProvider>
    </ToastProvider>
  );
}
