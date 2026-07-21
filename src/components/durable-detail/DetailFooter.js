import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function DetailFooter({ itemId }) {
  const { Colors, Radius, Fonts } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(255,255,255,0.92)', borderTopColor: Colors.grayDot }]}>
      {/* Archive button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.archiveBtn, { backgroundColor: Colors.card, borderColor: Colors.rose, borderRadius: Radius.xl }]}
      >
        <Ionicons name="archive-outline" size={20} color={Colors.rose} />
      </TouchableOpacity>

      {/* Edit button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.editBtn, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }]}
        onPress={() => router.push(`/durable/form?id=${itemId}`)}
      >
        <Ionicons name="pencil-outline" size={18} color={Colors.white} />
        <Text style={[styles.editText, { color: Colors.white, fontFamily: Fonts.regular }]}>Edit Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  archiveBtn: {
    width: 56,
    height: 56,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editText: {
    fontSize: 16,
    lineHeight: 28,
  },
});
