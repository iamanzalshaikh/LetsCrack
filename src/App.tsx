import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TestSetBuilderPage from './pages/Admin/test-set-builder/TestSetBuilderPage';
import TestSetListPage from './pages/Admin/test-set-builder/TestSetListPage';
import TestSetFormPage from './pages/Admin/test-set-builder/TestSetFormPage';
import StudentLayout from './pages/Student/StudentLayout';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentCoursesPage from './pages/Student/StudentCoursesPage';
import StudentProgressPage from './pages/Student/StudentProgressPage';
import StudentPracticeLibraryPage from './pages/Student/StudentPracticeLibraryPage';
import StudentActivityPage from './pages/Student/StudentActivityPage';
import StudentReportsPage from './pages/Student/StudentReportsPage';
import TestSetup from './pages/Student/TestSetup';
import InstructionsScreen from './pages/Student/InstructionsScreen';
import WritingPlayer from './components/TestPlayer/WritingPlayer';
import SpeakingPlayer from './components/TestPlayer/SpeakingPlayer';
import MCQPlayer from './components/TestPlayer/MCQPlayer';
import TestResult from './pages/Student/TestResult';
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
import React from 'react';


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
                            <StudentLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<StudentDashboard />} />
                    <Route path="library" element={<StudentPracticeLibraryPage />} />
                    <Route path="activity" element={<StudentActivityPage />} />
                    <Route path="reports" element={<StudentReportsPage />} />
                    <Route path="courses" element={<StudentCoursesPage />} />
                    <Route path="progress" element={<StudentProgressPage />} />
                </Route>
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="sets/new" element={<TestSetFormPage />} />
                    <Route path="sets/:setNumber/edit" element={<TestSetFormPage />} />
                    <Route path="sets" element={<TestSetListPage />} />
                    <Route path="students" element={<AdminDashboard />} />
                    <Route path="test-builder/:setNumber" element={<TestSetBuilderPage />} />
                    <Route path="test-builder" element={<Navigate to="/admin/sets" replace />} />
                </Route>

                {/* Pre-Test Flow */}
                <Route 
                    path="/test/setup/:setNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <TestSetup />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/test/instructions/:sessionId" 
                    element={
                        <ProtectedRoute role="user">
                            <InstructionsScreen />
                        </ProtectedRoute>
                    } 
                />

                {/* Interactive Test Player Routes */}
                <Route 
                    path="/test/writing/:setNumber/:taskNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <WritingPlayer />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/test/speaking/:setNumber/:taskNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <SpeakingPlayer />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/test/reading/:setNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <MCQPlayer moduleType="reading" />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/test/listening/:setNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <MCQPlayer moduleType="listening" />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/results/:setNumber" 
                    element={
                        <ProtectedRoute role="user">
                            <TestResult />
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
