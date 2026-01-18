function ShopPage() {
    return (
        <div className="page page-enter">
            <div
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-light)',
                    textAlign: 'center',
                }}
            >
                <h1 className="page__title">Shop</h1>
                <p className="page__subtitle">
                    Coming soon.
                </p>
            </div>
        </div>
    );
}

export default ShopPage;