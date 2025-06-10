import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<User[]>('http://localhost:3000/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    setFilteredUsers(
      users.filter(u =>
        [u.firstName, u.lastName, u.username, u.email]
          .some(val => val?.toLowerCase().includes(keyword))
      )
    );
  }, [searchKeyword, users]);

  return { users, filteredUsers, searchKeyword, setSearchKeyword, loading, fetchUsers };
};
