import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import UsersTable from '../components/Tables/UsersTable';
import { useAuth } from '../context/AuthContext';
import TokenManager from '../services/TokenManager';
import toast from 'react-hot-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

let UsersPage: React.FC = () => {
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

  let handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/auth/remove/${userId}`);

      setUsers((prevUsers) => prevUsers.filter(user => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error('Error deleting user: ', error);
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
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
          Sign Out
        </button> 
      </div>
      <UsersTable users={users} onDelete={handleDeleteUser} />
    </Layout>
  );
};

export default UsersPage;
