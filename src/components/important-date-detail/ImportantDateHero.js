import { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import ImagePreviewModal from '../common/ImagePreviewModal';

export default function ImportantDateHero({ image, fallbackIcon, title, typeText, typeColor, countdownText }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
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
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.imageFill, styles.imageFallback, { backgroundColor: Colors.avatarBg }]}>
            <Ionicons name={fallbackIcon || 'heart-outline'} size={72} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.imageTag} pointerEvents="none">
          <View style={[styles.countdownChip, { backgroundColor: hexToRgba(Colors.inkDeep, 0.55) }]}>
            <Text style={[styles.countdownLabel, { color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bold }]}>
              {t('detail.countdown')}
            </Text>
            <Text style={[styles.countdownValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
              {countdownText}
            </Text>
          </View>
          <View style={[styles.typePill, { backgroundColor: typeColor }]}>
            <View style={[styles.typeDot, { backgroundColor: Colors.white }]} />
            <Text style={[styles.typeText, { color: Colors.white, fontFamily: Fonts.bold }]}>{typeText}</Text>
          </View>
        </View>
      </View>
      <View style={styles.infoBlock}>
        <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{title}</Text>
      </View>
      {previewOpen && showImage ? <ImagePreviewModal imageUri={image} onClose={closePreview} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrap: {
    aspectRatio: 3 / 4,
    width: '100%',
  },
  imageFill: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTag: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  countdownChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 12,
    paddingLeft: 0,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingLeft: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  typeText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  countdownLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  countdownValue: {
    fontSize: 32,
    lineHeight: 40,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
});
