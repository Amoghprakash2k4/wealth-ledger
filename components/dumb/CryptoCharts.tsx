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
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { selectPortfolioBreakdown } from '@/lib/store/selectors/portfolioSelectors';

type BreakdownItem = ReturnType<typeof selectPortfolioBreakdown>[number];

interface CryptoChartsProps {
  breakdown: BreakdownItem[];
}

const COIN_COLORS: Record<string, string> = {
  BTC: '#f97316', // orange
  ETH: '#8b5cf6', // violet
  SOL: '#10b981', // green
};

const DEFAULT_COLOR = '#6366f1'; // indigo

export function CryptoCharts({ breakdown }: CryptoChartsProps) {
  // Format data for Pie Chart
  const pieData = breakdown
    .filter((asset) => asset.currentValue > 0)
    .map((asset) => ({
      name: asset.symbol,
      value: asset.currentValue,
      formattedValue: asset.currentValueFormatted,
      color: COIN_COLORS[asset.symbol] || DEFAULT_COLOR,
    }));

  // Format data for Bar Chart
  const barData = breakdown.map((asset) => ({
    name: asset.symbol,
    profitLoss: asset.profitLoss,
    formattedValue: asset.profitLossFormatted,
    fill: asset.profitLoss >= 0 ? '#10b981' : '#ef4444', // green or red
  }));

  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-elevated border border-border-default p-3 rounded-xl shadow-lg">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-sm text-text-muted">
            Value: <span className="text-white font-medium">{data.formattedValue}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.profitLoss >= 0;
      return (
        <div className="bg-bg-elevated border border-border-default p-3 rounded-xl shadow-lg">
          <p className="font-bold text-white mb-1">{data.name} P/L</p>
          <p className={`text-sm font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {data.formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation Chart */}
      <div className="card p-6 border-border-default bg-bg-card transition-all duration-200 hover:border-border-bright hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <h3 className="text-base font-bold text-white mb-4">Allocation Breakdown</h3>
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

      {/* Profit/Loss Chart */}
      <div className="card p-6 border-border-default bg-bg-card transition-all duration-200 hover:border-border-bright hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <h3 className="text-base font-bold text-white mb-4">Profit & Loss</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252a3d" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomBarTooltip />} />
              <ReferenceLine y={0} stroke="#252a3d" />
              <Bar dataKey="profitLoss" radius={[4, 4, 4, 4]} maxBarSize={40}>
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
