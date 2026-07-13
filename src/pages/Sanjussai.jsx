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

    // create a deterministic click buffer that mimics the referenced ticking sound (layered thump + click + filtered noise)
    function createClickBuffer(ctx) {
        const sampleRate = ctx.sampleRate || 48000;
        const duration = 0.08; // seconds total
        const length = Math.floor(duration * sampleRate);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // deterministic LCG for repeatable 'noise'
        let seed = 424242;
        function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

        const fHigh = 2200; // high click component

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // envelope for click (fast decay)
            const envHigh = Math.exp(-t * 120);

            // high click: deterministic filtered noise + resonant sine
            const noise = (rand() * 2 - 1) * Math.exp(-t * 200) * 0.7;
            const res = Math.sin(2 * Math.PI * fHigh * t) * envHigh * 0.6;

            // combine and scale down (no low thump)
            let sample = noise * 0.28 + res * 0.6;
            // soft clip
            if (sample > 1) sample = 1;
            if (sample < -1) sample = -1;
            data[i] = sample * 0.55;
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
                    g.gain.value = 0.6;
                    src.connect(g);
                    g.connect(ctx.destination);
                    src.start();
                } else {
                    // fallback: layered oscillators
                    const now = ctx.currentTime;
                    const highOsc = ctx.createOscillator();
                    const highGain = ctx.createGain();
                    highOsc.type = "sine";
                    highOsc.frequency.value = 2200;
                    highOsc.connect(highGain);
                    highGain.connect(ctx.destination);

                    const lowOsc = ctx.createOscillator();
                    const lowGain = ctx.createGain();
                    lowOsc.type = "sine";
                    lowOsc.frequency.value = 80;
                    lowOsc.connect(lowGain);
                    lowGain.connect(ctx.destination);

                    highGain.gain.setValueAtTime(0.0001, now);
                    highGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
                    highGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

                    lowGain.gain.setValueAtTime(0.0001, now);
                    lowGain.gain.linearRampToValueAtTime(0.18, now + 0.008);
                    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

                    highOsc.start(now);
                    highOsc.stop(now + 0.05);
                    lowOsc.start(now);
                    lowOsc.stop(now + 0.06);
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

        // auto-enable sound on first gesture anywhere; create deterministic buffer once
        const onFirstGesture = () => {
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
        <main style={{backgroundColor: "#000", color: "#00ff41", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Consolas, 'Roboto Mono', 'Fira Code', 'Courier New', monospace, ui-monospace, SFMono-Regular", padding: "2rem"}}>
            <div style={{textAlign: "center"}}>
                <h1 style={{margin: 0, fontSize: "4.5rem", opacity: 0.98, letterSpacing: "0.04em", fontWeight: 900, textShadow: "0 3px 10px rgba(0,255,65,0.08), 0 1px 0 #000"}}>NOVA AETAS ADVENTAT</h1>

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
