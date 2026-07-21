import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ConfirmModal from './ConfirmModal';

/**
 * Shared detail-page bottom bar: delete (with confirm) + edit.
 * `editPath` is the full route to the module's form (e.g. `/durable/form?id=xxx`).
 */
export default function DetailFooter({ editPath, deleteConfirmText, onDelete }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(255,255,255,0.92)', borderTopColor: Colors.grayDot }]}>
      {/* Delete button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.deleteBtn, { backgroundColor: Colors.card, borderColor: Colors.rose, borderRadius: Radius.xl }]}
        onPress={() => setShowDelete(true)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.rose} />
      </TouchableOpacity>

      {/* Edit button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.editBtn, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }]}
        onPress={() => router.push(editPath)}
      >
        <Ionicons name="pencil-outline" size={18} color={Colors.white} />
        <Text style={[styles.editText, { color: Colors.white, fontFamily: Fonts.regular }]}>{t('common.edit')}</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={async () => {
          await onDelete();
        }}
        title={t('common.tip')}
        description={deleteConfirmText}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
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
  deleteBtn: {
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
