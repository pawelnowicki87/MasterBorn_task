// usePriceCalculation Hook
// Marcus: "This hook handles async price fetching. A bit janky but works."

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Configuration,
  Product,
  PriceBreakdown,
  PriceResponse,
} from '../components/ProductConfigurator/types';
import { calculatePrice } from '../services/api';

interface UsePriceCalculationResult {
  price: PriceBreakdown | null;
  formattedTotal: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for managing price calculation
 */
export function usePriceCalculation(
  config: Configuration | null,
  product: Product,
): UsePriceCalculationResult {
  const [result, setResult] = useState<{
    config: Configuration;
    product: Product;
    response: PriceResponse | null;
    error: string | null;
  } | null>(null);
  const latestRequestRef = useRef<number>(0);

  const fetchPrice = useCallback(() => {
    const requestId = ++latestRequestRef.current;

    if (config) {
      calculatePrice(config, product).then(
        (response: PriceResponse) => {
          if (requestId === latestRequestRef.current) {
            setResult({ config, product, response, error: null });
          }
        },
        () => {
          if (requestId === latestRequestRef.current) {
            setResult({ config, product, response: null, error: 'ERR_PRICE_CALC_FAILED' });
          }
        },
      );
    }

    return () => {
      latestRequestRef.current++;
    };
  }, [config, product]);

  useEffect(fetchPrice, [fetchPrice]);

  const refetch = useCallback(() => {
    setResult(null);
    fetchPrice();
  }, [fetchPrice]);

  // Invalidate the previous price during render, before the new effect starts.
  const currentResult = result?.config === config && result?.product === product ? result : null;
  const isPending = config !== null && currentResult === null;

  return {
    price: currentResult?.response?.breakdown ?? null,
    formattedTotal: currentResult?.response?.formattedTotal ?? (isPending ? '...' : '$0.00'),
    isLoading: isPending,
    error: currentResult?.error ?? null,
    refetch,
  };
}
