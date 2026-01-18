import {useState, useEffect, useRef} from 'react';
import {api, API_URL} from '../../../shared/api';
import '../styles/profile.css';

function ProfilePage({user, onUserUpdate}) {
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
    
    const gradients = [
        // Basic gradients
        { name: 'Purple Blue', value: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
        { name: 'Orange Red', value: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
        { name: 'Green Emerald', value: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
        { name: 'Pink Rose', value: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
        { name: 'Blue Cyan', value: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
        { name: 'Yellow Amber', value: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
        { name: 'Indigo Purple', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
        { name: 'Teal Cyan', value: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' },
        { name: 'Red Pink', value: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)' },
        { name: 'Multi Color', value: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #f97316 70%, #fb923c 100%)' },
        
        // Patterns with dots (using background-size to create pattern effect)
        { name: 'Dotted Purple', value: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px), linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
        { name: 'Dotted Orange', value: 'radial-gradient(circle, #fb923c 1.5px, transparent 1.5px), linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
        { name: 'Dotted Green', value: 'radial-gradient(circle, #34d399 1px, transparent 1px), linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
        
        // Geometric patterns
        { name: 'Diagonal Stripes', value: 'repeating-linear-gradient(45deg, #6366f1 0px, #6366f1 10px, #8b5cf6 10px, #8b5cf6 20px)' },
        { name: 'Chevron Pattern', value: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 8px, #fb923c 8px, #fb923c 16px)' },
        { name: 'Zigzag Pattern', value: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 12px, #34d399 12px, #34d399 24px)' },
        
        // Radial patterns
        { name: 'Radial Burst', value: 'radial-gradient(circle at center, #ec4899 0%, #f472b6 50%, #ec4899 100%)' },
        { name: 'Radial Sunset', value: 'radial-gradient(circle at 30% 70%, #f59e0b 0%, #fbbf24 50%, #fb923c 100%)' },
        { name: 'Radial Ocean', value: 'radial-gradient(circle at top right, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)' },
        
    
        // Special effects
        { name: 'Wave Pattern', value: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(99, 102, 241, 0.15) 2px, rgba(99, 102, 241, 0.15) 4px), linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
    ];
    
    const GRADIENTS_PER_PAGE = 6;
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
        if (isEditing) {
            avatarInputRef.current?.click();
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Avatar image must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setAvatar(file);
            setError(null);
        };
        reader.onerror = () => {
            setError('Failed to read image file');
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

            setSuccess('Profile information updated successfully!');
            setIsEditing(false);
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            // Handle username validation error specifically
            const errorData = err.response?.data;
            if (errorData?.username && Array.isArray(errorData.username)) {
                setError(errorData.username[0] || 'This username is already taken. Please choose another one.');
            } else if (errorData?.username) {
                setError(errorData.username);
            } else {
                setError(errorData?.detail || errorData?.message || errorData || 'Failed to update profile. Please try again.');
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

            setSuccess('Profile appearance updated successfully!');
            setIsEditingProfile(false);
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to update profile. Please try again.';
            
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
            { type: 'none', name: 'None', value: null }
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
        const allOptions = [...gradients, { name: 'None', value: null }];
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
        const allOptions = [...gradients, { name: 'None', value: null }];
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
                <div 
                    className="profile-header"
                    style={{
                        background: selectedGradient || undefined,
                        position: 'relative',
                    }}
                >
                    <div className="profile-header-content">
                        <div className="profile-header-main">
                            <div 
                                className={`profile-avatar-large ${isEditingProfile ? 'editable' : ''}`}
                                onClick={handleAvatarClick}
                                style={{cursor: isEditingProfile ? 'pointer' : 'default'}}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
                                ) : (
                                    <span>{getInitials()}</span>
                                )}
                                {isEditingProfile && (
                                    <div className="profile-avatar-overlay">
                                        <span>Change</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{display: 'none'}}
                            />
                            <div className="profile-info">
                                <h2>{formData.username || user?.username || 'User'}</h2>
                                <p>{formData.email || user?.email || 'No email provided'}</p>
                            </div>
                        </div>
                        {!isEditingProfile && (
                            <button
                                className="profile-edit-appearance-btn"
                                onClick={() => setIsEditingProfile(true)}
                                title="Edit profile appearance"
                            >
                                ✏️
                            </button>
                        )}
                        {isEditingProfile && (
                            <div className="profile-appearance-actions">
                                <button
                                    className="profile-save-appearance-btn"
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="profile-cancel-appearance-btn"
                                    onClick={handleCancelProfile}
                                    disabled={isSavingProfile}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    {isEditingProfile && (
                        <div className="profile-gradient-selector">
                            <label className="profile-gradient-label">Choose Background Gradient:</label>
                            <div className="profile-gradients-container">
                                <button
                                    className="profile-gradient-nav profile-gradient-nav--prev"
                                    onClick={handleGradientPrev}
                                    aria-label="Previous page"
                                >
                                    ←
                                </button>
                                <div className="profile-gradients-grid">
                                    {getVisibleGradients().map((option, index) => (
                                        <div
                                            key={`${option.type}-${gradientPage}-${index}`}
                                            className={`profile-gradient-option ${selectedGradient === option.value ? 'selected' : ''}`}
                                            onClick={() => setSelectedGradient(option.value)}
                                            style={{ 
                                                background: option.value || '#fff',
                                                backgroundSize: option.value?.includes('radial-gradient') && option.value?.includes('linear-gradient') ? '20px 20px, 100% 100%' : '100% 100%',
                                                border: option.value ? '2px solid var(--nav-black)' : '2px solid var(--nav-black)'
                                            }}
                                            title={option.name}
                                        >
                                            {selectedGradient === option.value && (
                                                <span className="profile-gradient-check">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="profile-gradient-nav profile-gradient-nav--next"
                                    onClick={handleGradientNext}
                                    aria-label="Next page"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <div className="profile-section-header">
                        <h3>Account Information</h3>
                        {!isEditing ? (
                            <button 
                                className="profile-edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="profile-action-buttons">
                                <button 
                                    className="profile-save-btn"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    className="profile-cancel-btn"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="profile-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="profile-success">
                            {success}
                        </div>
                    )}

                    <div className="profile-form">
                        <div className="profile-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={isEditing ? "profile-input" : "profile-input profile-input--disabled"}
                                placeholder="Enter username"
                                required
                            />
                            {!isEditing && (
                                <p className="profile-field-hint">Click "Edit Profile" above to change username</p>
                            )}
                            {isEditing && (
                                <p className="profile-field-hint">Username must be unique. If it's already taken, you'll see an error message.</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="profile-input profile-input--disabled"
                            />
                            <p className="profile-field-hint">Email cannot be changed</p>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`profile-input ${!isEditing ? 'profile-input--disabled' : ''}`}
                                placeholder="Enter your first name"
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`profile-input ${!isEditing ? 'profile-input--disabled' : ''}`}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
