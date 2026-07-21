import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { getAllRows } from '../../store/db';

/**
 * Pick an asset (from the assets table, active only) to link this item to.
 * Selection stores the asset id; the name is resolved for display.
 */
export default function LinkedAssetPicker({ value, onChange }) {
  const { Colors, Radius, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAllRows('assets')
      .then((rows) => setAssets(rows.filter((r) => (r.status || 'active') === 'active')))
      .catch(() => setAssets([]));
  }, []);

  const selected = assets.find((a) => a.id === value);

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm }]}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
      >
        <View style={styles.left}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(107, 92, 231, 0.15)' }]}>
            <Ionicons name="link-outline" size={18} color={Colors.purple} />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {t('durable.linkedAsset')}
            </Text>
            <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]} numberOfLines={1}>
              {selected ? selected.name : t('durable.linkedAssetPlaceholder')}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: Colors.card, borderRadius: Radius.xl }, Shadows.dark]}
            onPress={() => {}}
          >
            <Text style={[styles.sheetTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('durable.linkedAsset')}
            </Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {/* Clear option */}
              <TouchableOpacity
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                  {t('durable.linkedAssetPlaceholder')}
                </Text>
              </TouchableOpacity>
              {assets.length === 0 ? (
                <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                  {t('durable.noAssetsAvailable')}
                </Text>
              ) : (
                assets.map((a) => {
                  const active = a.id === value;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.option, active && { backgroundColor: Colors.purpleTint }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        onChange(a.id);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[styles.optionText, { color: active ? Colors.purple : Colors.textPrimary, fontFamily: Fonts.semiBold }]}
                        numberOfLines={1}
                      >
                        {a.name}
                      </Text>
                      {active && <Ionicons name="checkmark" size={18} color={Colors.purple} />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
