import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../utils/theme';

export const WHEEL_ITEM_HEIGHT = 40;
export const WHEEL_VISIBLE_ITEMS = 5;
export const WHEEL_COL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;

/**
 * Scroll-snap wheel column shared by WheelPicker (date/time) and the
 * option wheels (currency, etc.).
 * items: primitives or { value, label } objects; `selected` is a value.
 * Mount fresh (e.g. inside `{open && <Modal>}`) so the initial scroll
 * lands on the current selection each time the sheet opens.
 */
export default function WheelColumn({ items, selected, onChange, width = 72 }) {
  const { Colors, Radius, Fonts } = useTheme();
  const ref = useRef(null);
  const timerRef = useRef(null);

  const normalized = useMemo(
    () =>
      items.map((it) =>
        it !== null && typeof it === 'object' ? it : { value: it, label: String(it) },
      ),
    [items],
  );

  const idx = normalized.findIndex((it) => it.value === selected);
  const initialY = idx >= 0 ? idx * WHEEL_ITEM_HEIGHT : 0;

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: initialY, animated: false });
    }, 60);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = useCallback(
    (e) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const currentOffset = e.nativeEvent.contentOffset.y;
      const index = Math.round(currentOffset / WHEEL_ITEM_HEIGHT);
      timerRef.current = setTimeout(() => {
        const it = normalized[index];
        if (it && it.value !== selected) onChange(it.value);
        const targetY = index * WHEEL_ITEM_HEIGHT;
        if (Math.abs(currentOffset - targetY) > 2) {
          ref.current?.scrollTo({ y: targetY, animated: true });
        }
      }, 120);
    },
    [normalized, selected, onChange],
  );

  return (
    <View style={[styles.col, { height: WHEEL_COL_HEIGHT, width }]}>
      <View
        style={[styles.colHighlight, { backgroundColor: Colors.purpleTint, borderRadius: Radius.sm }]}
        pointerEvents="none"
      />
      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingVertical: (WHEEL_COL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2 }}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={80}
      >
        {normalized.map((it) => (
          <View key={String(it.value)} style={styles.colItem}>
            <Text
              style={[
                styles.colItemText,
                { color: Colors.textTertiary, fontFamily: Fonts.regular },
                it.value === selected && {
                  color: Colors.textPrimary,
                  fontFamily: Fonts.bold,
                  fontSize: 18,
                },
              ]}
              numberOfLines={1}
            >
              {it.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    overflow: 'hidden',
    position: 'relative',
  },
  colHighlight: {
    position: 'absolute',
    top: (WHEEL_VISIBLE_ITEMS * WHEEL_ITEM_HEIGHT - WHEEL_ITEM_HEIGHT) / 2,
    left: 4,
    right: 4,
    height: WHEEL_ITEM_HEIGHT,
  },
  colItem: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  colItemText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
