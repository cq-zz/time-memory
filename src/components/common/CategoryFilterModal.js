import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useCategoryStore, getMergedCategories } from '../../store/categories';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

/**
 * Bottom-sheet multi-select category picker.
 *
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - type: 'item' | 'asset' | 'bill' | 'all' — category types to show
 * - selected: string[] — currently selected category keys
 * - onConfirm: (selected: string[]) => void
 */
export default function CategoryFilterModal({ visible, onClose, type, selected = [], onConfirm }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const custom = useCategoryStore((s) => s.custom);
  const disabled = useCategoryStore((s) => s.disabled);

  // Build a lightweight state-like object for getMergedCategories
  const categoryState = useMemo(() => ({ custom, disabled }), [custom, disabled]);

  const [draft, setDraft] = useState([]);

  // Build the merged category list
  const items = useMemo(() => {
    if (type === 'all') {
      const itemCats = getMergedCategories(categoryState, 'item').filter((c) => c.enabled);
      const billCats = getMergedCategories(categoryState, 'bill').filter((c) => c.enabled);
      const assetCats = getMergedCategories(categoryState, 'asset').filter((c) => c.enabled);
      // Deduplicate by key, keep first occurrence
      const seen = new Set();
      const merged = [];
      for (const c of [...itemCats, ...billCats, ...assetCats]) {
        if (!seen.has(c.key)) {
          seen.add(c.key);
          merged.push(c);
        }
      }
      return merged;
    }
    return getMergedCategories(categoryState, type).filter((c) => c.enabled);
  }, [categoryState, type]);

  // Resolve display labels
  const itemLabels = useMemo(() => {
    const map = {};
    items.forEach((c) => {
      if (c.isBuiltin) {
        const ns = type === 'all' ? 'categories' : type === 'item' ? 'categories' : type === 'asset' ? 'assetCategories' : 'billCategories';
        // For 'all' type, try each namespace
        if (type === 'all') {
          map[c.key] = t(`categories.${c.key}`, c.label) || t(`billCategories.${c.key}`, c.label) || t(`assetCategories.${c.key}`, c.label) || c.label;
        } else {
          map[c.key] = t(`${ns}.${c.key}`, c.label);
        }
      } else {
        map[c.key] = c.name || c.label;
      }
    });
    return map;
  }, [items, type, t]);

  // Sync draft when opening
  useEffect(() => {
    if (visible) setDraft([...selected]);
  }, [visible, selected]);

  const toggle = useCallback((key) => {
    setDraft((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  }, []);

  const selectAll = useCallback(() => {
    setDraft([]);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(draft);
    onClose();
  }, [draft, onConfirm, onClose]);

  const isAllSelected = draft.length === 0;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: Colors.card }]}>
          {/* Header */}
          <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Pressable onPress={onClose}>
              <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('common.selectCategory')}
            </Text>
            <Pressable onPress={handleConfirm}>
              <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                {t('common.confirm')}
              </Text>
            </Pressable>
          </View>

          {/* "全部" quick-select row */}
          <Pressable
            style={[styles.allRow, { borderBottomColor: Colors.cardBorder }]}
            onPress={selectAll}
          >
            <Ionicons
              name={isAllSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={isAllSelected ? Colors.purple : Colors.textSecondary}
            />
            <Text style={[styles.allText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {t('common.all')}
            </Text>
          </Pressable>

          {/* Category list */}
          <ScrollView style={[styles.list, { maxHeight: WINDOW_HEIGHT * 0.55 }]} showsVerticalScrollIndicator={false}>
            {items.map((c) => {
              const checked = draft.includes(c.key);
              const icon = c.icon || 'pricetag-outline';
              return (
                <Pressable
                  key={c.key}
                  style={[styles.itemRow, { borderBottomColor: Colors.cardBorder }]}
                  onPress={() => toggle(c.key)}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checked ? Colors.purple : Colors.textSecondary}
                  />
                  <Ionicons name={icon} size={20} color={checked ? Colors.purple : Colors.textSecondary} />
                  <Text
                    style={[
                      styles.itemLabel,
                      {
                        color: checked ? Colors.purple : Colors.textPrimary,
                        fontFamily: checked ? Fonts.semiBold : Fonts.regular,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {itemLabels[c.key] || c.label}
                  </Text>
                  {checked && (
                    <Ionicons name="checkmark" size={18} color={Colors.purple} style={styles.checkIcon} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '70%',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerBtnConfirm: {
    fontSize: 15,
    lineHeight: 22,
  },
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  allText: {
    fontSize: 15,
    lineHeight: 22,
  },
  list: {},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});