import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useMoodStore } from '../../store/mood';
import { moodMeta } from '../../utils/constant';

const MAX_BAR = 72;
const SCORE_COLORS = { 5: '#4AA868', 4: '#6BAA90', 3: '#E8B830', 2: '#F28B50', 1: '#D94452' };

/** Last 7 days (oldest → today) as { label, mood, score, emoji }. */
function last7Days(records) {
  const byDate = new Map((records || []).map((r) => [r.check_date, r.mood]));
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const mood = byDate.get(key) || null;
    const meta = mood ? moodMeta(mood) : null;
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      mood,
      score: meta ? meta.score : null,
      emoji: meta ? meta.emoji : '',
    });
  }
  return days;
}

export default function MoodTrend() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const records = useMoodStore((s) => s.records);

  const days = last7Days(records);
  const checked = days.filter((d) => d.score != null);
  const avg = checked.length
    ? checked.reduce((s, d) => s + d.score, 0) / checked.length
    : null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('home.moodTrendTitle')}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
          Shadows.card,
        ]}
      >
        <Text style={[styles.rangeLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('moodTrend.last7Days')}
        </Text>

        {checked.length ? (
          <View style={styles.chartArea}>
            {days.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: d.score != null ? Math.max((d.score / 5) * MAX_BAR, 10) : 8,
                        backgroundColor: d.score != null ? SCORE_COLORS[d.score] : Colors.grayDot,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.axisDate, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                  {d.label}
                </Text>
                <Text style={[styles.axisMood, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                  {d.score != null ? `${d.emoji} ${d.score}` : '–'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('moodTrend.noData')}
            </Text>
            <Text style={[styles.emptyDesc, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {t('moodTrend.noDataDesc')}
            </Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendRow}>
          {[5, 4, 3, 2, 1].map((score) => (
            <View key={score} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: SCORE_COLORS[score] }]} />
              <Text style={[styles.legendScore, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                {score}
              </Text>
            </View>
          ))}
        </View>

        {/* Insight row */}
        <View style={styles.insightRow}>
          <View style={styles.insightLeft}>
            <View style={[styles.insightIcon, { backgroundColor: 'rgba(242, 139, 80, 0.1)' }]}>
              <Ionicons name="flame" size={20} color={Colors.orange} />
            </View>
            <View style={styles.insightText}>
              <Text style={[styles.insightTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                {avg != null ? t('home.avgScore', { score: avg.toFixed(1) }) : '--'}
              </Text>
              <Text style={[styles.insightDesc, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {t('moodTrend.checkInDays', { days: checked.length })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  rangeLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    height: MAX_BAR,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 18,
    borderRadius: 9999,
  },
  axisDate: {
    fontSize: 11,
    lineHeight: 14,
  },
  axisMood: {
    fontSize: 12,
    lineHeight: 16,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
  legendScore: {
    fontSize: 11,
    lineHeight: 14,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    gap: 1,
  },
  insightTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  insightDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
