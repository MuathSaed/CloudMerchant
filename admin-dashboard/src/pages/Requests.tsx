import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import RequestsTable from '../components/Tables/RequestsTable';
import { useAuth } from '../context/AuthContext';
import TokenManager from '../services/TokenManager';
import toast from 'react-hot-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  description: string;
  image: string;
  createdAt: string;
}

let RequestsPage: React.FC = () => {
  let { user, signOut } = useAuth(); 
  let [users, setUsers] = useState<User[]>([]);
  let [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let fetchUsers = async () => {
      setIsLoading(true);
      try {
        let response = await api.get('/auth/all');
        setUsers(response.data.users);

        console.log('Users: ', response.data.users);
      } catch (error) {
        console.error('Error fetching users: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  let handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/auth/approve/${userId}`);

      setUsers((prevUsers) => prevUsers.filter(user => user.approved !== true));
      toast.success("User approved successfully");
    } catch (error) {
      console.error('Error approving user: ', error);
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
        <h1 className="text-2xl font-bold mb-4">Approval Requests</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
          Sign Out
        </button> 
      </div>
      <RequestsTable users={users.filter(user => user.role !== 'Buyer' && user.role !== 'Admin' && user.approved !== true)} onApprove={handleApproveUser} />
    </Layout>
  );
};

export default RequestsPage;
