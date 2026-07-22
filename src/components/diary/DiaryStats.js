import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ModuleStatsCard from '../common/ModuleStatsCard';

export default function DiaryStats({ stats }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();
  const safeStats = stats && typeof stats === 'object' ? stats : {};
  const safeNumber = (value) => (Number.isFinite(Number(value)) && value !== '' && value != null ? Number(value) : '--');
  const totalCount = safeNumber(safeStats.totalCount);
  const currentYearCount = safeNumber(safeStats.currentYearCount);
  const privateCount = safeNumber(safeStats.privateCount);

  return (
    <ModuleStatsCard
      label={t('diary.totalEntries')}
      value={totalCount}
      pills={[
        {
          key: 'year',
          label: t('diary.thisYearPill', { count: currentYearCount }),
          backgroundColor: 'rgba(242,139,80,0.24)',
          color: Colors.white,
        },
        { key: 'private', label: t('diary.privatePill', { count: privateCount }) },
      ]}
    />
  );
}
