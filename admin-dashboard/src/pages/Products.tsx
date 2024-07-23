import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api'; 
import Layout from '../components/Layout';
import ProductsTable from '../components/Tables/ProductsTable';
import { useAuth } from '../context/AuthContext';
import TokenManager from '../services/TokenManager';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string; 
  category: string;
  quantity: number; 
  thumbnail: string;
  images: { url: string }[];
}

let Products: React.FC = () => {
  let { user, signOut } = useAuth();
  let [products, setProducts] = useState<Product[]>([]);
  let [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    let fetchProducts = async () => {
      setIsLoading(true);
      try {
        let response = await api.get('/product/all');
        setProducts(response.data.products);
        console.log('Products: ', response.data.products);
      } catch (error) {
        console.error('Error fetching products: ', error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchProducts();
  }, []); 

  let handleDeleteProduct = async (productId: string) => {
    console.log(productId);
    try {
      await api.delete(`/product/all/${productId}`); 
      // Update the products list after successful deletion
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId)); 
      toast.success("Product Deleted Successfully"); 
    } catch (error) {
      toast.error("Failed to delete product"); 
      console.error('Error deleting product:', error);
    }
  };

  let handleLogout = async () => {
    try {
      await api.post('/auth/sign-out', {
        refreshToken: TokenManager.getTokens().refresh,
      });
      signOut();
      console.log("Successfully logged out");
    } catch (error) {
      signOut();
      console.error("Logout error:", error);
    }
  };

  return (
    <Layout>
      <div style={{margin: 15}} className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
          Sign Out
        </button> 
      </div>
      <ProductsTable products={products} onDelete={handleDeleteProduct}/>
    </Layout>
  );
};

export default Products;
