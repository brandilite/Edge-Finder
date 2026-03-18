'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const HEARD_FROM_OPTIONS = ['Friend', 'Google', 'GPT', 'Social Media', 'Other'];
const MARKET_OPTIONS = ['Forex', 'Crypto', 'Stocks', 'Commodities', 'Indices'];
const FEATURE_OPTIONS = ['Charts', 'Screener', 'News', 'AI Analysis', 'Heatmap', 'Calendar'];

const PRESET_SYMBOLS: Record<string, string[]> = {
  Forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'],
  Crypto: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD'],
  Stocks: ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT'],
  Commodities: ['XAU/USD', 'XAG/USD', 'WTI', 'BRENT', 'NG'],
  Indices: ['SPX500', 'NAS100', 'US30', 'GER40', 'UK100'],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [heardFrom, setHeardFrom] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const addSymbol = (symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (upper && !watchlistSymbols.includes(upper)) {
      setWatchlistSymbols((prev) => [...prev, upper]);
    }
    setSymbolInput('');
  };

  const removeSymbol = (symbol: string) => {
    setWatchlistSymbols((prev) => prev.filter((s) => s !== symbol));
  };

  const suggestedSymbols = selectedMarkets.flatMap((m) => PRESET_SYMBOLS[m] || []);

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await supabase
        .from('profiles')
        .update({
          heard_from: heardFrom,
          preferred_markets: selectedMarkets,
          prioritized_features: selectedFeatures,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (watchlistSymbols.length > 0) {
        const { data: watchlists } = await supabase
          .from('watchlists')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);

        if (watchlists && watchlists.length > 0) {
          await supabase
            .from('watchlists')
            .update({ symbols: watchlistSymbols, updated_at: new Date().toISOString() })
            .eq('id', watchlists[0].id);
        }
      }

      router.push('/');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return heardFrom !== '';
      case 2: return selectedMarkets.length > 0;
      case 3: return true;
      case 4: return selectedFeatures.length > 0;
      default: return false;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/brand/Logo White.png" alt="Reversals Club" width={180} height={50} className="mx-auto" />
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-[#015608]' : 'bg-[#1a1a1a]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl p-8 bg-[#0a0a0a] border border-[#1a1a1a]">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Where did you hear about us?</h2>
              <p className="text-gray-400 text-sm mb-6">Help us understand how you found Reversals Club.</p>
              <div className="space-y-3">
                {HEARD_FROM_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      heardFrom === option ? 'border-[#015608] bg-[#015608]/10' : 'border-[#1a1a1a] hover:border-[#333333]'
                    }`}
                  >
                    <input type="radio" name="heardFrom" value={option} checked={heardFrom === option} onChange={() => setHeardFrom(option)} className="w-4 h-4 text-[#015608] bg-black border-gray-600 focus:ring-[#015608] focus:ring-offset-0" />
                    <span className="text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">What markets interest you?</h2>
              <p className="text-gray-400 text-sm mb-6">Select all that apply.</p>
              <div className="space-y-3">
                {MARKET_OPTIONS.map((market) => (
                  <label
                    key={market}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMarkets.includes(market) ? 'border-[#015608] bg-[#015608]/10' : 'border-[#1a1a1a] hover:border-[#333333]'
                    }`}
                  >
                    <input type="checkbox" checked={selectedMarkets.includes(market)} onChange={() => toggleMarket(market)} className="w-4 h-4 rounded text-[#015608] bg-black border-gray-600 focus:ring-[#015608] focus:ring-offset-0" />
                    <span className="text-gray-200">{market}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Add to your watchlist</h2>
              <p className="text-gray-400 text-sm mb-6">Pick symbols to track. You can always change these later.</p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSymbol(symbolInput); } }}
                  placeholder="Type a symbol (e.g. EUR/USD)"
                  className="flex-1 px-4 py-3 rounded-lg bg-black border border-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:border-[#015608] focus:ring-1 focus:ring-[#015608] transition-colors"
                />
                <button onClick={() => addSymbol(symbolInput)} disabled={!symbolInput.trim()} className="px-4 py-3 bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white rounded-lg transition-colors">Add</button>
              </div>

              {suggestedSymbols.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Suggestions based on your markets:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSymbols.filter((s) => !watchlistSymbols.includes(s)).map((symbol) => (
                      <button key={symbol} onClick={() => addSymbol(symbol)} className="px-3 py-1.5 text-sm rounded-lg border border-[#1a1a1a] text-gray-300 hover:border-[#015608] hover:text-[#22c55e] transition-colors">+ {symbol}</button>
                    ))}
                  </div>
                </div>
              )}

              {watchlistSymbols.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Your watchlist:</p>
                  <div className="flex flex-wrap gap-2">
                    {watchlistSymbols.map((symbol) => (
                      <span key={symbol} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#015608]/10 border border-[#015608]/30 text-[#22c55e]">
                        {symbol}
                        <button onClick={() => removeSymbol(symbol)} className="hover:text-white transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">What features do you want to prioritize?</h2>
              <p className="text-gray-400 text-sm mb-6">We&apos;ll personalize your dashboard. Select all that interest you.</p>
              <div className="grid grid-cols-2 gap-3">
                {FEATURE_OPTIONS.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedFeatures.includes(feature) ? 'border-[#015608] bg-[#015608]/10' : 'border-[#1a1a1a] hover:border-[#333333]'
                    }`}
                  >
                    <input type="checkbox" checked={selectedFeatures.includes(feature)} onChange={() => toggleFeature(feature)} className="w-4 h-4 rounded text-[#015608] bg-black border-gray-600 focus:ring-[#015608] focus:ring-offset-0" />
                    <span className="text-gray-200 text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="text-gray-400 hover:text-gray-200 font-medium transition-colors">Back</button>
            ) : (<div />)}

            {step < 4 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">Next</button>
            ) : (
              <button onClick={handleComplete} disabled={saving || !canProceed()} className="bg-[#015608] hover:bg-[#016a0a] disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Get Started'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">Step {step} of 4</p>
      </div>
    </div>
  );
}
