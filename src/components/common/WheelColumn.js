import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../utils/theme';

export const WHEEL_ITEM_HEIGHT = 40;
export const WHEEL_VISIBLE_ITEMS = 5;
export const WHEEL_COL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;
const WHEEL_VERTICAL_PADDING = (WHEEL_COL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

/**
 * Scroll-snap wheel column shared by WheelPicker (date/time) and the
 * option wheels (currency, etc.).
 * items: primitives or { value, label } objects; `selected` is a value.
 */
export default function WheelColumn({ items, selected, onChange, width = 72 }) {
  const { Colors, Radius, Fonts } = useTheme();
  const ref = useRef(null);
  const settleTimerRef = useRef(null);

  const normalized = useMemo(
    () =>
      items.map((it) =>
        it !== null && typeof it === 'object' ? it : { value: it, label: String(it) },
      ),
    [items],
  );

  // Refs to avoid stale closures in the settle timer and onContentSizeChange
  const normalizedRef = useRef(normalized);
  normalizedRef.current = normalized;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // When items change, mark that we need to scroll to selected after layout
  const needsScrollRef = useRef(true);
  useEffect(() => {
    needsScrollRef.current = true;
  }, [items]);

  // Scroll to the selected item after the ScrollView finishes laying out new content.
  // onContentSizeChange fires when the content size changes (e.g. items added/removed),
  // which is the earliest reliable point after layout.
  const handleContentSizeChange = useCallback(() => {
    if (!needsScrollRef.current) return;
    needsScrollRef.current = false;

    // Clear any pending settle timer so it doesn't fire with a stale offset
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

    const norm = normalizedRef.current;
    const sel = selectedRef.current;
    const targetIdx = norm.findIndex((it) => it.value === sel);
    if (targetIdx >= 0) {
      ref.current?.scrollTo({ y: targetIdx * WHEEL_ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleScroll = useCallback(
    (e) => {
      const currentOffset = e.nativeEvent.contentOffset.y;
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        // Use refs to always read the latest normalized/selected,
        // avoiding stale closures when items change during the 120ms settle window.
        const norm = normalizedRef.current;
        const sel = selectedRef.current;
        const index = Math.max(0, Math.min(norm.length - 1, Math.round(currentOffset / WHEEL_ITEM_HEIGHT)));
        const item = norm[index];
        const targetOffset = index * WHEEL_ITEM_HEIGHT;
        if (Math.abs(currentOffset - targetOffset) > 1) {
          ref.current?.scrollTo({ y: targetOffset, animated: false });
        }
        if (item && item.value !== sel) {
          onChange(item.value);
        }
      }, 120);
    },
    [onChange],
  );

  return (
    <View style={[styles.col, { height: WHEEL_COL_HEIGHT, width }]}>
      <View
        style={[styles.colHighlight, { backgroundColor: Colors.purpleTint, borderRadius: Radius.sm }]}
        pointerEvents="none"
      />
      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingVertical: WHEEL_VERTICAL_PADDING }}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
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
    height: WHEEL_ITEM_HEIGHT,
    lineHeight: WHEEL_ITEM_HEIGHT,
    textAlign: 'center',
  },
});