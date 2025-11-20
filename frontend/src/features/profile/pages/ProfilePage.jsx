function ProfilePage({ user }) {
    return (
      <div>
          <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Profile</h1>
          <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
            Here you will later be able to edit your personal data.
          </p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    );
}

export default ProfilePage;