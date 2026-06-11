import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Tell server this user is online
      socket.emit('user_online', {
        user_id: user.id,
        restaurant_id: user.restaurant_id,
        name: user.name,
        role: user.role,
      });

      // Join relevant rooms
      if (user.role === 'kitchen') {
        socket.emit('join_kitchen', user.restaurant_id);
      }
      if (user.role === 'waiter') {
        socket.emit('join_waiter', { restaurant_id: user.restaurant_id, waiterId: user.id });
      }
    });

    socket.on('online_users_updated', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socketRef, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;