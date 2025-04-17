import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { OpportunityProvider } from './context/OpportunityContext';
import { PropertyProvider } from './context/PropertyContext';
import CalendarPage from './pages/Calendar';
import CustomerForm from './pages/CustomerForm';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import OpportunityForm from './pages/OpportunityForm';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import Users from './pages/Users';

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
                  <CustomerProvider>
                    <OpportunityProvider>
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
                              <Route path="/opportunities" element={<Opportunities />} />
                              <Route path="/opportunities/new" element={<OpportunityForm />} />
                              <Route path="/opportunities/:id" element={<OpportunityDetail />} />
                              <Route path="/opportunities/edit/:id" element={<OpportunityForm />} />
                              <Route path="/users" element={<Users />} />
                            </Routes>
                          </main>
                        </div>
                      </div>
                    </OpportunityProvider>
                  </CustomerProvider>
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
