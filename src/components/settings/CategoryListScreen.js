import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { useCategoryStore, getMergedCategories } from '../../store/categories';
import ModuleHeader from '../common/ModuleHeader';

/** i18n namespace holding the built-in display names for each type. */
const BUILTIN_NS = { item: 'categories', bill: 'billCategories', asset: 'assetCategories' };
const TITLE_KEY = {
  item: 'settings.customCategories',
  bill: 'settings.billCategories',
  asset: 'settings.customAssetCategories',
};

function CategoryRow({ item, type, showBorder }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toggleBuiltin = useCategoryStore((s) => s.toggleBuiltin);
  const updateCustom = useCategoryStore((s) => s.updateCustom);

  const label = item.isBuiltin ? t(`${BUILTIN_NS[type]}.${item.key}`) : item.name;

  const handleToggle = () => {
    if (item.isBuiltin) {
      toggleBuiltin(type, item.key);
    } else {
      updateCustom(type, item.key, { enabled: !item.enabled });
    }
  };

  return (
    <View style={[styles.row, showBorder && { borderTopColor: Colors.cardBorder, borderTopWidth: 1 }]}>
      <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.1) }]}>
        <Ionicons name={item.icon || 'pricetag-outline'} size={18} color={Colors.purple} />
      </View>

      <Text
        style={[
          styles.name,
          { color: item.enabled ? Colors.textDark : Colors.textSecondary, fontFamily: Fonts.semiBold },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {item.isBuiltin && (
        <View style={[styles.badge, { backgroundColor: hexToRgba(Colors.orange, 0.12) }]}>
          <Text style={[styles.badgeText, { color: Colors.orange, fontFamily: Fonts.semiBold }]}>
            {t('common.default')}
          </Text>
        </View>
      )}

      <Switch
        value={item.enabled}
        onValueChange={handleToggle}
        trackColor={{ false: Colors.grayDot, true: Colors.purple }}
        thumbColor={Colors.white}
        style={styles.switch}
      />

      {!item.isBuiltin && (
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.7}
          onPress={() => router.push(`/settings/categories/form?type=${type}&key=${item.key}`)}
        >
          <Ionicons name="pencil-outline" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CategoryListScreen({ type }) {
  const { Colors, Shadows, Radius } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const categoryState = useCategoryStore();

  const rows = getMergedCategories(categoryState, type);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t(TITLE_KEY[type])} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.xl }]}>
          {rows.map((item, i) => (
            <CategoryRow key={item.key} item={item} type={type} showBorder={i > 0} />
          ))}
        </View>
      </ScrollView>

      {/* Add FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push(`/settings/categories/form?type=${type}`)}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 112,
  },
  card: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  switch: {
    transform: [{ scale: 0.85 }],
    marginHorizontal: -4,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
