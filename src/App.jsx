import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './Pages/Landing';
import Dashboard from './Pages/Dashboard';
import Invoice from './Pages/Invoice';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/invoice/new" element={<Invoice />} />
                    <Route path="/invoice/:id" element={<Invoice />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
