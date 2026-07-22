import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { getPasswordHistory } from '../../src/utils/passwordHistory';
import ModuleHeader from '../../src/components/common/ModuleHeader';

/**
 * Password history list — every set / change / reset of the private-diary
 * password with its timestamp, newest first (logic ported from the legacy
 * project).
 */
export default function PasswordHistoryScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPasswordHistory()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const typeMeta = (type) => {
    if (type === 'set') return { label: t('settings.passwordHistorySet'), color: Colors.green, icon: 'add-circle-outline' };
    if (type === 'change') return { label: t('settings.passwordHistoryChange'), color: Colors.purple, icon: 'create-outline' };
    return { label: t('settings.passwordHistoryReset'), color: Colors.rose, icon: 'refresh-outline' };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('settings.passwordHistoryTitle')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {records.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={48} color={hexToRgba(Colors.purple, 0.3)} />
            <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {loading ? t('common.loading') : t('settings.passwordHistoryEmpty')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {records.map((rec, i) => {
              const meta = typeMeta(rec.type);
              return (
                <View
                  key={`${rec.time}-${i}`}
                  style={[
                    styles.rowCard,
                    { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: hexToRgba(meta.color, 0.12) }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <Text style={[styles.rowLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                    {meta.label}
                  </Text>
                  <Text style={[styles.rowTime, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                    {rec.time}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  list: {
    gap: 12,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  rowTime: {
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
