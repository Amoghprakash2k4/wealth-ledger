'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  TooltipProps,
} from 'recharts';
import { CategorySpendingDisplay } from '@/lib/store/selectors/transactionsSelectors';

interface SpendingChartsProps {
  spendingList: CategorySpendingDisplay[];
  incomeVsExpenses: {
    income: number;
    expenses: number;
    incomeFormatted: string;
    expensesFormatted: string;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  food: '#f97316', // orange
  transport: '#10b981', // green
  utilities: '#3b82f6', // blue
  entertainment: '#ec4899', // pink
  shopping: '#f59e0b', // amber
  other: '#8b5cf6', // violet
};
const DEFAULT_COLOR = '#64748b'; // slate

export function SpendingCharts({ spendingList, incomeVsExpenses }: SpendingChartsProps) {
  // Format data for Category Pie Chart
  const pieData = spendingList
    .filter((item) => item.amount > 0)
    .map((item) => ({
      name: item.category,
      value: item.amount,
      formattedValue: item.amountFormatted,
      color: CATEGORY_COLORS[item.category] || DEFAULT_COLOR,
    }));

  // Format data for Income vs Expense Bar Chart
  const barData = [
    {
      name: 'Income',
      value: incomeVsExpenses.income,
      formattedValue: incomeVsExpenses.incomeFormatted,
      fill: '#10b981', // green
    },
    {
      name: 'Expenses',
      value: incomeVsExpenses.expenses,
      formattedValue: incomeVsExpenses.expensesFormatted,
      fill: '#ef4444', // red
    },
  ];

  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-elevated border border-border-default p-3 rounded-xl shadow-lg">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-sm text-text-muted">
            Spent: <span className="text-white font-medium">{data.formattedValue}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-elevated border border-border-default p-3 rounded-xl shadow-lg">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className={`text-sm font-bold ${data.name === 'Income' ? 'text-accent-green' : 'text-accent-red'}`}>
            {data.formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown Chart */}
      <div className="card p-6 border-border-default bg-bg-card transition-all duration-200 hover:border-border-bright hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <h3 className="text-base font-bold text-white mb-4">Spending by Category</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="card p-6 border-border-default bg-bg-card transition-all duration-200 hover:border-border-bright hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <h3 className="text-base font-bold text-white mb-4">Income vs Expenses</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252a3d" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomBarTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
