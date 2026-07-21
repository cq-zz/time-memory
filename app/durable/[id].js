import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/utils/theme';
import { getDurableById } from '../../src/data/durables';
import DurableHero from '../../src/components/durable-detail/DurableHero';
import StatsGrid from '../../src/components/durable-detail/StatsGrid';
import LinkedAsset from '../../src/components/durable-detail/LinkedAsset';
import ExpenseHistory from '../../src/components/durable-detail/ExpenseHistory';
import DetailFooter from '../../src/components/durable-detail/DetailFooter';

export default function DurableDetailScreen() {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const item = getDurableById(id);
  const detail = item.detail;

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DurableHero detail={detail} />
        <View style={styles.sections}>
          <StatsGrid detail={detail} />
          <LinkedAsset linkedAsset={detail.linkedAsset} />
          <ExpenseHistory expenses={detail.expenses} />
        </View>
      </ScrollView>

      {/* Floating back button over hero */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: 'rgba(255,255,255,0.25)' }]}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Fixed bottom actions */}
      <View style={{ paddingBottom: insets.bottom }}>
        <DetailFooter itemId={item.id} />
      </View>

      <StatusBar style="light" />
    </View>
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
    paddingBottom: 24,
  },
  sections: {
    paddingTop: 20,
    gap: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
