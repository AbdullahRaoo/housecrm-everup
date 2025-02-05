import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import CalendarPage from './pages/Calendar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <PropertyProvider>
                  <div className="flex h-screen bg-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/customers/new" element={<CustomerForm />} />
                          <Route path="/customers/edit/:id" element={<CustomerForm />} />
                          <Route path="/properties" element={<Properties />} />
                          <Route path="/properties/:id" element={<PropertyDetail />} />
                          <Route path="/properties/new" element={<PropertyForm />} />
                          <Route path="/properties/edit/:id" element={<PropertyForm />} />
                          <Route path="/calendar" element={<CalendarPage />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </PropertyProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
