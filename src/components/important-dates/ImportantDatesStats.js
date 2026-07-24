import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ModuleStatsCard from '../common/ModuleStatsCard';

export default function ImportantDatesStats({ stats }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();
  const safeStats = stats && typeof stats === 'object' ? stats : {};
  const safeNumber = (value) => (Number.isFinite(Number(value)) && value !== '' && value != null ? Number(value) : '--');
  const nextDays = safeNumber(safeStats.nextDays);
  const upcomingCount = safeNumber(safeStats.upcomingCount);
  const totalCount = safeNumber(safeStats.totalCount);

  return (
    <ModuleStatsCard
      dense
      label={t('importantDate.nextCountdown')}
      value={nextDays === '--' ? nextDays : t('importantDate.daysLeft', { count: nextDays })}
      pills={[
        {
          key: 'upcoming',
          label: t('importantDate.upcomingPill', { count: upcomingCount }),
          backgroundColor: 'rgba(160,92,130,0.28)',
          color: Colors.white,
        },
        { key: 'total', label: t('importantDate.totalPill', { count: totalCount }) },
      ]}
    />
  );
}
