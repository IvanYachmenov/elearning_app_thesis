import './profile.css';

function ProfilePage({user}) {
    const getInitials = (username) =>
        username ? username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="page page-enter">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {getInitials(user.username)}
                    </div>
                    <div className="profile-info">
                        <h2>{user.username}</h2>
                        <p>{user.email || 'No email provided'}</p>
                    </div>
                </div>

                <h3 style={{marginBottom: '12px', fontSize: '20px'}}>
                    Account Information
                </h3>
                <p
                    style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '20px',
                    }}
                >
                    Profile editing will be available in a future update.
                </p>

                <div className="profile-data">
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
