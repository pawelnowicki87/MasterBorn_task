import { useCallback, useState } from 'react';
import { ProductConfigurator } from './components/ProductConfigurator/ProductConfigurator';
import { mockProduct, mockProductSimple } from './data/mockProduct';
import type { Configuration, PriceBreakdown } from './components/ProductConfigurator/types';
import { decodeConfigurationFromUrl } from './services/api';

function App() {
  const [product] = useState(() => {
    const encoded = new URLSearchParams(window.location.search).get('config');
    const sharedConfiguration = encoded ? decodeConfigurationFromUrl(encoded) : null;

    return sharedConfiguration?.productId === mockProductSimple.id
      ? mockProductSimple
      : mockProduct;
  });

  const handleConfigurationChange = useCallback((config: Configuration) => {
    // In a real app, you might sync this with a parent state or analytics
    console.log('Configuration updated:', config);
  }, []);

  const handleAddToCart = useCallback((config: Configuration, price: PriceBreakdown) => {
    // In a real app, this would add to cart and possibly navigate
    console.log('Added to cart:', { config, price });
    alert(`Added to cart!\n\nTotal: $${price.total.toFixed(2)}\nQuantity: ${config.quantity}`);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '24px',
      }}
    >
      <ProductConfigurator
        product={product}
        onConfigurationChange={handleConfigurationChange}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default App;
