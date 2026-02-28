import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FamilyTree from './pages/FamilyTree';
import Documents from './pages/Documents';
import Members from './pages/Members';
import Sharing from './pages/Sharing';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<Layout><Dashboard /></Layout>} />
          <Route path="/app/tree" element={<Layout><FamilyTree /></Layout>} />
          <Route path="/app/documents" element={<Layout><Documents /></Layout>} />
          <Route path="/app/members" element={<Layout><Members /></Layout>} />
          <Route path="/app/members/:id" element={<Layout><Members /></Layout>} />
          <Route path="/app/sharing" element={<Layout><Sharing /></Layout>} />
          <Route path="/app/doctors" element={<Layout><Doctors /></Layout>} />
          <Route path="/app/settings" element={<Layout><Settings /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
