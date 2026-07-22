import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import ModuleStatsCard from '../common/ModuleStatsCard';

export default function AssetsStats({ stats, currency }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();

  const value = stats ? formatMoney(stats.totalValue, currency) : '--';
  const activeCount = stats ? stats.activeCount : '--';
  const totalCount = stats ? stats.totalCount : '--';

  return (
    <ModuleStatsCard
      label={t('asset.totalValue')}
      value={value}
      pills={[
        {
          key: 'active',
          label: `${activeCount} ${t('asset.active')}`,
          backgroundColor: 'rgba(74, 168, 104, 0.2)',
          color: Colors.green,
        },
        { key: 'total', label: t('common.count', { count: totalCount }) },
      ]}
    />
  );
}
