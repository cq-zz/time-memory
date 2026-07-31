import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import ImagePreviewModal from '../common/ImagePreviewModal';

const HERO_HEIGHT = Dimensions.get('window').width * 4 / 3;

export default function DiaryHero({ image, title, privateText, isPrivate }) {
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
              contentFit="contain"
              onError={() => setImageError(true)}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.imageFill, styles.fallback, { backgroundColor: Colors.avatarBg }]}>
            <Ionicons name={image ? 'image-outline' : 'book-outline'} size={72} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.tags} pointerEvents="none">
          <View
            style={[
              styles.privatePill,
              { backgroundColor: isPrivate ? Colors.purple : Colors.green },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: Colors.white }]} />
            <Text style={[styles.privateText, { color: Colors.white, fontFamily: Fonts.bold }]}>{privateText}</Text>
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
  imageWrap: { width: '100%', height: HERO_HEIGHT },
  imageFill: { ...StyleSheet.absoluteFillObject },
  image: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tags: { position: 'absolute', left: 16, bottom: 16, alignItems: 'flex-start', gap: 8 },
  privatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingLeft: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: { width: 8, height: 8, borderRadius: 9999 },
  privateText: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  info: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 24, lineHeight: 30 },
});
