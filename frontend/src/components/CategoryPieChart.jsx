import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CHART_COLORS } from '../utils/constants';
import { formatCompactCurrency, formatCurrency } from '../utils/format';

const CategoryPieChart = ({ data = [], currency = 'USD', height = 280, centerLabel = 'Total spent' }) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="pie-chart-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={94}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.category}-${index}`}
                fill={CATEGORY_COLORS[entry.category] || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatCurrency(value, currency), name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-center">
        <span>{centerLabel}</span>
        <strong>{formatCompactCurrency(total, currency)}</strong>
      </div>
    </div>
  );
};

export default CategoryPieChart;
