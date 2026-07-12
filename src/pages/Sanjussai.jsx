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

        // sharper, punchier tick: short sawtooth + quick gain envelope
        function playTick() {
            const ctx = audioCtxRef.current || ensureAudioContext();
            if (!ctx) return;
            if (ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }

            if (!soundEnabled) return;

            try {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "square"; // punchier than sine
                osc.frequency.value = 1400;
                osc.connect(gain);
                gain.connect(ctx.destination);

                // very short click envelope
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.35, now + 0.003);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

                osc.start(now);
                osc.stop(now + 0.07);
            } catch (e) {
                // ignore audio errors
            }
        }

        function updateRemaining() {
            const secs = Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000));
            setRemaining(secs);
        }

        // align to the next exact second
        const msToNext = 1000 - (Date.now() % 1000) + 5;
        timeoutRef.current = setTimeout(() => {
            updateRemaining();
            if (remaining > 0) playTick();
            intervalRef.current = setInterval(() => {
                updateRemaining();
                playTick();
            }, 1000);
        }, msToNext);

        const onVisibility = () => updateRemaining();
        document.addEventListener("visibilitychange", onVisibility);

        // auto-enable sound on first user gesture anywhere
        const onFirstGesture = () => {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!audioCtxRef.current && Ctx) audioCtxRef.current = new Ctx();
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
            setSoundEnabled(true);
            window.removeEventListener("pointerdown", onFirstGesture);
            window.removeEventListener("touchstart", onFirstGesture);
            window.removeEventListener("keydown", onFirstGesture);
        };
        window.addEventListener("pointerdown", onFirstGesture);
        window.addEventListener("touchstart", onFirstGesture);
        window.addEventListener("keydown", onFirstGesture);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("pointerdown", onFirstGesture);
            window.removeEventListener("touchstart", onFirstGesture);
            window.removeEventListener("keydown", onFirstGesture);
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

    return (
        <main style={{backgroundColor: "#000", color: "#00ff41", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace, ui-monospace, SFMono-Regular", padding: "2rem"}}>
            <div style={{textAlign: "center"}}>
                <h1 style={{margin: 0, fontSize: "1.25rem", opacity: 0.9}}>Nova aetas adventat</h1>
                <div aria-live="polite" style={{fontSize: "6rem", margin: "2rem 0", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", fontWeight: 700}}>
                    {formatRemaining(remaining)}
                </div>
                <p style={{opacity: 0.7, marginTop: "0.5rem"}}>Countdown to {new Date(TARGET_ISO).toLocaleString()}</p>
                {!soundEnabled && <p style={{marginTop: "1rem", opacity: 0.9}}>Click or press any key to enable sound</p>}
            </div>
        </main>
    );
}

export default Sanjussai;
