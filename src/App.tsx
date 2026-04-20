import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ResultsSection from './components/ResultsSection';
import ComparisonSection from './components/ComparisonSection';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import { useAuthStore } from './store/useAuthStore';

// Landing Page Component
const HomePage = () => (
    <>
        <Navbar />
        <main>
            <Hero />
            <Features />
            <HowItWorks />
            <ResultsSection />
            <ComparisonSection />
            <Testimonials />
            <Pricing />
        </main>
        <Footer />
    </>
);

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'user' }) => {
    const { isAuthenticated, user } = useAuthStore();
    const token = localStorage.getItem('token');
    
    if (!isAuthenticated && !token) {
        return <Navigate to="/login" replace />;
    }

    if (role && user && user.role !== role) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute role="user">
                            <StudentDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
