function formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--';
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
    const secs = String(safeSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

function PracticeTimer({remainingSeconds, timeLimitSeconds, isActive, timedOut}) {
    const limit = timeLimitSeconds || 0;
    const remaining = remainingSeconds ?? limit;
    const percent = limit > 0 ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;

    return (
        <div className="practice-timer" aria-live="polite">
            <div
                className="practice-timer__ring"
                style={{
                    background: `conic-gradient(var(--accent-blue) ${percent}%, #e5e7eb ${percent}% 100%)`,
                }}
            >
                <div className="practice-timer__inner">
                    <div className="practice-timer__label">Time left</div>
                    <div className="practice-timer__value">{formatTime(remaining)}</div>
                    <div className={`practice-timer__status${timedOut ? ' practice-timer__status--danger' : ''}`}>
                        {timedOut ? 'Time is up' : isActive ? 'Counting down' : 'Paused'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PracticeTimer;