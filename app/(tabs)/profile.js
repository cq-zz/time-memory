import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/utils/theme';
import ProfileHeader from '../../src/components/profile/ProfileHeader';
import ProfileHero from '../../src/components/profile/ProfileHero';
import SettingGroups from '../../src/components/profile/SettingGroups';

export default function ProfileScreen() {
  const { Colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.card }]} edges={['top']}>
      <ProfileHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero />
        <SettingGroups />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 32,
    gap: 32,
  },
});
