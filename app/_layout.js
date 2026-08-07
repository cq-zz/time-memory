import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts, WorkSans_400Regular, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { useSettingsStore } from '../src/store/settings';
import { useMoodStore } from '../src/store/mood';
import { useCategoryStore } from '../src/store/categories';
import { useProfileStore } from '../src/store/profile';
import { useTheme } from '../src/utils/theme';
import ToastProvider from '../src/components/common/Toast';
import { AlertProvider } from '../src/hooks/useAlert';
import { initNotifications, setupNotificationResponseListener, removeNotificationResponseListener } from '../src/services/notifications';

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

  // Notification init — runs after settings are loaded
  useEffect(() => {
    if (!settingsLoaded) return;
    const init = async () => {
      await initNotifications();
      setupNotificationResponseListener();
    };
    init();
    return () => {
      removeNotificationResponseListener();
    };
  }, [settingsLoaded]);

  if (!fontsLoaded || !settingsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider
      statusBarTranslucent
      navigationBarTranslucent
      preserveEdgeToEdge
    >
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
          <StatusBar
            barStyle={darkMode ? 'light-content' : 'dark-content'}
            translucent
          />
        </AlertProvider>
      </ToastProvider>
    </KeyboardProvider>
  );
}
