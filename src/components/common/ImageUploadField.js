import { useMemo, useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, hexToRgba } from '../../utils/theme';
import { validateImage } from '../../utils/image';
import useAlert from '../../hooks/useAlert';

/**
 * Image upload field — camera / photo library / URL sources.
 * Props:
 * - value: string — current image URI
 * - onChange: (uri: string) => void — called with '' to clear
 * - placeholder?: string — placeholder text
 * - hint?: string — hint text under the placeholder
 * - aspectRatio?: number — e.g. 4/3; falls back to fixed height
 * - height?: number — fixed height when aspectRatio is absent (default 160)
 * - disabled?: boolean
 */
export default function ImageUploadField({
  value,
  onChange,
  placeholder,
  hint,
  aspectRatio,
  height = 160,
  disabled = false,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { alert } = useAlert();
  const [picking, setPicking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const hasImage = Boolean(value);
  const finalHint = hint ?? 'Supports JPG, PNG, WebP';

  // ── Permissions ──
  const showPermissionDenied = (title, message) => {
    alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Go to Settings', onPress: () => Linking.openSettings() },
    ]);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showPermissionDenied('Camera Permission', 'Allow camera access to take photos.');
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showPermissionDenied('Photo Library Permission', 'Allow photo library access to choose images.');
      return false;
    }
    return true;
  };

  // ── Validate & emit result ──
  const processResult = (result) => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    const asset = result.assets[0];
    const error = validateImage({
      type: asset.mimeType || asset.type || '',
      fileSize: asset.fileSize ?? 0,
    });
    if (error) {
      alert('Upload Failed', error);
      return;
    }
    onChange(asset.uri);
  };

  // ── Camera ──
  const handleCamera = async () => {
    setSheetOpen(false);
    if (disabled || picking) return;
    setPicking(true);
    try {
      if (!(await requestCameraPermission())) return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        exif: false,
      });
      processResult(result);
    } catch (e) {
      alert('Error', e?.message || 'Failed to open camera');
    } finally {
      setPicking(false);
    }
  };

  // ── Photo library ──
  const handleLibrary = async () => {
    setSheetOpen(false);
    if (disabled || picking) return;
    setPicking(true);
    try {
      if (!(await requestLibraryPermission())) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        exif: false,
      });
      processResult(result);
    } catch (e) {
      alert('Error', e?.message || 'Failed to open photo library');
    } finally {
      setPicking(false);
    }
  };

  // ── Network URL ──
  const handleNetwork = () => {
    setSheetOpen(false);
    setUrlInput('');
    setUrlError('');
    setPreviewError(false);
    setUrlModalOpen(true);
  };

  const handleUrlConfirm = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
      setUrlError('Invalid image URL');
      return;
    }
    if (previewError) {
      setUrlError('Invalid image URL');
      return;
    }
    onChange(trimmed);
    setUrlModalOpen(false);
  };

  const handleRemove = (e) => {
    e?.stopPropagation?.();
    onChange('');
  };

  const handlePress = () => {
    if (disabled || picking) return;
    setSheetOpen(true);
  };

  const containerStyle = [
    styles.container,
    { borderColor: hasImage ? Colors.purple : Colors.grayDot, borderRadius: Radius.lg },
    aspectRatio ? { aspectRatio } : { height },
    hasImage && styles.containerHasImage,
    disabled && styles.containerDisabled,
  ];

  return (
    <>
      <Pressable style={containerStyle} onPress={handlePress} disabled={disabled || picking}>
        {hasImage ? (
          <>
            <Image source={{ uri: value }} style={styles.image} contentFit="contain" />
            {!disabled && (
              <Pressable
                style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
                onPress={handleRemove}
                hitSlop={8}
              >
                <Ionicons name="close" size={14} color={Colors.white} />
              </Pressable>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.purpleTint }]}>
              <Ionicons name="image-outline" size={24} color={Colors.purple} />
            </View>
            <Text style={[styles.placeholderText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
              {placeholder || 'Tap to add a photo'}
            </Text>
            <Text style={[styles.hintText, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              {finalHint}
            </Text>
          </View>
        )}
      </Pressable>

      {/* URL input dialog */}
      <Modal visible={urlModalOpen} transparent animationType="fade" onRequestClose={() => setUrlModalOpen(false)}>
        <View style={[styles.urlOverlay, { backgroundColor: Colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setUrlModalOpen(false)} />
          <View style={[styles.urlDialog, { backgroundColor: Colors.card, borderRadius: Radius.md }]}>
            <Text style={[styles.urlTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              Image URL
            </Text>
            <Text style={[styles.urlHint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              Paste a direct link to an image
            </Text>
            <TextInput
              style={[
                styles.urlInput,
                {
                  borderColor: Colors.cardBorder,
                  backgroundColor: Colors.iconBg,
                  color: Colors.textPrimary,
                  borderRadius: Radius.sm,
                  fontFamily: Fonts.regular,
                },
              ]}
              value={urlInput}
              onChangeText={(text) => {
                setUrlInput(text);
                setUrlError('');
                setPreviewError(false);
              }}
              placeholder="https://..."
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {urlError ? (
              <Text style={[styles.urlErrorText, { color: Colors.rose, fontFamily: Fonts.semiBold }]}>
                {urlError}
              </Text>
            ) : null}
            {urlInput.trim() && /^https?:\/\//i.test(urlInput.trim()) && (
              <View style={[styles.previewWrap, { backgroundColor: Colors.iconBg, borderRadius: Radius.sm }]}>
                {previewError ? (
                  <View style={styles.previewErrorWrap}>
                    <Text style={[styles.previewErrorText, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                      Image failed to load
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: urlInput.trim() }}
                    style={styles.previewImage}
                    contentFit="contain"
                    onError={() => setPreviewError(true)}
                    onLoad={() => setPreviewError(false)}
                  />
                )}
              </View>
            )}
            <View style={styles.urlActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.urlBtn,
                  { backgroundColor: Colors.iconBg, borderWidth: 1, borderColor: Colors.cardBorder },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setUrlModalOpen(false)}
              >
                <Text style={[styles.urlBtnCancelText, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.urlBtn,
                  { backgroundColor: Colors.purple },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleUrlConfirm}
              >
                <Text style={[styles.urlBtnConfirmText, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Source action sheet */}
      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <View style={[styles.sheetOverlay, { backgroundColor: Colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: Colors.card }]}>
            <Text style={[styles.sheetTitle, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
              SELECT IMAGE SOURCE
            </Text>
            <View style={styles.sheetActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetBtn,
                  { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleCamera}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: Colors.purpleTint }]}>
                  <Ionicons name="camera-outline" size={22} color={Colors.purple} />
                </View>
                <Text style={[styles.sheetBtnText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                  Take Photo
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetBtn,
                  { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleLibrary}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: hexToRgba(Colors.green, 0.15) }]}>
                  <Ionicons name="folder-open-outline" size={22} color={Colors.green} />
                </View>
                <Text style={[styles.sheetBtnText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                  From Library
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetBtn,
                  { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleNetwork}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: hexToRgba(Colors.orange, 0.15) }]}>
                  <Ionicons name="link-outline" size={22} color={Colors.orange} />
                </View>
                <Text style={[styles.sheetBtnText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                  From URL
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.sheetCancelBtn,
                { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder, borderRadius: Radius.md },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setSheetOpen(false)}
            >
              <Text style={[styles.sheetCancelText, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerHasImage: {
    borderStyle: 'solid',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  placeholder: {
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  hintText: {
    fontSize: 11,
    lineHeight: 16,
  },
  // ── Action sheet ──
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  sheetTitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sheetBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    borderWidth: 1,
  },
  sheetIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBtnText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  sheetCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  sheetCancelText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // ── URL dialog ──
  urlOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlDialog: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
  },
  urlTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  urlHint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  urlErrorText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  urlActions: {
    flexDirection: 'row',
    gap: 12,
  },
  urlBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 48,
  },
  urlBtnCancelText: {
    fontSize: 15,
    lineHeight: 22,
  },
  urlBtnConfirmText: {
    fontSize: 15,
    lineHeight: 22,
  },
  previewWrap: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewErrorWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewErrorText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
