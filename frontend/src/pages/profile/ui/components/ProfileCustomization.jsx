function ProfileCustomization({
    selectedGradient,
    isEditingProfile,
    setIsEditingProfile,
    avatarPreview,
    getInitials,
    handleAvatarClick,
    avatarInputRef,
    handleAvatarChange,
    formData,
    user,
    handleSaveProfile,
    isSavingProfile,
    handleCancelProfile,
    visibleGradients,
    gradientPage,
    setSelectedGradient,
    handleGradientPrev,
    handleGradientNext,
}) {
    return (
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
                            {visibleGradients.map((option, index) => (
                                <div
                                    key={`${option.type}-${gradientPage}-${index}`}
                                    className={`profile-gradient-option ${
                                        selectedGradient === option.value ? 'selected' : ''
                                    }`}
                                    onClick={() => setSelectedGradient(option.value)}
                                    style={{
                                        background: option.value || '#fff',
                                        backgroundSize:
                                            option.value?.includes('radial-gradient') &&
                                            option.value?.includes('linear-gradient')
                                                ? '20px 20px, 100% 100%'
                                                : '100% 100%',
                                        border: option.value
                                            ? '2px solid var(--nav-black)'
                                            : '2px solid var(--nav-black)',
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
    );
}

export default ProfileCustomization;

