'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    date: string;
    spend: number;
    conversions: number;
    roas: number;
  }>;
}

// Données de démonstration
const demoData = [
  { date: '1 Déc', spend: 450, conversions: 12, roas: 3.2 },
  { date: '2 Déc', spend: 520, conversions: 15, roas: 3.8 },
  { date: '3 Déc', spend: 480, conversions: 11, roas: 2.9 },
  { date: '4 Déc', spend: 590, conversions: 18, roas: 4.1 },
  { date: '5 Déc', spend: 620, conversions: 22, roas: 4.5 },
  { date: '6 Déc', spend: 550, conversions: 16, roas: 3.6 },
  { date: '7 Déc', spend: 680, conversions: 25, roas: 4.8 },
  { date: '8 Déc', spend: 720, conversions: 28, roas: 5.1 },
  { date: '9 Déc', spend: 650, conversions: 21, roas: 4.2 },
  { date: '10 Déc', spend: 710, conversions: 26, roas: 4.7 },
  { date: '11 Déc', spend: 690, conversions: 24, roas: 4.4 },
  { date: '12 Déc', spend: 780, conversions: 30, roas: 5.2 },
  { date: '13 Déc', spend: 820, conversions: 32, roas: 5.4 },
  { date: '14 Déc', spend: 750, conversions: 27, roas: 4.6 },
];

export function PerformanceChart({ data = demoData }: PerformanceChartProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Performance des 14 derniers jours</h3>
          <p className="text-sm text-gray-500">Dépenses et conversions</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Dépenses ($)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-400">Conversions</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a24', 
                border: '1px solid #2e2e3a',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: '#fff', marginBottom: '8px' }}
              itemStyle={{ color: '#9ca3af' }}
            />
            <Area 
              type="monotone" 
              dataKey="spend" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSpend)" 
              name="Dépenses ($)"
            />
            <Area 
              type="monotone" 
              dataKey="conversions" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorConversions)" 
              name="Conversions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


