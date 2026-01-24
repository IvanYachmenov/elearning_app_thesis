import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';

function CreditsPage() {
    const {t} = useLanguage();

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.credits.title')}</h1>
            <p className="page__subtitle">
                {t('pages.credits.subtitle')}
            </p>

            <section style={{marginBottom: '32px'}}>
                <h2 style={{fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-primary)'}}>
                    {t('pages.credits.icons')}
                </h2>
                <p style={{marginBottom: '12px', color: 'var(--text-secondary)'}}>
                    {t('pages.credits.iconsDescription')}
                </p>
                <ul style={{fontSize: '14px', lineHeight: 1.8, listStyle: 'none', padding: 0, margin: 0}}>
                    <li style={{marginBottom: '8px'}}>
                        <a
                            href="https://www.flaticon.com/free-icons/study"
                            title="study icons"
                            target="_blank"
                            rel="noreferrer"
                            style={{color: 'var(--text-primary)', textDecoration: 'underline'}}
                        >
                            Study icons created by Freepik - Flaticon
                        </a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <a
                            href="https://www.flaticon.com/free-icons/github"
                            title="github icons"
                            target="_blank"
                            rel="noreferrer"
                            style={{color: 'var(--text-primary)', textDecoration: 'underline'}}
                        >
                            Github icons created by Pixel perfect - Flaticon
                        </a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <a
                            href="https://www.flaticon.com/free-icons/google"
                            title="google icons"
                            target="_blank"
                            rel="noreferrer"
                            style={{color: 'var(--text-primary)', textDecoration: 'underline'}}
                        >
                            Google icons created by Freepik - Flaticon
                        </a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <a
                            href="https://www.flaticon.com/free-icons/quit"
                            title="quit icons"
                            target="_blank"
                            rel="noreferrer"
                            style={{color: 'var(--text-primary)', textDecoration: 'underline'}}
                        >
                            Quit icons created by Pixel perfect - Flaticon
                        </a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <a
                            href="https://www.flaticon.com/free-icons/correct"
                            title="correct icons"
                            target="_blank"
                            rel="noreferrer"
                            style={{color: 'var(--text-primary)', textDecoration: 'underline'}}
                        >
                            Correct icons created by Aldo Cervantes - Flaticon
                        </a>
                    </li>
                </ul>
            </section>

            <section style={{marginBottom: '32px'}}>
                <h2 style={{fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-primary)'}}>
                    {t('pages.credits.frontendLibraries')}
                </h2>
                <ul style={{fontSize: '14px', lineHeight: 1.8, listStyle: 'none', padding: 0, margin: 0}}>
                    <li style={{marginBottom: '8px'}}>
                        <strong>React</strong> - <a href="https://react.dev/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://react.dev/</a> (MIT License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>React Router</strong> - <a href="https://reactrouter.com/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://reactrouter.com/</a> (MIT License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Vite</strong> - <a href="https://vitejs.dev/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://vitejs.dev/</a> (MIT License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Axios</strong> - <a href="https://axios-http.com/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://axios-http.com/</a> (MIT License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Redux Toolkit</strong> - <a href="https://redux-toolkit.js.org/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://redux-toolkit.js.org/</a> (MIT License)
                    </li>
                </ul>
            </section>

            <section style={{marginBottom: '32px'}}>
                <h2 style={{fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-primary)'}}>
                    {t('pages.credits.backendLibraries')}
                </h2>
                <ul style={{fontSize: '14px', lineHeight: 1.8, listStyle: 'none', padding: 0, margin: 0}}>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Django</strong> - <a href="https://www.djangoproject.com/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://www.djangoproject.com/</a> (BSD License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Django REST Framework</strong> - <a href="https://www.django-rest-framework.org/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://www.django-rest-framework.org/</a> (BSD License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>djangorestframework-simplejwt</strong> - <a href="https://github.com/jazzband/djangorestframework-simplejwt" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>JWT Authentication for Django REST Framework</a> (MIT License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>Pillow</strong> - <a href="https://pillow.readthedocs.io/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://pillow.readthedocs.io/</a> (HPND License)
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        <strong>PostgreSQL</strong> - <a href="https://www.postgresql.org/" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)', textDecoration: 'underline'}}>https://www.postgresql.org/</a> (PostgreSQL License)
                    </li>
                </ul>
            </section>

            <section>
                <h2 style={{fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-primary)'}}>
                    {t('pages.credits.designInspiration')}
                </h2>
                <p style={{fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)'}}>
                    {t('pages.credits.designDescription')}
                </p>
            </section>

            <section style={{marginTop: '32px', paddingTop: '24px', borderTop: '2px solid var(--border-color)'}}>
                <p style={{fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', fontStyle: 'italic'}}>
                    {t('pages.credits.footerNote')}
                </p>
            </section>
        </div>
    );
}

export default CreditsPage;
