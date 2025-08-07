import React, { useEffect, useState } from "react";
import api from "../utils/api";

const TestProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    console.log('TestProducts component mounted');
    
    // Show debug info
    const debugInfo = {
      apiBaseURL: api.defaults.baseURL,
      envApiUrl: process.env.REACT_APP_API_URL,
      envNodeEnv: process.env.NODE_ENV,
      userAgent: navigator.userAgent
    };
    setDebug(debugInfo);
    console.log('Debug info:', debugInfo);
    
    const fetchProducts = async () => {
      try {
        console.log('About to make direct fetch call...');
        setLoading(true);
        
        // Try direct fetch first
        console.log('Trying direct fetch to http://localhost:5001/api/products...');
        const directResponse = await fetch('http://localhost:5001/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('Direct fetch response:', directResponse.status);
        
        if (!directResponse.ok) {
          throw new Error(`HTTP error! status: ${directResponse.status}`);
        }
        
        const directData = await directResponse.json();
        console.log('Direct fetch data:', directData);
        setProducts(directData.products || []);
        setError(null);
      } catch (err) {
        console.error('Direct fetch failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Products Component</h1>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <h3>Debug Info:</h3>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
      
      {loading && <div>Loading products...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      {!loading && (
        <div>
          <h2>Products ({products.length})</h2>
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <ul>
              {products.map((product, index) => (
                <li key={product._id || index}>
                  {product.name} - ${product.price}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TestProducts;
