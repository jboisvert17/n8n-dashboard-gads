'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

// Données de démonstration - 30 derniers jours
const generateDemoData = () => {
  const data = [];
  const baseDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Génère des données réalistes avec une tendance à la hausse
    const dayFactor = 1 + (29 - i) * 0.01; // Tendance croissante
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.7 : 1; // Moins le weekend
    const randomFactor = 0.8 + Math.random() * 0.4; // Variation aléatoire
    
    const spend = Math.round(350 * dayFactor * weekendFactor * randomFactor);
    const conversions = Math.round(spend / 30 * randomFactor);
    const roas = 2.5 + Math.random() * 3;
    
    data.push({
      date: date.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' }),
      fullDate: date.toLocaleDateString('fr-CA'),
      spend,
      conversions,
      roas: Number(roas.toFixed(2)),
      impressions: Math.round(spend * 45 * randomFactor),
      clicks: Math.round(spend * 2.5 * randomFactor),
      ctr: Number((2 + Math.random() * 3).toFixed(2)),
    });
  }
  
  return data;
};

const demoData = generateDemoData();

type TimeRange = '7d' | '14d' | '30d';
type MetricType = 'spend' | 'conversions' | 'roas' | 'traffic';

export default function HistoryPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('spend');

  const getFilteredData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    return demoData.slice(-days);
  };

  const filteredData = getFilteredData();

  // Calcul des totaux
  const totals = filteredData.reduce((acc, day) => ({
    spend: acc.spend + day.spend,
    conversions: acc.conversions + day.conversions,
    impressions: acc.impressions + day.impressions,
    clicks: acc.clicks + day.clicks,
  }), { spend: 0, conversions: 0, impressions: 0, clicks: 0 });

  const avgRoas = filteredData.reduce((sum, d) => sum + d.roas, 0) / filteredData.length;

  const metricCards = [
    { 
      id: 'spend' as const, 
      label: 'Dépenses', 
      value: `$${totals.spend.toLocaleString('fr-CA')}`,
      icon: DollarSign,
      color: 'blue',
    },
    { 
      id: 'conversions' as const, 
      label: 'Conversions', 
      value: totals.conversions.toString(),
      icon: Target,
      color: 'emerald',
    },
    { 
      id: 'roas' as const, 
      label: 'ROAS moyen', 
      value: `${avgRoas.toFixed(2)}x`,
      icon: TrendingUp,
      color: 'violet',
    },
    { 
      id: 'traffic' as const, 
      label: 'Clics', 
      value: totals.clicks.toLocaleString('fr-CA'),
      icon: BarChart3,
      color: 'cyan',
    },
  ];

  const renderChart = () => {
    switch (selectedMetric) {
      case 'spend':
        return (
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value}`, 'Dépenses']}
            />
            <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
          </AreaChart>
        );
      
      case 'conversions':
        return (
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case 'roas':
        return (
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}x`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [`${value}x`, 'ROAS']}
            />
            <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
          </LineChart>
        );
      
      case 'traffic':
        return (
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" name="Clics" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Historique" 
        subtitle="Évolution de vos performances dans le temps" 
      />

      <div className="p-6 space-y-6">
        {/* Sélection de la période */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {(['7d', '14d', '30d'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={clsx(
                  'px-4 py-2 rounded-lg transition-all',
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                )}
              >
                {range === '7d' ? '7 jours' : range === '14d' ? '14 jours' : '30 jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Cartes de métriques (cliquables) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(card => {
            const Icon = card.icon;
            const isSelected = selectedMetric === card.id;
            
            return (
              <button
                key={card.id}
                onClick={() => setSelectedMetric(card.id)}
                className={clsx(
                  'card text-left transition-all',
                  isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-dark-900'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className={clsx(
                    'p-3 rounded-xl',
                    card.color === 'blue' && 'bg-blue-500/10',
                    card.color === 'emerald' && 'bg-emerald-500/10',
                    card.color === 'violet' && 'bg-violet-500/10',
                    card.color === 'cyan' && 'bg-cyan-500/10',
                  )}>
                    <Icon className={clsx(
                      'w-6 h-6',
                      card.color === 'blue' && 'text-blue-400',
                      card.color === 'emerald' && 'text-emerald-400',
                      card.color === 'violet' && 'text-violet-400',
                      card.color === 'cyan' && 'text-cyan-400',
                    )} />
                  </div>
                </div>
                {isSelected && (
                  <p className="text-xs text-blue-400 mt-2">Actuellement affiché ↓</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Graphique principal */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">
            {selectedMetric === 'spend' && '💰 Évolution des dépenses'}
            {selectedMetric === 'conversions' && '🎯 Conversions par jour'}
            {selectedMetric === 'roas' && '📈 Évolution du ROAS'}
            {selectedMetric === 'traffic' && '👆 Évolution des clics'}
          </h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Données détaillées</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Dépenses</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Conv.</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">ROAS</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Impr.</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Clics</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice().reverse().slice(0, 10).map((day, index) => (
                  <tr key={index} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-4 text-white">{day.fullDate}</td>
                    <td className="py-3 px-4 text-right text-gray-300">${day.spend}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{day.conversions}</td>
                    <td className={clsx(
                      'py-3 px-4 text-right font-medium',
                      day.roas >= 4 ? 'text-emerald-400' : day.roas >= 2 ? 'text-blue-400' : 'text-amber-400'
                    )}>
                      {day.roas}x
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">{day.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{day.clicks}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{day.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length > 10 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Affichage des 10 derniers jours sur {filteredData.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


