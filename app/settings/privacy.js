import { useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import ModuleHeader from '../../src/components/common/ModuleHeader';

function Section({ title, children }) {
  const { Colors, Fonts } = useTheme();
  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{title}</Text>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BodyText({ children }) {
  const { Colors, Fonts } = useTheme();
  return (
    <Text style={[{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22 }]}>
      {children}
    </Text>
  );
}

function BulletList({ items }) {
  const { Colors } = useTheme();
  return (
    <View style={styles.bulletList}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: Colors.purple }]}>•</Text>
          <BodyText>{item}</BodyText>
        </View>
      ))}
    </View>
  );
}

function BulletItem({ children }) {
  const { Colors } = useTheme();
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: Colors.purple }]}>•</Text>
      <BodyText>{children}</BodyText>
    </View>
  );
}

export default function PrivacyScreen() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [showFade, setShowFade] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback((e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 4;
    setShowFade(!isAtBottom);
  }, []);

  const handleContentSizeChange = useCallback((w, h) => {
    setContentHeight(h);
    if (containerHeight > 0 && h <= containerHeight) setShowFade(false);
  }, [containerHeight]);

  const handleLayout = useCallback((e) => {
    const h = e.nativeEvent.layout.height;
    setContainerHeight(h);
    if (contentHeight > 0 && contentHeight <= h) setShowFade(false);
  }, [contentHeight]);

  const section2_3Items = t('privacyPolicy.section2_3Items', { returnObjects: true });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('privacyPolicy.title')} />
      <View style={styles.scrollWrapper} onLayout={handleLayout}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          <Text style={[styles.dateText, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            {t('privacyPolicy.effectiveDate')}
          </Text>

          {/* 核心承诺 */}
          <View style={[styles.coreCard, { backgroundColor: hexToRgba(Colors.purple, 0.08), borderColor: hexToRgba(Colors.purple, 0.2), borderRadius: 16 }]}>
            <Ionicons name="shield-checkmark-outline" size={28} color={Colors.purple} />
            <Text style={[styles.coreText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {t('privacyPolicy.coreCommitment')}
            </Text>
          </View>

          {/* 第1节：数据收集与存储 */}
          <Section title={t('privacyPolicy.section1Title')}>
            <BodyText>{t('privacyPolicy.section1')}</BodyText>
          </Section>

          {/* 第2节：明确不收集的数据类型 */}
          <Section title={t('privacyPolicy.section2Title')}>
            <BodyText>{t('privacyPolicy.section2')}</BodyText>
            <BulletList items={section2_3Items} />
          </Section>

          {/* 第3节：数据使用与共享 */}
          <Section title={t('privacyPolicy.section3Title')}>
            <BodyText>{t('privacyPolicy.section3')}</BodyText>
            <BodyText>{t('privacyPolicy.section5')}</BodyText>
          </Section>

          {/* 第4节：应用权限 */}
          <Section title={t('privacyPolicy.section6Title')}>
            <BulletItem>{t('privacyPolicy.section6_1')}</BulletItem>
            <BulletItem>{t('privacyPolicy.section6_2')}</BulletItem>
            <BulletItem>{t('privacyPolicy.section6_3')}</BulletItem>
            <BulletItem>{t('privacyPolicy.section6_4')}</BulletItem>
          </Section>

          {/* 第5节：数据安全与删除 */}
          <Section title={t('privacyPolicy.section7Title')}>
            <BodyText>{t('privacyPolicy.section7')}</BodyText>
            <BodyText>{t('privacyPolicy.section8')}</BodyText>
          </Section>

          {/* 第6节：您的权利 */}
          <Section title={t('privacyPolicy.section9Title')}>
            <BodyText>{t('privacyPolicy.section9')}</BodyText>
          </Section>

          {/* 第7节：儿童隐私 */}
          <Section title={t('privacyPolicy.section10Title')}>
            <BodyText>{t('privacyPolicy.section10')}</BodyText>
          </Section>

          {/* 第8节：隐私政策更新 */}
          <Section title={t('privacyPolicy.section12Title')}>
            <BodyText>{t('privacyPolicy.section12')}</BodyText>
          </Section>

          {/* 第9节：联系我们 + 合规 */}
          <Section title={t('privacyPolicy.section13Title')}>
            <BodyText>{t('privacyPolicy.section13')}</BodyText>
            <BodyText>{t('privacyPolicy.section14')}</BodyText>
          </Section>

          <View style={{ height: 48 }} />
        </ScrollView>

        {showFade && (
          <LinearGradient
            colors={[hexToRgba(Colors.bg, 0), Colors.bg]}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0, gap: 16 },
  dateText: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  coreCard: {
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  coreText: { fontSize: 14, lineHeight: 22, textAlign: 'left' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  sectionBody: { gap: 10 },
  bulletList: { gap: 6 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { fontSize: 14, lineHeight: 22 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 },
});