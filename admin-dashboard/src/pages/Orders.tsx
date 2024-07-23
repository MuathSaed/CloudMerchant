import React, { useEffect, useState } from 'react';
import api from '../services/api'; 
import Layout from '../components/Layout';
import OrderTable from '../components/Tables/OrdersTable';
import TokenManager from '../services/TokenManager';
import { useAuth } from '../context/AuthContext';


interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    thumbnail: string; 
  };
  quantity: number;
}

export interface Order {
  _id: string; 
  user: string; 
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: string;
  createdAt: string; 
}


let Orders: React.FC = () => {
  let { signOut } = useAuth(); 
  let [orders, setOrders] = useState<Order[]>([]); 

  useEffect(() => {
    let fetchOrders = async () => {
      try {
        let response = await api.get('/order/all'); 
        setOrders(response.data.orders);
        console.log('Orders: ', response.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []); 

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
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
          Sign Out
        </button> 
      </div>

      <OrderTable orders={orders} />
    </Layout>
  );
};

export default Orders;
