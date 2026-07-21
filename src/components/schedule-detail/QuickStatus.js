import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { SCHEDULE_STATUS_OPTIONS } from '../../utils/constant';
import { statusMeta } from '../../utils/scheduleMeta';

/** Quick-action chips to move a plan to any status other than its current one. */
export default function QuickStatus({ current, onSetStatus }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  const options = SCHEDULE_STATUS_OPTIONS.filter((o) => o.key !== current);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {t('schedule.quickActions')}
      </Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const sta = statusMeta(opt.key, Colors, t);
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => onSetStatus(opt.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: hexToRgba(sta.color, 0.12),
                  borderColor: hexToRgba(sta.color, 0.3),
                  borderRadius: Radius.pill,
                },
              ]}
            >
              <Ionicons name={sta.icon} size={15} color={sta.color} />
              <Text style={[styles.chipText, { color: sta.color, fontFamily: Fonts.bold }]}>
                {sta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
});
