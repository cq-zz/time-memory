import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { listDurables, effectiveStatus as durableStatus } from '../../services/durable';
import { listAssets, effectiveStatus as assetStatus } from '../../services/asset';

/**
 * Optional "billing object" picker — links a bill to a durable or an asset
 * (sets source / source_id). Durables show in-use rows, assets show active
 * rows. Props:
 * - source: 'durable' | 'asset' | ''
 * - sourceId: string | ''
 * - sourceName: string — display name of the current selection
 * - onChange: ({ source, sourceId, sourceName }) => void  (null to clear)
 */
export default function BillingObjectPicker({ source, sourceId, sourceName, onChange, label }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [durables, setDurables] = useState([]);
  const [assets, setAssets] = useState([]);

  const loadOptions = useCallback(async () => {
    const [d, a] = await Promise.all([listDurables(), listAssets()]);
    setDurables((d || []).filter((r) => durableStatus(r) === 'in_use'));
    setAssets((a || []).filter((r) => assetStatus(r) === 'active'));
  }, []);

  useEffect(() => {
    if (open) loadOptions();
  }, [open, loadOptions]);

  const hasSelection = Boolean(source && sourceId);
  const empty = durables.length === 0 && assets.length === 0;

  const pick = (src, row) => {
    onChange({ source: src, sourceId: row.id, sourceName: row.name });
    setOpen(false);
  };

  const OptionRow = ({ icon, name, meta, selected, onPress }) => (
    <Pressable
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? hexToRgba(Colors.purple, 0.1) : Colors.card,
          borderColor: selected ? Colors.purple : Colors.cardBorder,
          borderRadius: Radius.lg,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.optionIcon, { backgroundColor: Colors.avatarBg, borderRadius: Radius.circle }]}>
        <Ionicons name={icon} size={18} color={Colors.textPrimary} />
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionName, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={[styles.optionMeta, { color: Colors.textSecondary, fontFamily: Fonts.regular }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={20} color={Colors.purple} /> : null}
    </Pressable>
  );

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{label}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => setOpen(true)}
      >
        <View style={styles.triggerLeft}>
          <Ionicons
            name={hasSelection ? 'link' : 'add-circle-outline'}
            size={18}
            color={hasSelection ? Colors.purple : Colors.textTertiary}
          />
          <Text
            style={[
              styles.triggerText,
              {
                color: hasSelection ? Colors.textPrimary : Colors.textTertiary,
                fontFamily: hasSelection ? Fonts.semiBold : Fonts.regular,
              },
            ]}
            numberOfLines={1}
          >
            {hasSelection ? sourceName || t('bills.selectItem') : t('bills.noItem')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: Colors.card, borderRadius: Radius.xl }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                {t('bills.billingObject')}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
              {empty ? (
                <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                  {t('bills.noItemsAvailable')}
                </Text>
              ) : (
                <>
                  {/* Clear selection */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.clearRow,
                      { borderColor: Colors.cardBorder, borderRadius: Radius.lg },
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={Colors.textSecondary} />
                    <Text style={[styles.clearText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                      {t('bills.noItem')}
                    </Text>
                  </Pressable>

                  {durables.length > 0 ? (
                    <View style={styles.group}>
                      <Text style={[styles.groupLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                        {t('nav.durable')}
                      </Text>
                      {durables.map((row) => (
                        <OptionRow
                          key={`durable-${row.id}`}
                          icon="cube-outline"
                          name={row.name}
                          meta={row.category ? t(`categories.${row.category}`, { defaultValue: row.category }) : ''}
                          selected={source === 'durable' && sourceId === row.id}
                          onPress={() => pick('durable', row)}
                        />
                      ))}
                    </View>
                  ) : null}

                  {assets.length > 0 ? (
                    <View style={styles.group}>
                      <Text style={[styles.groupLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                        {t('nav.asset')}
                      </Text>
                      {assets.map((row) => (
                        <OptionRow
                          key={`asset-${row.id}`}
                          icon="diamond-outline"
                          name={row.name}
                          meta={row.category ? t(`assetCategories.${row.category}`, { defaultValue: row.category }) : ''}
                          selected={source === 'asset' && sourceId === row.id}
                          onPress={() => pick('asset', row)}
                        />
                      ))}
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  triggerText: {
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    paddingTop: 20,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 24,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  clearText: {
    fontSize: 14,
    lineHeight: 20,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  optionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionName: {
    fontSize: 15,
    lineHeight: 21,
  },
  optionMeta: {
    fontSize: 12,
    lineHeight: 17,
  },
});
