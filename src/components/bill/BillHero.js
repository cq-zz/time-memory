import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, hexToRgba } from '../../utils/theme';
import ImagePreviewModal from '../common/ImagePreviewModal';

export default function BillHero({
  image,
  fallbackIcon,
  title,
  amountLabel,
  amountText,
  typeText,
  typeColor,
}) {
  const { Colors, Fonts } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const lastCloseRef = useRef(0);
  const showImage = Boolean(image) && !imageError;

  const openPreview = () => {
    if (Date.now() - lastCloseRef.current >= 400) setPreviewOpen(true);
  };
  const closePreview = () => {
    lastCloseRef.current = Date.now();
    setPreviewOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrap}>
        {showImage ? (
          <TouchableOpacity activeOpacity={0.9} style={styles.imageFill} onPress={openPreview}>
            <Image
              source={{ uri: image }}
              style={[styles.image, { backgroundColor: Colors.avatarBg }]}
              contentFit="contain"
              onError={() => setImageError(true)}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.imageFill, styles.fallback, { backgroundColor: Colors.avatarBg }]}>
            <Ionicons
              name={image ? 'image-outline' : fallbackIcon || 'receipt-outline'}
              size={72}
              color={Colors.textTertiary}
            />
          </View>
        )}

        <View style={styles.tags} pointerEvents="none">
          <View style={[styles.valueChip, { backgroundColor: hexToRgba(Colors.inkDeep, 0.55) }]}>
            <Text style={[styles.valueLabel, { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bold }]}>
              {amountLabel}
            </Text>
            <Text
              style={[styles.value, { color: Colors.white, fontFamily: Fonts.bold }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {amountText}
            </Text>
          </View>
          <View style={[styles.typePill, { backgroundColor: typeColor }]}>
            <View style={[styles.dot, { backgroundColor: Colors.white }]} />
            <Text style={[styles.typeText, { color: Colors.white, fontFamily: Fonts.bold }]}>{typeText}</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{title}</Text>
      </View>

      {previewOpen && showImage ? <ImagePreviewModal imageUri={image} onClose={closePreview} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  imageWrap: { width: '100%', aspectRatio: 3 / 4 },
  imageFill: { ...StyleSheet.absoluteFillObject },
  image: { width: '100%', height: '100%' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  tags: { position: 'absolute', left: 16, bottom: 16, alignItems: 'flex-start', gap: 8 },
  valueChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  valueLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: { fontSize: 32, lineHeight: 40, flexShrink: 1 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  dot: { width: 8, height: 8, borderRadius: 9999 },
  typeText: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  info: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 24, lineHeight: 30 },
});
