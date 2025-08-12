import React, { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import ChatBox from './pages/ChatBox';
import Connections from './pages/Connections';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import { useUser, useAuth } from '@clerk/clerk-react';
import Layout from './pages/Layout';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchUser } from './Features/User/userSlice';
import { fetchConnections } from './Features/connections/connectionsSlice';
import { addMessage } from './Features/Messages/MessagesSlice';
import Notification from './components/Notification';

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const pathnameRef = useRef(pathname);
  const eventSourceRef = useRef(null);  // Store EventSource instance

  // Fetch user + connections when logged in
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        if (!token) return;
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  // Keep track of current pathname for notifications logic
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Setup SSE connection with user ID once user is available
  useEffect(() => {
    if (!user?.id) return;  // Wait for user.id to exist

    // Cleanup old eventSource if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${import.meta.env.VITE_BASE_URL}/api/message/${user.id}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (pathnameRef.current === `/messages/${message.from_user_id._id}`) {
          dispatch(addMessage(message));
        } else {
          toast.custom(
            (t) => <Notification t={t} message={message} />,
            { position: 'bottom-right' }
          );
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    // Cleanup on unmount or user change
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
