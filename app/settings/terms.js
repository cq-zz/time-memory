import { useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function TermsScreen() {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('termsOfService.title')} />
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
            {t('termsOfService.effectiveDate')}
          </Text>

          <Section title={t('termsOfService.section1Title')}>
            <BodyText>{t('termsOfService.section1')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section2Title')}>
            <BodyText>{t('termsOfService.section2')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section3Title')}>
            <BodyText>{t('termsOfService.section3')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section4Title')}>
            <BodyText>{t('termsOfService.section4')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section5Title')}>
            <BodyText>{t('termsOfService.section5')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section6Title')}>
            <BodyText>{t('termsOfService.section6')}</BodyText>
          </Section>

          <Section title={t('termsOfService.section7Title')}>
            <BodyText>{t('termsOfService.section7')}</BodyText>
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
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  sectionBody: { gap: 10 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 },
});