import { useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import ModuleHeader from '../../src/components/common/ModuleHeader';

function Section({ icon, title, children }) {
  const { Colors, Radius, Fonts } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}>
      {title ? (
        <View style={styles.sectionHead}>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
              <Ionicons name={icon} size={18} color={Colors.purple} />
            </View>
          ) : null}
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{title}</Text>
        </View>
      ) : null}
      <View style={[styles.sectionBody, title && { marginTop: 0 }]}>
        {children}
      </View>
    </View>
  );
}

function BodyText({ children, style }) {
  const { Colors, Fonts } = useTheme();
  return (
    <Text style={[{ color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22 }, style]}>
      {children}
    </Text>
  );
}

function BulletList({ items }) {
  const { Colors, Fonts } = useTheme();
  return (
    <View style={styles.bulletList}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: Colors.purple }]}>•</Text>
          <BodyText style={styles.bulletText}>{item}</BodyText>
        </View>
      ))}
    </View>
  );
}

function SubSection({ title, content }) {
  const { Colors, Fonts } = useTheme();
  return (
    <View style={styles.subSection}>
      {title ? (
        <Text style={[styles.subTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>{title}</Text>
      ) : null}
      {typeof content === 'string' ? <BodyText>{content}</BodyText> : content}
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
    if (containerHeight > 0 && h <= containerHeight) {
      setShowFade(false);
    }
  }, [containerHeight]);

  const handleLayout = useCallback((e) => {
    const h = e.nativeEvent.layout.height;
    setContainerHeight(h);
    if (contentHeight > 0 && contentHeight <= h) {
      setShowFade(false);
    }
  }, [contentHeight]);

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
          {/* 生效日期 */}
          <Text style={[styles.dateText, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            {t('privacyPolicy.effectiveDate')}
          </Text>
          <Text style={[styles.introText, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
            {t('privacyPolicy.intro')}
          </Text>

          {/* 核心承诺 */}
          <View style={[styles.coreCard, { backgroundColor: hexToRgba(Colors.purple, 0.08), borderColor: hexToRgba(Colors.purple, 0.2), borderRadius: 16 }]}>
            <View style={styles.coreIcon}>
              <Ionicons name="shield-checkmark-outline" size={28} color={Colors.purple} />
            </View>
            <Text style={[styles.coreText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {t('privacyPolicy.coreCommitment')}
            </Text>
          </View>

          {/* 第1节：开发者信息 */}
          <Section icon="person-outline" title={t('privacyPolicy.section1Title')}>
            <BodyText>{t('privacyPolicy.section1')}</BodyText>
            <BulletList items={t('privacyPolicy.section1_1', { returnObjects: true })} />
          </Section>

          {/* 第2节：数据收集披露 */}
          <Section icon="cloud-offline-outline" title={t('privacyPolicy.section2Title')}>
            <BodyText>{t('privacyPolicy.section2')}</BodyText>
            <SubSection title={t('privacyPolicy.section2_1Title')} content={t('privacyPolicy.section2_1')} />
            <SubSection title={t('privacyPolicy.section2_2Title')} content={t('privacyPolicy.section2_2')} />
            <SubSection title={t('privacyPolicy.section2_3Title')} content={t('privacyPolicy.section2_3')} />
            <BulletList items={t('privacyPolicy.section2_3Items', { returnObjects: true })} />
          </Section>

          {/* 第3节：数据存储 */}
          <Section icon="phone-portrait-outline" title={t('privacyPolicy.section3Title')}>
            <BodyText>{t('privacyPolicy.section3')}</BodyText>
            <BulletList items={t('privacyPolicy.section3_1', { returnObjects: true })} />
            <BodyText>{t('privacyPolicy.section3_2')}</BodyText>
            <BodyText>{t('privacyPolicy.section3_3')}</BodyText>
          </Section>

          {/* 第4节：数据使用方式 */}
          <Section icon="options-outline" title={t('privacyPolicy.section4Title')}>
            <BodyText>{t('privacyPolicy.section4')}</BodyText>
            <BulletList items={t('privacyPolicy.section4_1', { returnObjects: true })} />
            <BodyText>{t('privacyPolicy.section4_2')}</BodyText>
          </Section>

          {/* 第5节：数据共享与第三方 */}
          <Section icon="share-outline" title={t('privacyPolicy.section5Title')}>
            <BodyText>{t('privacyPolicy.section5')}</BodyText>
            <BodyText>{t('privacyPolicy.section5_1')}</BodyText>
            <SubSection title={t('privacyPolicy.section5_2Title')} content={t('privacyPolicy.section5_2')} />
            <SubSection title={t('privacyPolicy.section5_3Title')} content={t('privacyPolicy.section5_3')} />
          </Section>

          {/* 第6节：应用权限说明 */}
          <Section icon="key-outline" title={t('privacyPolicy.section6Title')}>
            <SubSection title={t('privacyPolicy.section6_1Title')} content={t('privacyPolicy.section6_1')} />
            <SubSection title={t('privacyPolicy.section6_2Title')} content={t('privacyPolicy.section6_2')} />
            <SubSection title={t('privacyPolicy.section6_3Title')} content={t('privacyPolicy.section6_3')} />
            <SubSection title={t('privacyPolicy.section6_4Title')} content={t('privacyPolicy.section6_4')} />
          </Section>

          {/* 第7节：数据安全 */}
          <Section icon="lock-closed-outline" title={t('privacyPolicy.section7Title')}>
            <BodyText>{t('privacyPolicy.section7')}</BodyText>
            <BulletList items={t('privacyPolicy.section7_1', { returnObjects: true })} />
            <BodyText>{t('privacyPolicy.section7_2')}</BodyText>
          </Section>

          {/* 第8节：数据保留与删除 */}
          <Section icon="trash-outline" title={t('privacyPolicy.section8Title')}>
            <BodyText>{t('privacyPolicy.section8')}</BodyText>
            <BulletList items={t('privacyPolicy.section8_1', { returnObjects: true })} />
            <BodyText>{t('privacyPolicy.section8_2')}</BodyText>
          </Section>

          {/* 第9节：您的权利 */}
          <Section icon="hand-left-outline" title={t('privacyPolicy.section9Title')}>
            <BodyText>{t('privacyPolicy.section9')}</BodyText>
            <BulletList items={t('privacyPolicy.section9_1', { returnObjects: true })} />
            <BodyText>{t('privacyPolicy.section9_2')}</BodyText>
          </Section>

          {/* 第10节：儿童隐私 */}
          <Section icon="people-outline" title={t('privacyPolicy.section10Title')}>
            <BodyText>{t('privacyPolicy.section10')}</BodyText>
            <BodyText>{t('privacyPolicy.section10_1')}</BodyText>
          </Section>

          {/* 第11节：跨境数据传输 */}
          <Section icon="globe-outline" title={t('privacyPolicy.section11Title')}>
            <BodyText>{t('privacyPolicy.section11')}</BodyText>
          </Section>

          {/* 第12节：隐私政策更新 */}
          <Section icon="refresh-outline" title={t('privacyPolicy.section12Title')}>
            <BodyText>{t('privacyPolicy.section12')}</BodyText>
            <BodyText>{t('privacyPolicy.section12_1')}</BodyText>
          </Section>

          {/* 第13节：联系我们 */}
          <Section icon="mail-outline" title={t('privacyPolicy.section13Title')}>
            <BodyText>{t('privacyPolicy.section13')}</BodyText>
            <BulletList items={t('privacyPolicy.section13_1', { returnObjects: true })} />
          </Section>

          {/* 第14节：合规声明 */}
          <Section icon="document-text-outline" title={t('privacyPolicy.section14Title')}>
            <BodyText>{t('privacyPolicy.section14')}</BodyText>
            <BulletList items={t('privacyPolicy.section14_1', { returnObjects: true })} />
          </Section>

          {/* 底部间距 */}
          <View style={{ height: 48 }} />
        </ScrollView>

        {/* 底部渐变遮罩 */}
        {showFade && (
          <LinearGradient
            colors={[hexToRgba(Colors.bg, 0), Colors.bg]}
            style={[styles.fadeBottom, { pointerEvents: 'none' }]}
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
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0, gap: 12 },
  dateText: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  introText: { fontSize: 14, lineHeight: 22, textAlign: 'left', paddingHorizontal: 4 },
  coreCard: {
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  coreIcon: { marginBottom: 2 },
  coreText: { fontSize: 14, lineHeight: 22, textAlign: 'left' },
  section: { borderWidth: 1, padding: 16, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, lineHeight: 22 },
  sectionBody: { gap: 12 },
  subSection: { gap: 4 },
  subTitle: { fontSize: 14, lineHeight: 20 },
  bulletList: { gap: 6 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { fontSize: 14, lineHeight: 22, marginRight: 8, marginTop: 0 },
  bulletText: { flex: 1 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 },
});