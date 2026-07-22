import { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Platform, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { getAllRows } from '../../store/db';
import { inCurrentCurrency } from '../../store/settings';
import { effectiveStatus } from '../../services/asset';
import WheelColumn from '../common/WheelColumn';

/**
 * Pick an asset to link this item to (wheel picker, bottom sheet).
 * Only assets currently HELD (effectiveStatus === 'active') are offered.
 * Selection stores the asset id; the name is resolved for display.
 */
export default function LinkedAssetPicker({ value, onChange }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAllRows('assets')
      .then((rows) =>
        setAssets(rows.filter((r) => effectiveStatus(r) === 'active' && inCurrentCurrency(r)))
      )
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
          <View style={[styles.iconCircle, { backgroundColor: hexToRgba(Colors.purple, 0.15) }]}>
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

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <AssetSheet
            assets={assets}
            current={value}
            onClose={() => setOpen(false)}
            onConfirm={(id) => {
              onChange(id);
              setOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

function AssetSheet({ assets, current, onClose, onConfirm }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(current || '');

  const items = useMemo(
    () => [
      { value: '', label: t('durable.linkedAssetNone') },
      ...assets.map((a) => ({ value: a.id, label: a.name })),
    ],
    [assets, t],
  );

  return (
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
            {t('durable.linkedAsset')}
          </Text>
          <Pressable onPress={() => onConfirm(selected)}>
            <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
              {t('common.confirm')}
            </Text>
          </Pressable>
        </View>

        {assets.length === 0 && (
          <Text style={[styles.emptyHint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            {t('durable.noAssetsAvailable')}
          </Text>
        )}

        <View style={styles.pickerBody}>
          <WheelColumn items={items} selected={selected} onChange={setSelected} width={240} />
        </View>
      </View>
    </View>
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
  emptyHint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
  },
  pickerBody: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
