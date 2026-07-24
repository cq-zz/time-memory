import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import ModuleHeader from '../../src/components/common/ModuleHeader';

function Section({ icon, title, content }) {
  const { Colors, Radius, Fonts } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}>
      <View style={styles.sectionHead}>
        <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
          <Ionicons name={icon} size={18} color={Colors.purple} />
        </View>
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionContent, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{content}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const sections = [
    ['shield-checkmark-outline', t('privacyPolicy.localOnlyTitle'), t('privacyPolicy.section1')],
    ['cloud-offline-outline', t('privacyPolicy.noCollectionTitle'), t('privacyPolicy.section2')],
    ['phone-portrait-outline', t('privacyPolicy.storageTitle'), t('privacyPolicy.section3_2')],
    ['hand-left-outline', t('privacyPolicy.controlTitle'), t('privacyPolicy.section8_2')],
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('profile.privacyPolicy')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark-outline" size={30} color={Colors.purple} />
          </View>
          <Text style={[styles.introText, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {'　　'}{t('privacyPolicy.coreCommitment')}
          </Text>
        </View>
        {sections.map(([icon, title, content]) => (
          <Section key={title} icon={icon} title={title} content={content} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 32, gap: 12 },
  intro: { paddingHorizontal: 12, paddingTop: 0, paddingBottom: 16 },
  introIcon: { alignItems: 'center', paddingBottom: 10 },
  introText: { fontSize: 16, lineHeight: 25, textAlign: 'left' },
  section: { borderWidth: 1, padding: 16, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, lineHeight: 22 },
  sectionContent: { fontSize: 14, lineHeight: 22 },
});
