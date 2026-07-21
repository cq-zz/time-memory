import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, WorkSans_400Regular, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
