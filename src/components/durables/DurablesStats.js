import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import ModuleStatsCard from '../common/ModuleStatsCard';

export default function DurablesStats({ stats, currency }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();

  const value = stats ? formatMoney(stats.inUseValue, currency) : '--';
  const inUseCount = stats ? stats.inUseCount : '--';
  const totalCount = stats ? stats.totalCount : '--';

  return (
    <ModuleStatsCard
      label={t('durable.inUseTotalValue')}
      value={value}
      pills={[
        {
          key: 'inUse',
          label: t('durable.inUsePill', { count: inUseCount }),
          backgroundColor: 'rgba(74, 168, 104, 0.2)',
          color: Colors.green,
        },
        { key: 'total', label: t('durable.totalPill', { count: totalCount }) },
      ]}
    />
  );
}
