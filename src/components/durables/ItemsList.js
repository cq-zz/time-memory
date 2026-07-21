import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';
import { DURABLES } from '../../data/durables';

function ItemCard({ item, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const router = useRouter();
  const progress = item.used / item.total;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/durable/${item.id}`)}
      style={[
        styles.card,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.cardBorder,
          borderRadius: Radius.xl,
        },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      <View style={styles.cardTop}>
        {/* Image placeholder */}
        <View style={[styles.image, { backgroundColor: Colors.avatarBg, borderRadius: Radius.xl }]}>
          <Ionicons name={item.icon} size={36} color={Colors.textSecondary} />
        </View>

        <View style={styles.info}>
          {/* Category */}
          <View style={styles.categoryRow}>
            <Ionicons name={item.icon} size={12} color={Colors.textSecondary} />
            <Text style={[styles.categoryText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {item.category}
            </Text>
          </View>

          <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
            {item.name}
          </Text>

          {/* Status pill */}
          <View style={[styles.statusPill, { backgroundColor: 'rgba(74, 168, 104, 0.15)' }]}>
            <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
            <Text style={[styles.statusText, { color: Colors.green, fontFamily: Fonts.semiBold }]}>
              IN-USE
            </Text>
          </View>
        </View>

        <Text style={[styles.price, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {item.price}
        </Text>
      </View>

      {/* Lifespan */}
      <View style={styles.lifespanBlock}>
        <View style={styles.lifespanRow}>
          <Text style={[styles.lifespanLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            LIFESPAN
          </Text>
          <Text style={[styles.lifespanValue, { color: item.color, fontFamily: Fonts.semiBold }]}>
            {item.used} / {item.total} YRS
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: Colors.avatarBg, borderRadius: Radius.pill }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: item.color,
                borderRadius: Radius.pill,
                width: `${Math.min(progress * 100, 100)}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ItemsList() {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          Inventory List
        </Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.sortBtn}>
          <Text style={[styles.sortText, { color: Colors.purple, fontFamily: Fonts.semiBold }]}>
            Sort: Newest
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.purple} />
        </TouchableOpacity>
      </View>

      {DURABLES.map((item, i) => (
        <ItemCard key={item.id} item={item} isLast={i === DURABLES.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sortText: {
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  cardGap: {
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  price: {
    fontSize: 20,
    lineHeight: 26,
  },
  lifespanBlock: {
    marginTop: 16,
    gap: 8,
  },
  lifespanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lifespanLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  lifespanValue: {
    fontSize: 12,
    lineHeight: 16,
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
  },
});
