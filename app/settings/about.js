import { useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import ModuleHeader from '../../src/components/common/ModuleHeader';

const FEATURE_ICONS = {
  bills: 'card-outline',
  durable: 'cube-outline',
  asset: 'trending-up-outline',
  schedule: 'calendar-outline',
  diary: 'book-outline',
  importantDate: 'heart-outline',
  budget: 'cash-outline',
  mood: 'happy-outline',
};

export default function AboutScreen() {
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

  const features = t('about.features', { returnObjects: true });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('about.title')} />
      <View style={styles.scrollWrapper} onLayout={handleLayout}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          {/* App Identity */}
          <View style={styles.hero}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.appName, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('home.brand')}
            </Text>
            <Text style={[styles.slogan, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              {t('home.heroKicker')}
            </Text>
          </View>

          {/* Introduction */}
          <View style={[styles.card, { backgroundColor: hexToRgba(Colors.purple, 0.06), borderColor: hexToRgba(Colors.purple, 0.15), borderRadius: 16 }]}>
            <Text style={[styles.introText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {t('about.intro')}
            </Text>
          </View>

          {/* Features Grid */}
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {t('about.featuresTitle')}
          </Text>
          <View style={styles.featureGrid}>
            {features.map((item) => {
              const icon = FEATURE_ICONS[item.key] || 'pricetag-outline';
              return (
                <View
                  key={item.key}
                  style={[styles.featureItem, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: 14 }]}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.08) }]}>
                    <Ionicons name={icon} size={20} color={Colors.purple} />
                  </View>
                  <Text style={[styles.featureName, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.featureDesc, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                    {item.desc}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Data Relationships */}
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {t('about.relationsTitle')}
          </Text>
          <View style={styles.relationsList}>
            {t('about.relations', { returnObjects: true }).map((item, idx) => (
              <View key={idx} style={[styles.relationItem, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: 12 }]}>
                <View style={styles.relationFlow}>
                  <View style={[styles.relationBadge, { backgroundColor: hexToRgba(Colors.purple, 0.1) }]}>
                    <Text style={[styles.relationBadgeText, { color: Colors.purple, fontFamily: Fonts.semiBold }]}>
                      {item.from}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={Colors.textTertiary} />
                  <View style={[styles.relationBadge, { backgroundColor: hexToRgba(Colors.purple, 0.1) }]}>
                    <Text style={[styles.relationBadgeText, { color: Colors.purple, fontFamily: Fonts.semiBold }]}>
                      {item.to}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.relationDesc, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>

          {/* Version */}
          <View style={styles.versionRow}>
            <Text style={[styles.versionText, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              {t('about.version')} {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>

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
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  hero: { alignItems: 'center', gap: 10, paddingBottom: 8 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  appName: { fontSize: 26, lineHeight: 34 },
  slogan: { fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, padding: 18 },
  introText: { fontSize: 14, lineHeight: 24 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureName: { fontSize: 14, lineHeight: 20 },
  featureDesc: { fontSize: 12, lineHeight: 18 },
  relationsList: { gap: 10 },
  relationItem: { borderWidth: 1, padding: 14, gap: 8 },
  relationFlow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  relationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relationBadgeText: { fontSize: 13, lineHeight: 18 },
  relationDesc: { fontSize: 12, lineHeight: 18 },
  versionRow: { alignItems: 'center', paddingTop: 8 },
  versionText: { fontSize: 12 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 },
});