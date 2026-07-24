import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../store/settings';
import FilteredSummaryBar from '../common/FilteredSummaryBar';

export default function AssetsStats({ stats, currency }) {
  const { t } = useTranslation();

  return (
    <FilteredSummaryBar
      label={t('asset.filteredActiveValue')}
      value={stats ? formatMoney(stats.totalValue, currency) : '--'}
      activeCount={stats ? stats.activeCount : '--'}
      activeLabel={t('asset.active')}
      totalCount={stats ? stats.totalCount : '--'}
    />
  );
}
