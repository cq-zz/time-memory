import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getEmojiSvg } from '../../assets/emoji/emojiSvgs';

/**
 * Noto Emoji mood icon — rendered from locally bundled SVG strings.
 * No network required.
 *
 * @param {string} moodKey - mood key (e.g. 'happy', 'sad')
 * @param {number} size     - width/height in px (default 24)
 */
export default function MoodEmoji({ moodKey, size = 24 }) {
  const xml = getEmojiSvg(moodKey);
  if (!xml) return null;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 24,
    height: 24,
  },
});