import {useState, useEffect, useRef} from 'react';
import {api, API_URL} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/profile.css';
import {gradients, GRADIENTS_PER_PAGE} from './profileBackgrounds';
import ProfileInfo from './components/ProfileInfo';
import ProfileCustomization from './components/ProfileCustomization';

function ProfilePage({user, onUserUpdate}) {
    const {t} = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false); // For avatar/background editing
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        username: user?.username || '',
    });
    
    const [avatar, setAvatar] = useState(null); // File object for upload
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null); // URL or data URL for display
    const [selectedGradient, setSelectedGradient] = useState(user?.profile_background_gradient || null);
    const [gradientPage, setGradientPage] = useState(0);
    const avatarInputRef = useRef(null);

    const totalGradientPages = Math.ceil((gradients.length + 1) / GRADIENTS_PER_PAGE); // +1 for "None" option

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                username: user.username || '',
            });
            // If user has avatar URL, use it; otherwise reset
            const avatarUrl = user.avatar_url || user.avatar;
            if (avatarUrl) {
                const finalAvatarUrl = avatarUrl.startsWith('http') 
                    ? avatarUrl 
                    : `${API_URL}${avatarUrl}`;
                setAvatarPreview(finalAvatarUrl);
            } else {
                setAvatarPreview(null);
            }
            // Set profile background gradient
            setSelectedGradient(user.profile_background_gradient || null);
            setAvatar(null);
        }
    }, [user]);

    const getInitials = () => {
        if (avatarPreview) return null;
        const firstName = formData.first_name || user?.username || '';
        const lastName = formData.last_name || '';
        if (firstName && lastName) {
            return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        }
        return (user?.username || 'U').charAt(0).toUpperCase();
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarClick = () => {
        if (isEditingProfile) {
            avatarInputRef.current?.click();
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError(t('pages.profile.avatarSizeError'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(t('pages.profile.avatarFileTypeError'));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setAvatar(file);
            setError(null);
        };
        reader.onerror = () => {
            setError(t('pages.profile.avatarReadError'));
        };
        reader.readAsDataURL(file);
    };


    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const formDataToSend = new FormData();
            
            // Add only text fields if changed
            if (formData.username !== (user?.username || '')) {
                formDataToSend.append('username', formData.username);
            }
            
            if (formData.first_name !== (user?.first_name || '')) {
                formDataToSend.append('first_name', formData.first_name);
            }
            
            if (formData.last_name !== (user?.last_name || '')) {
                formDataToSend.append('last_name', formData.last_name);
            }

            const response = await api.patch('/api/auth/me/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onUserUpdate) {
                onUserUpdate(response.data);
            }

            setSuccess(t('pages.profile.profileInfoUpdated'));
            setIsEditing(false);
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            // Handle username validation error specifically
            const errorData = err.response?.data;
            if (errorData?.username && Array.isArray(errorData.username)) {
                setError(errorData.username[0] || t('pages.profile.usernameTaken'));
            } else if (errorData?.username) {
                setError(errorData.username);
            } else {
                setError(errorData?.detail || errorData?.message || errorData || t('pages.profile.failedToUpdate'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setError(null);
        setSuccess(null);

        try {
            const formDataToSend = new FormData();
            
            // Add avatar if changed
            if (avatar && avatar instanceof File) {
                formDataToSend.append('avatar', avatar);
            }
            
            // Add profile background gradient if changed
            if (selectedGradient !== (user?.profile_background_gradient || null)) {
                formDataToSend.append('profile_background_gradient', selectedGradient || '');
            }

            const response = await api.patch('/api/auth/me/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onUserUpdate) {
                // Ensure profile_background_gradient is a string, not an object
                const userData = { ...response.data };
                if (userData.profile_background_gradient && typeof userData.profile_background_gradient !== 'string') {
                    userData.profile_background_gradient = String(userData.profile_background_gradient);
                }
                onUserUpdate(userData);
            }

            setSuccess(t('pages.profile.profileAppearanceUpdated'));
            setIsEditingProfile(false);
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            const errorData = err.response?.data;
            let errorMessage = t('pages.profile.failedToUpdate');
            
            if (errorData?.profile_background_gradient) {
                errorMessage = Array.isArray(errorData.profile_background_gradient) 
                    ? errorData.profile_background_gradient[0]
                    : String(errorData.profile_background_gradient);
            } else if (errorData?.detail) {
                errorMessage = String(errorData.detail);
            } else if (errorData?.message) {
                errorMessage = String(errorData.message);
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
            
            setError(errorMessage);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            username: user?.username || '',
        });
        setError(null);
        setSuccess(null);
        setIsEditing(false);
    };

    const handleCancelProfile = () => {
        // Reset avatar preview to original user avatar
        const avatarUrl = user?.avatar_url || user?.avatar;
        if (avatarUrl) {
            const finalAvatarUrl = avatarUrl.startsWith('http') 
                ? avatarUrl 
                : `${API_URL}${avatarUrl}`;
            setAvatarPreview(finalAvatarUrl);
        } else {
            setAvatarPreview(null);
        }
        // Reset background gradient to original
        setSelectedGradient(user?.profile_background_gradient || null);
        setAvatar(null);
        setError(null);
        setSuccess(null);
        setIsEditingProfile(false);
        setGradientPage(0);
    };

    const getVisibleGradients = () => {
        const allOptions = [
            ...gradients.map(g => ({ type: 'gradient', ...g })),
            { type: 'none', name: t('pages.profile.none'), value: null }
        ];
        const start = gradientPage * GRADIENTS_PER_PAGE;
        const end = start + GRADIENTS_PER_PAGE;
        
        // If we're at the end and need to wrap, show items from start
        if (start >= allOptions.length) {
            const wrappedStart = 0;
            const wrappedEnd = GRADIENTS_PER_PAGE;
            return allOptions.slice(wrappedStart, wrappedEnd);
        }
        
        // If end exceeds array length, wrap around
        if (end > allOptions.length) {
            const overflow = end - allOptions.length;
            return [...allOptions.slice(start), ...allOptions.slice(0, overflow)];
        }
        
        return allOptions.slice(start, end);
    };

    const handleGradientPrev = () => {
        const allOptions = [...gradients, { name: t('pages.profile.none'), value: null }];
        const totalOptions = allOptions.length;
        const maxPage = Math.ceil(totalOptions / GRADIENTS_PER_PAGE);
        
        if (gradientPage <= 0) {
            // Go to last page (wrap around)
            setGradientPage(maxPage - 1);
        } else {
            setGradientPage(prev => prev - 1);
        }
    };

    const handleGradientNext = () => {
        const allOptions = [...gradients, { name: t('pages.profile.none'), value: null }];
        const totalOptions = allOptions.length;
        const maxPage = Math.ceil(totalOptions / GRADIENTS_PER_PAGE);
        
        if (gradientPage >= maxPage - 1) {
            // Go to first page (wrap around)
            setGradientPage(0);
        } else {
            setGradientPage(prev => prev + 1);
        }
    };

    return (
        <div className="page page-enter">
            <div className="profile-container">
                <ProfileCustomization
                    selectedGradient={selectedGradient}
                    isEditingProfile={isEditingProfile}
                    setIsEditingProfile={setIsEditingProfile}
                    avatarPreview={avatarPreview}
                    getInitials={getInitials}
                    handleAvatarClick={handleAvatarClick}
                    avatarInputRef={avatarInputRef}
                    handleAvatarChange={handleAvatarChange}
                    formData={formData}
                    user={user}
                    handleSaveProfile={handleSaveProfile}
                    isSavingProfile={isSavingProfile}
                    handleCancelProfile={handleCancelProfile}
                    visibleGradients={getVisibleGradients()}
                    gradientPage={gradientPage}
                    setSelectedGradient={setSelectedGradient}
                    handleGradientPrev={handleGradientPrev}
                    handleGradientNext={handleGradientNext}
                />

                <ProfileInfo
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isSaving={isSaving}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    error={error}
                    success={success}
                    formData={formData}
                    handleInputChange={handleInputChange}
                />
            </div>
        </div>
    );
}

export default ProfilePage;
