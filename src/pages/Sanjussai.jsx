import React, { useEffect, useRef, useState } from "react";

function Sanjussai() {
    // Target: Jul 13 2027 00:00 CEST (UTC+2)
    const TARGET_ISO = "2027-07-13T00:00:00+02:00";
    const targetDate = useRef(new Date(TARGET_ISO));

    const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000)));
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioCtxRef = useRef(null);
    const audioBufferRef = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    // create a deterministic click buffer for identical tick sound each time    function createClickBuffer(ctx) {
        const sampleRate = ctx.sampleRate || 48000;
        const duration = 0.07; // seconds
        const length = Math.floor(duration * sampleRate);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const freq = 1400;
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // quick exponential-like decay envelope
            const env = Math.pow(1 - t / duration, 2);
            data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.9;
        }
        return buffer;
    }

    useEffect(() => {
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
            if (ctx.state === "suspended") ctx.resume().catch(() => {});
            if (!soundEnabled) return;

            try {
                if (audioBufferRef.current) {
                    const src = ctx.createBufferSource();
                    src.buffer = audioBufferRef.current;
                    const g = ctx.createGain();
                    g.gain.value = 1.0;
                    src.connect(g);
                    g.connect(ctx.destination);
                    src.start();
                } else {
                    // fallback deterministic short oscillator if buffer missing
                    const now = ctx.currentTime;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "square";
                    osc.frequency.value = 1400;
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    gain.gain.setValueAtTime(0.0001, now);
                    gain.gain.linearRampToValueAtTime(0.35, now + 0.003);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
                    osc.start(now);
                    osc.stop(now + 0.07);
                }
            } catch (e) {
                // ignore audio errors
            }
        }

        function updateRemaining() {
            const secs = Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000));
            setRemaining(secs);
        }

        // align to next exact second
        const msToNext = 1000 - (Date.now() % 1000) + 2;
        timeoutRef.current = setTimeout(() => {
            updateRemaining();
            const currSecs = Math.max(0, Math.floor((targetDate.current - Date.now()) / 1000));
            if (currSecs > 0) playTick();
            intervalRef.current = setInterval(() => {
                updateRemaining();
                playTick();
            }, 1000);
        }, msToNext);

        const onVisibility = () => updateRemaining();
        document.addEventListener("visibilitychange", onVisibility);

        // auto-enable sound on first gesture anywhere; create deterministic buffer once        const onFirstGesture = () => {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!audioCtxRef.current && Ctx) audioCtxRef.current = new Ctx();
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
            try {
                if (audioCtxRef.current && !audioBufferRef.current) {
                    audioBufferRef.current = createClickBuffer(audioCtxRef.current);
                }
            } catch (e) {}
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

    // Format as DDD HH MM SS (days always shown, zero-padded)
    function splitRemaining(secs) {
        const days = Math.floor(secs / 86400);
        const hours = Math.floor((secs % 86400) / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const seconds = secs % 60;
        const pad = (n, w = 2) => String(n).padStart(w, "0");
        return {
            days: String(days).padStart(3, "0"),
            hours: pad(hours),
            minutes: pad(minutes),
            seconds: pad(seconds),
        };
    }

    const parts = splitRemaining(remaining);

    const boxStyle = {
        background: "rgba(0,50,0,0.15)",
        border: "1px solid rgba(0,255,65,0.14)",
        padding: "0.6rem 1.1rem",
        minWidth: "5.2rem",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 700,
        fontSize: "3.6rem",
        borderRadius: "6px",
        color: "#00ff41",
        boxShadow: "0 2px 6px rgba(0,255,65,0.06) inset",
    };

    return (
        <main style={{backgroundColor: "#000", color: "#00ff41", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace, ui-monospace, SFMono-Regular", padding: "2rem"}}>
            <div style={{textAlign: "center"}}>
                <h1 style={{margin: 0, fontSize: "3rem", opacity: 0.95, letterSpacing: "0.04em"}}>Nova aetas adventat</h1>

                <div aria-live="polite" style={{display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", margin: "2rem 0"}}>
                    <div style={boxStyle} aria-label={`${parts.days} days`}>{parts.days}</div>
                    <div style={boxStyle} aria-label={`${parts.hours} hours`}>{parts.hours}</div>
                    <div style={boxStyle} aria-label={`${parts.minutes} minutes`}>{parts.minutes}</div>
                    <div style={boxStyle} aria-label={`${parts.seconds} seconds`}>{parts.seconds}</div>
                </div>

                <p style={{opacity: 0.7, marginTop: "0.5rem"}}>Countdown to {new Date(TARGET_ISO).toLocaleString()}</p>
                {!soundEnabled && <p style={{marginTop: "1rem", opacity: 0.9}}>Click or press any key to enable sound</p>}
            </div>
        </main>
    );
}

export default Sanjussai;
