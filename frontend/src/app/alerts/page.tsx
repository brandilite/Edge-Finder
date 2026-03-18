'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceAlert {
  id: string;
  symbol: string;
  target_price: number;
  alert_type: 'above' | 'below';
  notification_method: 'in_app' | 'email' | 'both';
  triggered: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [notifyMethod, setNotifyMethod] = useState<'in_app' | 'email' | 'both'>('both');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setAlerts(data || []);
    setLoading(false);
  };

  const createAlert = async () => {
    if (!user || !symbol.trim() || !targetPrice) return;

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase().trim(),
        target_price: parseFloat(targetPrice),
        alert_type: alertType,
        notification_method: notifyMethod,
        triggered: false,
      })
      .select()
      .single();

    if (!error && data) {
      setAlerts((prev) => [data, ...prev]);
      setSymbol('');
      setTargetPrice('');
      setShowCreate(false);
    }
  };

  const deleteAlert = async (id: string) => {
    await supabase.from('price_alerts').delete().eq('id', id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Price Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Get notified when prices hit your targets</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#015608] hover:bg-[#016a0a] text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Create Price Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. AAPL, BTC/USD"
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Target Price</label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Alert When</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAlertType('above')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    alertType === 'above'
                      ? 'bg-[#015608]/20 text-[#22c55e] border border-[#015608]/30'
                      : 'bg-black border border-[#1a1a1a] text-gray-400'
                  }`}
                >
                  <TrendingUp size={14} />
                  Above
                </button>
                <button
                  onClick={() => setAlertType('below')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    alertType === 'below'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-black border border-[#1a1a1a] text-gray-400'
                  }`}
                >
                  <TrendingDown size={14} />
                  Below
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Notification</label>
              <select
                value={notifyMethod}
                onChange={(e) => setNotifyMethod(e.target.value as 'in_app' | 'email' | 'both')}
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[#1a1a1a] text-sm text-white focus:outline-none focus:border-[#015608] transition-colors"
              >
                <option value="both">In-App & Email</option>
                <option value="in_app">In-App Only</option>
                <option value="email">Email Only</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createAlert}
              disabled={!symbol.trim() || !targetPrice}
              className="px-6 py-2 rounded-lg bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              Create Alert
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="text-gray-600 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No price alerts yet</h3>
            <p className="text-sm text-gray-500">Create your first alert to get notified when prices reach your targets.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Symbol</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Condition</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Target Price</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Notification</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#111111] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{alert.symbol}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm ${alert.alert_type === 'above' ? 'text-[#22c55e]' : 'text-red-400'}`}>
                      {alert.alert_type === 'above' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      Price {alert.alert_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white font-mono">${alert.target_price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400 capitalize">{alert.notification_method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.triggered
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-[#015608]/10 text-[#22c55e] border border-[#015608]/20'
                    }`}>
                      {alert.triggered ? 'Triggered' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
