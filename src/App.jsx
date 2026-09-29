import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './store/AppStore.jsx'
import Shell from './components/Shell.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Publish from './pages/Publish.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import Orders from './pages/Orders.jsx'
import Messages from './pages/Messages.jsx'
import Credit from './pages/Credit.jsx'
import Profile from './pages/Profile.jsx'

function RequireAuth({ children }) {
  const { currentUser } = useApp()
  const loc = useLocation()
  if (!currentUser) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/credit" element={<Credit />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/task/:id" element={<TaskDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}