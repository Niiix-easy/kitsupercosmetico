import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, 
  Package, ArrowLeft, Loader2, LogOut, ShieldCheck 
} from 'lucide-react';
import axios from 'axios';
import { auth, db } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AdminVideoManager } from './AdminVideoManager';

const COLORS = ['#d4af37', '#ba8c1a', '#ffe58f', '#91711e', '#f4f4f5'];

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dyusar_admin_user');
    if (savedUser) {
      setAdminUser(JSON.parse(savedUser));
      fetchStats();
    } else {
      onClose();
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dyusar_admin_user');
    onClose();
  };

  if (!adminUser) return null;

  if (loading || !stats) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0c0d10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-amber-200 font-mono text-sm uppercase tracking-widest">Carregando métricas em tempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0d10] overflow-y-auto text-white">
      {/* Sidebar / Header */}
      <header className="sticky top-0 z-10 bg-[#14151b]/80 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold font-serif-display tracking-tight">
              Dyusar <span className="text-amber-400">Admin Intelligence</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-slate-400 font-mono">
              Sessão: {adminUser?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#1a1c25] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">FATURAMENTO</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total aprovado via Pix</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1a1c25] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">VENDAS</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">{stats.paidOrders}</p>
            <p className="text-xs text-slate-400 mt-1">De um total de {stats.totalOrders} checkouts</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1a1c25] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">CONVERSÃO QUIZ</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">{stats.quizConversion.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Vendas após diagnóstico</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1a1c25] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">ATIVIDADE</span>
            </div>
            <p className="text-2xl font-black font-mono text-white">Online</p>
            <p className="text-xs text-slate-400 mt-1">Sistema operando normalmente</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Best Selling Kits */}
          <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg">Performance por Kit</h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.kitsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="name" stroke="#718096" fontSize={10} tick={{fill: '#718096'}} />
                  <YAxis stroke="#718096" fontSize={10} tick={{fill: '#718096'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1c25', border: '1px solid #2d3748', borderRadius: '8px' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Distribution */}
          <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg">Distribuição de Receita</h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.kitsChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.kitsChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1c25', border: '1px solid #2d3748', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Video Engagement Analytics */}
        <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">Engajamento de Vídeos de Prova Social</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart (2 cols) */}
            <div className="lg:col-span-2 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.videoMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="name" stroke="#718096" fontSize={10} tick={{fill: '#718096'}} />
                  <YAxis stroke="#718096" fontSize={10} tick={{fill: '#718096'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1c25', border: '1px solid #2d3748', borderRadius: '8px' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Legend />
                  <Bar dataKey="visualizacoes" name="Visualizações (Inícios)" fill="#718096" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retencao50" name="Retenção 50% (%)" fill="#3182ce" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conclusao" name="Taxa Conclusão (%)" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats Table (1 col) */}
            <div className="bg-[#1a1c25] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">Performance de Funil de Vídeo</h4>
                <div className="space-y-4">
                  {stats.videoMetrics?.map((vid: any) => (
                    <div key={vid.name} className="pb-3 border-b border-slate-800 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white line-clamp-1">{vid.name}</span>
                        <span className="text-xs font-mono text-amber-400 font-bold">{vid.conclusao}% Concl.</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Views: {vid.visualizacoes}</span>
                        <span>Retenção 50%: {vid.retencao50}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                * As taxas são calculadas em tempo real com base no disparo de pixels e interações dos usuários de ponta a ponta.
              </p>
            </div>
          </div>
        </div>

        {/* Heatmap de Visualização (Audience Retention) */}
        <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" stroke="#81e6d9" />
            <h3 className="font-bold text-lg">Heatmap & Retenção de Audiência (Safari/Chrome)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Gráfico de calor que ilustra a retenção de público de ponta a ponta. Identifique os pontos exatos onde os usuários pausam ou abandonam a reprodução.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.videoMetrics?.map((vid: any) => {
              const retentionData = [
                { ponto: '0%', retencao: 100 },
                { ponto: '50%', retencao: vid.retencao50 },
                { ponto: '100%', retencao: vid.conclusao }
              ];
              
              return (
                <div key={vid.name} className="bg-[#1a1c25] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white mb-4 truncate">{vid.name}</h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={retentionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                          <XAxis dataKey="ponto" stroke="#718096" fontSize={9} tick={{fill: '#718096'}} />
                          <YAxis stroke="#718096" fontSize={9} domain={[0, 100]} tick={{fill: '#718096'}} unit="%" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#14151b', border: '1px solid #2d3748', borderRadius: '8px' }}
                            itemStyle={{ color: '#81e6d9' }}
                          />
                          <Line type="monotone" dataKey="retencao" name="Retenção" stroke="#81e6d9" strokeWidth={3} dot={{ stroke: '#81e6d9', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Abandono: {100 - vid.conclusao}%</span>
                    <span className="text-emerald-400 font-bold">Desempenho: {vid.conclusao > 50 ? 'Excelente' : 'Ajustar'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="p-6 rounded-2xl bg-[#14151b] border border-slate-800 shadow-2xl overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Últimas Transações</h3>
            <button onClick={fetchStats} className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest">Atualizar Agora</button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase font-black tracking-widest border-b border-slate-800">
                <th className="pb-4">Data</th>
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Kit</th>
                <th className="pb-4">Valor</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {stats.recentSales.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 font-medium text-white">{order.customerEmail}</td>
                  <td className="py-4 text-slate-300">{order.bundleTitle}</td>
                  <td className="py-4 font-mono font-bold text-amber-300">R$ {order.amount.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {order.status === 'paid' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Video Showcase Manager component */}
        <AdminVideoManager />
      </main>
    </div>
  );
};
