import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout'; 
import { useAuth } from '../context/AuthContext'; 
import api from '../services/api';
import TokenManager from '../services/TokenManager';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

let Dashboard: React.FC = () => {
  let { user, signOut } = useAuth(); 
  let [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenueDelivered: 0,
    totalRevenueCancelled: 0,
  });

  useEffect(() => {
    let fetchStatistics = async () => {
      try {
        let usersResponse = await api.get('/auth/all'); 
        let productsResponse = await api.get('/product/all'); 
        let ordersResponse = await api.get('/order/all');

        let deliveredRevenue = ordersResponse.data.orders
          .filter((order: { status: string }) => order.status === 'Delivered')
          .reduce((sum: number, order: { totalAmount: number }) => sum + order.totalAmount, 0);

        let CancelledRevenue = ordersResponse.data.orders
          .filter((order: { status: string }) => order.status === 'Cancelled')
          .reduce((sum: number, order: { totalAmount: number }) => sum + order.totalAmount, 0);

        setStatistics({
          totalUsers: usersResponse.data.users.length, 
          totalProducts: productsResponse.data.products.length, 
          totalOrders: ordersResponse.data.orders.length, 
          totalRevenueDelivered: deliveredRevenue, 
          totalRevenueCancelled: CancelledRevenue, 
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics(); 
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

  let chartData = {
    labels: ['Users', 'Products', 'Orders'],
    datasets: [{
      label: 'Count',
      data: [statistics.totalUsers, statistics.totalProducts, statistics.totalOrders],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    }],
  };

  let revenueChartData = {
    labels: ['Revenue', 'Cancelled'],
    datasets: [{
      label: 'Revenue',
      data: [statistics.totalRevenueDelivered, statistics.totalRevenueCancelled], 
      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'], 
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
      borderWidth: 1,
    }],
  };

  return (
    <>
    <Layout>
    <div style={{margin: 15}} className='flex items-center justify-between'>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
        Sign Out
      </button> 
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-md shadow-md" style={{ maxWidth: '400px', margin: 'auto' }}>
          <Bar data={chartData} />
        </div>

        {/* Doughnut/Pie Chart */}
        <div className="bg-white p-4 rounded-md shadow-md" style={{ maxWidth: '400px', margin: 'auto' }}>
          <Doughnut data={revenueChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4">
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{statistics.totalUsers}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="text-gray-500">Total Products</div>
          <div className="text-2xl font-bold">{statistics.totalProducts}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{statistics.totalOrders}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">${statistics.totalRevenueDelivered}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="text-gray-500">Total Cancelled</div>
          <div className="text-2xl font-bold">${statistics.totalRevenueCancelled}</div>
        </div>
      </div>
    </Layout>
    </>
  );
};

export default Dashboard;
