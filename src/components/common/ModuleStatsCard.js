import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function ModuleStatsCard({
  label,
  value,
  metrics,
  pills = [],
  compact = false,
  dense = false,
  pillsTopRight = false,
}) {
  const { Colors, Fonts, Shadows } = useTheme();
  const hasMetrics = Array.isArray(metrics) && metrics.length > 0;
  const isCompact = compact || dense || hasMetrics;

  return (
    <View
      style={[
        styles.card,
        isCompact && styles.compactCard,
        dense && styles.denseCard,
        { backgroundColor: Colors.inkDeep },
        Shadows.dark,
      ]}
    >
      {hasMetrics ? (
        <View style={styles.metricsRow}>
          {metrics.map((metric, index) => (
            <View
              key={metric.key ?? index}
              style={[
                styles.metric,
                index > 0 && { borderLeftColor: Colors.white10, borderLeftWidth: 1 },
              ]}
            >
              <Text style={[styles.label, styles.metricLabel, { color: Colors.white, fontFamily: Fonts.bold }]}>
                {metric.label}
              </Text>
              <Text
                style={[styles.metricValue, { color: Colors.white, fontFamily: Fonts.bold }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {metric.value}
              </Text>
              {metric.caption ? (
                <Text style={[styles.metricCaption, { fontFamily: Fonts.semiBold }]}>
                  {metric.caption}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.content, isCompact && styles.compactContent]}>
          <Text style={[styles.label, isCompact && styles.metricLabel, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {label}
          </Text>
          <Text
            style={[
              styles.value,
              isCompact && styles.compactValue,
              dense && styles.denseValue,
              { color: Colors.white, fontFamily: Fonts.bold },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={isCompact}
            minimumFontScale={0.6}
          >
            {value}
          </Text>
        </View>
      )}
      {pills.length > 0 ? (
        <View
          style={[
            styles.pillsWrap,
            isCompact && styles.compactPillsWrap,
            dense && styles.densePillsWrap,
            pillsTopRight && styles.topRightPillsWrap,
          ]}
        >
          <View style={styles.pillsRow}>
            {pills.map((pill, index) => (
              <View
                key={pill.key ?? index}
                style={[styles.pill, { backgroundColor: pill.backgroundColor ?? Colors.white10 }]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: pill.color ?? 'rgba(255, 255, 255, 0.7)',
                      fontFamily: Fonts.bold,
                    },
                  ]}
                >
                  {pill.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 32,
  },
  compactCard: {
    paddingVertical: 10,
  },
  denseCard: {
    paddingVertical: 6,
  },
  content: {
    gap: 4,
  },
  compactContent: {
    gap: 1,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    gap: 1,
    minWidth: 0,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  value: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  compactValue: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.44,
  },
  denseValue: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.44,
  },
  metricCaption: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 10,
    lineHeight: 14,
  },
  pillsWrap: {
    paddingTop: 12,
  },
  compactPillsWrap: {
    paddingTop: 6,
  },
  densePillsWrap: {
    paddingTop: 4,
  },
  topRightPillsWrap: {
    position: 'absolute',
    top: 10,
    right: 14,
    paddingTop: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
