import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

export default function DurableHero({ image, fallbackIcon, title, statusText, statusColor, totalCostText }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(image) && !imageError;

  return (
    <View style={styles.container}>
      {showImage ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.image, styles.imageFallback, { backgroundColor: Colors.avatarBg }]}>
          <Ionicons name={fallbackIcon || 'cube-outline'} size={72} color={Colors.textTertiary} />
        </View>
      )}

      {/* Scrim for text readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        locations={[0.35, 1]}
        style={styles.scrim}
      />

      {/* Floating header over image */}
      <View style={styles.overlay}>
        {/* Status pill */}
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: Colors.white }]} />
          <Text style={[styles.statusText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {statusText}
          </Text>
        </View>

        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.bold }]}>{title}</Text>

        <View style={styles.costRow}>
          <Text style={[styles.costLabel, { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bold }]}>
            {t('detail.totalCost')}
          </Text>
          <Text style={[styles.costValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {totalCostText}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 480,
    width: '100%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 27,
    paddingBottom: 24,
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  costLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  costValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
