'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  // Step 1
  const [heardFrom, setHeardFrom] = useState('');
  // Step 2
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  // Step 3
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');
  // Step 4
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Redirect if not authenticated
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
      // Update profile
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

      // Update default watchlist with chosen symbols
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
            .update({
              symbols: watchlistSymbols,
              updated_at: new Date().toISOString(),
            })
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
      case 1:
        return heardFrom !== '';
      case 2:
        return selectedMarkets.length > 0;
      case 3:
        return true; // watchlist is optional
      case 4:
        return selectedFeatures.length > 0;
      default:
        return false;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f1419' }}>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#0f1419' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Edge<span className="text-blue-500">Finder</span>
          </h1>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ backgroundColor: '#151c24', border: '1px solid #243040' }}
        >
          {/* Step 1: Where did you hear about us? */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Where did you hear about us?
              </h2>
              <p className="text-gray-400 text-sm mb-6">Help us understand how you found EdgeFinder.</p>
              <div className="space-y-3">
                {HEARD_FROM_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      heardFrom === option
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="heardFrom"
                      value={option}
                      checked={heardFrom === option}
                      onChange={() => setHeardFrom(option)}
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Markets */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                What markets interest you?
              </h2>
              <p className="text-gray-400 text-sm mb-6">Select all that apply.</p>
              <div className="space-y-3">
                {MARKET_OPTIONS.map((market) => (
                  <label
                    key={market}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMarkets.includes(market)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market)}
                      onChange={() => toggleMarket(market)}
                      className="w-4 h-4 rounded text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-gray-200">{market}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Watchlist */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Add to your watchlist
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Pick symbols to track. You can always change these later.
              </p>

              {/* Symbol input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymbol(symbolInput);
                    }
                  }}
                  placeholder="Type a symbol (e.g. EUR/USD)"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  onClick={() => addSymbol(symbolInput)}
                  disabled={!symbolInput.trim()}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Suggested symbols */}
              {suggestedSymbols.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Suggestions based on your markets:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSymbols
                      .filter((s) => !watchlistSymbols.includes(s))
                      .map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => addSymbol(symbol)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
                        >
                          + {symbol}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Selected symbols */}
              {watchlistSymbols.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Your watchlist:</p>
                  <div className="flex flex-wrap gap-2">
                    {watchlistSymbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      >
                        {symbol}
                        <button
                          onClick={() => removeSymbol(symbol)}
                          className="hover:text-blue-200 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Features */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                What features do you want to prioritize?
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                We&apos;ll personalize your dashboard. Select all that interest you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {FEATURE_OPTIONS.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedFeatures.includes(feature)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="w-4 h-4 rounded text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-gray-200 text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-gray-400 hover:text-gray-200 font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving || !canProceed()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Get Started'}
              </button>
            )}
          </div>
        </div>

        {/* Step label */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Step {step} of 4
        </p>
      </div>
    </div>
  );
}
