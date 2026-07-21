import { useLocalSearchParams } from 'expo-router';
import CategoryFormScreen from '../../../src/components/settings/CategoryFormScreen';

const VALID_TYPES = ['item', 'bill', 'asset'];

export default function CategoryFormRoute() {
  const { type, key } = useLocalSearchParams();
  const safeType = VALID_TYPES.includes(type) ? type : 'item';

  return <CategoryFormScreen type={safeType} editKey={key} />;
}
