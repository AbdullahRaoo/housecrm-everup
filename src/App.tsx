import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PropertyProvider } from './context/PropertyContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';  // Add this import
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';

function App() {
  return (
    <Router>
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
              </Routes>
            </main>
          </div>
        </div>
      </PropertyProvider>
    </Router>
  );
}

export default App;
