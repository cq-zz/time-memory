import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function PhotoUpload() {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={[styles.circle, { borderColor: Colors.grayDot, backgroundColor: Colors.card }]}>
        <View style={styles.iconWrap}>
          <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
          <View style={[styles.plusBadge, { backgroundColor: Colors.textPrimary }]}>
            <Ionicons name="add" size={12} color={Colors.white} />
          </View>
        </View>
      </View>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        TAP TO UPLOAD ITEM PHOTO
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
});
