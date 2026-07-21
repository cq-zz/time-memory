import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function ImportantDateHero({ image, fallbackIcon, title, typeText, typeColor, countdownText }) {
  const { Colors, Fonts } = useTheme();
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
          <Ionicons name={fallbackIcon || 'heart-outline'} size={72} color={Colors.textTertiary} />
        </View>
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        locations={[0.35, 1]}
        style={styles.scrim}
      />

      <View style={styles.overlay}>
        <View style={[styles.typePill, { backgroundColor: typeColor }]}>
          <Text style={[styles.typeText, { color: Colors.white, fontFamily: Fonts.bold }]}>{typeText}</Text>
        </View>

        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.bold }]}>{title}</Text>

        <View style={styles.costRow}>
          <Text style={[styles.costLabel, { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bold }]}>
            COUNTDOWN
          </Text>
          <Text style={[styles.costValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {countdownText}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 420,
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
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeText: {
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
  },
  costValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
