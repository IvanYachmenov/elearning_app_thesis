import {createContext, useContext, useEffect, useMemo, useState, useCallback, useRef} from 'react';

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

    // Track if we're in the process of unlocking to prevent race conditions
    const isUnlocking = useRef(false);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!lockState.isLocked) return;

            event.preventDefault();
            event.returnValue = lockState.reason || 'Navigation is locked during the current activity.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [lockState.isLocked, lockState.reason]);

    const lockNavigation = useCallback((reason, allowedPaths) => {
        isUnlocking.current = false;
        setLockState({
            isLocked: true,
            reason: reason || 'Navigation is locked during the current activity.',
            allowedPaths: allowedPaths && allowedPaths.length ? allowedPaths : [],
        });
    }, []);

    const unlockNavigation = useCallback(() => {
        isUnlocking.current = true;
        setLockState({isLocked: false, reason: '', allowedPaths: []});

        // Clear the unlocking flag after state updates
        setTimeout(() => {
            isUnlocking.current = false;
        }, 0);
    }, []);

    const value = useMemo(
        () => ({
            isLocked: lockState.isLocked,
            lockReason: lockState.reason,
            allowedPaths: lockState.allowedPaths,
            lockNavigation,
            unlockNavigation,
        }),
        [lockState, lockNavigation, unlockNavigation],
    );

    return (
        <NavigationLockContext.Provider value={value}>
            {children}
        </NavigationLockContext.Provider>
    );
}

export const useNavigationLock = () => useContext(NavigationLockContext);
