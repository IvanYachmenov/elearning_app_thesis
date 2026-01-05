import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const NavigationLockContext = createContext({
    isLocked: false,
    lockReason: '',
    allowedPaths: [],
    lockNavigation: () => {},
    unlockNavigation: () => {},
});

export function NavigationLockProvider({children}) {
    const [lockState, setLockState] = useState({
        isLocked: false,
        reason: '',
        allowedPaths: [],
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!lockState.isLocked || lockState.allowedPaths.length === 0) {
            return;
        }

        if (!lockState.allowedPaths.includes(location.pathname)) {
            navigate(lockState.allowedPaths[0], {replace: true});
        }
    }, [lockState, location.pathname, navigate]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!lockState.isLocked) return;

            event.preventDefault();
            event.returnValue = lockState.reason || 'Navigation is locked during the current activity.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [lockState]);

    const lockNavigation = (reason, allowedPaths) => {
        setLockState({
            isLocked: true,
            reason: reason || 'Navigation is locked during the current activity.',
            allowedPaths: allowedPaths && allowedPaths.length ? allowedPaths : [location.pathname],
        });
    };

    const unlockNavigation = () => {
        setLockState({isLocked: false, reason: '', allowedPaths: []});
    };

    const value = useMemo(
        () => ({
            isLocked: lockState.isLocked,
            lockReason: lockState.reason,
            allowedPaths: lockState.allowedPaths,
            lockNavigation,
            unlockNavigation,
        }),
        [lockState],
    );

    return (
        <NavigationLockContext.Provider value={value}>
            {children}
        </NavigationLockContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigationLock = () => useContext(NavigationLockContext);