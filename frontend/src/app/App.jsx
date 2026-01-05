import {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import '../shared/styles/index.css';

import {LoginPage, RegisterPage} from '../pages/auth';

import {HomePage} from '../pages/home';
import {ProfilePage} from '../pages/profile';
import {SettingsPage} from '../pages/settings';
import {ShopPage} from '../pages/shop';

import {CreditsPage} from '../pages/credits';

import {CourseDetailPage, CoursesPage} from '../pages/courses';

import {CourseLearningPage, LearningPage, TopicTheoryPage, TopicPracticePage} from '../pages/learning';

import {MainLayout} from '../widgets/layout';

import {api, setAuthToken} from '../shared/api';

import {NavigationLockProvider} from '../shared/lib/navigation-lock';

function App() {
    const [user, setUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            setIsCheckingAuth(false);
            return;
        }

        setAuthToken(token);
        api
            .get('/api/auth/me/')
            .then((resp) => setUser(resp.data))
            .catch(() => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                setAuthToken(null);
                setUser(null);
            })
            .finally(() => setIsCheckingAuth(false));
    }, []);

    const handleAuthSuccess = (accessToken, profile) => {
        localStorage.setItem('access', accessToken);
        setAuthToken(accessToken);
        setUser(profile);
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setAuthToken(null);
        setUser(null);
    };

    if (isCheckingAuth) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    fontSize: '18px',
                }}
            >
                Loading...
            </div>
        );
    }

    return (
        <BrowserRouter>
            <NavigationLockProvider>
                <Routes>
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/home" replace/> : <Navigate to="/register" replace/>
                    }
                />

                <Route
                    path="/register"
                    element={
                        user ? <Navigate to="/home" replace/> : <RegisterPage onAuth={handleAuthSuccess}/>
                    }
                />
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/home" replace/> : <LoginPage onAuth={handleAuthSuccess}/>
                    }
                />

                <Route
                    element={
                        user ? (
                            <MainLayout user={user} onLogout={handleLogout}/>
                        ) : (
                            <Navigate to="/login" replace/>
                        )
                    }
                >
                    <Route path="/home" element={<HomePage user={user}/>}/>
                    <Route path="/profile" element={<ProfilePage user={user}/>}/>
                    <Route path="/courses" element={<CoursesPage/>}/>
                    <Route path="/courses/:id" element={<CourseDetailPage/>}/>
                    <Route path="/learning" element={<LearningPage/>}/>
                    <Route path="/learning/courses/:id" element={<CourseLearningPage/>}/>
                    <Route path="/shop" element={<ShopPage/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                    <Route path="/credits" element={<CreditsPage/>}/>
                    <Route path="/learning/courses/:courseId/topics/:topicId" element={<TopicTheoryPage/>}/>
                    <Route path="/learning/courses/:courseId/topics/:topicId/practice" element={<TopicPracticePage/>}/>
                </Route>

                <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </NavigationLockProvider>
        </BrowserRouter>
    );
}

export default App;
