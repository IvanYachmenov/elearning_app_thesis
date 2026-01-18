function ProfileInfo({
    isEditing,
    setIsEditing,
    isSaving,
    handleSave,
    handleCancel,
    error,
    success,
    formData,
    handleInputChange,
}) {
    return (
        <div className="profile-section">
            <div className="profile-section-header">
                <h3>Account Information</h3>
                {!isEditing ? (
                    <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
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

            {error && <div className="profile-error">{error}</div>}

            {success && <div className="profile-success">{success}</div>}

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
                        className={
                            isEditing ? 'profile-input' : 'profile-input profile-input--disabled'
                        }
                        placeholder="Enter username"
                        required
                    />
                    {!isEditing && (
                        <p className="profile-field-hint">
                            Click &quot;Edit Profile&quot; above to change username
                        </p>
                    )}
                    {isEditing && (
                        <p className="profile-field-hint">
                            Username must be unique. If it&apos;s already taken, you&apos;ll see an
                            error message.
                        </p>
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
    );
}

export default ProfileInfo;

