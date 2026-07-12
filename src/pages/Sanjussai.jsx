import React, { useEffect, useRef, useState } from "react";

function Sanjussai() {
    // Target: Jul 13 2027 00:00 CEST (UTC+2)
    const TARGET_ISO = "2027-07-13T00:00:00+02:00";
    const targetDate = useRef(new Date(TARGET_ISO));

    const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000)));
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // create audio context lazily
        function ensureAudioContext() {
            if (!audioCtxRef.current) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (Ctx) audioCtxRef.current = new Ctx();
            }
            return audioCtxRef.current;
        }

        function playTick() {
            const ctx = audioCtxRef.current || ensureAudioContext();
            if (!ctx) return;
            if (ctx.state === "suspended") {
                // try resume if user recently interacted
                ctx.resume().catch(() => {});
            }

            // If sound disabled don't play
            if (!soundEnabled) return;

            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            // slightly decay frequency for subtle tick
            o.frequency.value = 1000;
            o.connect(g);
            g.connect(ctx.destination);

            const now = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(0.18, now + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

            o.start(now);
            o.stop(now + 0.1);
        }

        function updateRemaining() {
            const secs = Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000));
            setRemaining(secs);
        }

        // align first update to the next full second for precise ticking
        const msToNext = 1000 - (Date.now() % 1000) + 5; // small offset
        timeoutRef.current = setTimeout(() => {
            updateRemaining();
            // play tick immediately if not zero
            if (remaining > 0) playTick();
            intervalRef.current = setInterval(() => {
                updateRemaining();
                playTick();
            }, 1000);
        }, msToNext);

        // also update more frequently while page hidden/visible transitions may cause issues
        const onVisibility = () => updateRemaining();
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [soundEnabled]);

    // Format remaining seconds as D:HH:MM:SS (days shown if >0)
    function formatRemaining(secs) {
        const days = Math.floor(secs / 86400);
        const hours = Math.floor((secs % 86400) / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const seconds = secs % 60;
        const pad = (n) => String(n).padStart(2, "0");
        if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // user manually enable sound (gesture) — ensures context resume and immediate tick
    const enableSound = () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current && Ctx) audioCtxRef.current = new Ctx();
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
        setSoundEnabled(true);
        // play one test tick quickly
        setTimeout(() => {
            try { 
                const ctx = audioCtxRef.current;
                if (ctx && ctx.state !== "suspended") {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = "sine";
                    o.frequency.value = 1200;
                    o.connect(g);
                    g.connect(ctx.destination);
                    const now = ctx.currentTime;
                    g.gain.setValueAtTime(0.0001, now);
                    g.gain.linearRampToValueAtTime(0.15, now + 0.005);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
                    o.start(now);
                    o.stop(now + 0.07);
                }
            } catch (e) {}
        }, 50);
    };

    const muteToggle = () => setSoundEnabled((s) => !s);

    return (
        <main className="container section page-section sanjussai-page" style={{textAlign: "center"}}>
            <p className="eyebrow">sanjussai</p>
            <h1 className="page-title">Nova aetas adventat</h1>

            <div style={{fontSize: "3rem", margin: "2rem 0", fontVariantNumeric: "tabular-nums"}} aria-live="polite">
                {formatRemaining(remaining)}
            </div>

            <div style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
                {!soundEnabled ? (
                    <button onClick={enableSound} className="btn">Enable sound</button>
                ) : (
                    <button onClick={muteToggle} className="btn">{soundEnabled ? "Mute" : "Unmute"}</button>
                )}

                <a className="btn" href="/" style={{textDecoration: "none"}}>Home</a>
            </div>

            <p style={{marginTop: "1rem", opacity: 0.8}}>Countdown to {new Date(TARGET_ISO).toLocaleString()}</p>
        </main>
    );
}

export default Sanjussai;
