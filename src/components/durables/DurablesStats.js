import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../store/settings';
import FilteredSummaryBar from '../common/FilteredSummaryBar';

export default function DurablesStats({ stats, currency }) {
  const { t } = useTranslation();

  return (
    <FilteredSummaryBar
      label={t('durable.filteredInUseValue')}
      value={stats ? formatMoney(stats.inUseValue, currency) : '--'}
      activeCount={stats ? stats.inUseCount : '--'}
      activeLabel={t('durable.inUse')}
      totalCount={stats ? stats.totalCount : '--'}
    />
  );
}
