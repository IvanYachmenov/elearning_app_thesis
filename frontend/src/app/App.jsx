import {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import '../shared/styles/index.css';

import {LoginPage, RegisterPage} from '../pages/auth';
import {LandingPage} from '../pages/landing';

import {HomePage} from '../pages/home';
import {ProfilePage} from '../pages/profile';
import {SettingsPage} from '../pages/settings';
import {ShopPage} from '../pages/shop';

import {CreditsPage} from '../pages/credits';

import {CourseDetailPage, CoursesPage} from '../pages/courses';

import {CourseLearningPage, LearningPage, TopicTheoryPage, TopicPracticePage} from '../pages/learning';

import {TeacherCoursesPage, TeacherCourseEditPage} from '../pages/teacher';

import {MainLayout} from '../widgets/layout';

import {api, setAuthToken} from '../shared/api';
import {getCookie, deleteCookie} from '../shared/lib/cookies';
import CookieConsent from '../shared/components/CookieConsent';

import {NavigationLockProvider} from '../shared/lib/navigation-lock';
import {ThemeProvider} from '../shared/lib/theme/ThemeContext';
import {LanguageProvider} from '../shared/lib/i18n/LanguageContext';

function App() {
    const [user, setUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const token = getCookie('access');
        if (!token) {
            setIsCheckingAuth(false);
            return;
        }

        setAuthToken(token);
        api
            .get('/api/auth/me/')
            .then((resp) => setUser(resp.data))
            .catch(() => {
                deleteCookie('access');
                deleteCookie('refresh');
                setAuthToken(null);
                setUser(null);
            })
            .finally(() => setIsCheckingAuth(false));
    }, []);

    const handleAuthSuccess = (accessToken, profile) => {
        // Token is already saved in cookie by LoginPage/RegisterPage
        setAuthToken(accessToken);
        setUser(profile);
    };

    const handleLogout = () => {
        deleteCookie('access');
        deleteCookie('refresh');
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
            <ThemeProvider>
                <LanguageProvider>
                    <NavigationLockProvider>
                        <CookieConsent />
                        <Routes>
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/home" replace/> : <LandingPage/>
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
                    <Route path="/profile" element={<ProfilePage user={user} onUserUpdate={setUser}/>}/>
                    <Route path="/courses" element={<CoursesPage/>}/>
                    <Route path="/courses/:id" element={<CourseDetailPage/>}/>
                    <Route path="/learning" element={<LearningPage/>}/>
                    <Route path="/learning/courses/:id" element={<CourseLearningPage/>}/>
                    <Route path="/shop" element={<ShopPage/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                    <Route path="/credits" element={<CreditsPage/>}/>
                    <Route path="/learning/courses/:courseId/topics/:topicId" element={<TopicTheoryPage/>}/>
                    <Route path="/learning/courses/:courseId/topics/:topicId/practice" element={<TopicPracticePage/>}/>
                    <Route 
                        path="/teacher/courses" 
                        element={<TeacherCoursesPage user={user}/>}
                    />
                    <Route 
                        path="/teacher/courses/new" 
                        element={<TeacherCourseEditPage user={user}/>}
                    />
                    <Route 
                        path="/teacher/courses/:id/edit" 
                        element={<TeacherCourseEditPage user={user}/>}
                    />
                </Route>

                <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </NavigationLockProvider>
                </LanguageProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
