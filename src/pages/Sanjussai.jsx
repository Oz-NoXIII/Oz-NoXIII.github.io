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

    // create a deterministic click buffer that sounds like a mechanical, cinematic ticking clock
    function createClickBuffer(ctx) {
        const sampleRate = ctx.sampleRate || 48000;
        const duration = 0.06; // seconds total
        const length = Math.floor(duration * sampleRate);
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // deterministic LCG for repeatable 'noise'
        let seed = 777777;
        function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

        const fRes = 2800; // resonant click frequency
        const fMetal = 5200; // metallic overtone

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // envelopes
            const envClick = Math.exp(-t * 140); // very fast for click
            const envMetal = Math.exp(-t * 90);  // slightly longer metallic ring
            const envNoise = Math.exp(-t * 180);

            // resonant click (sine)
            const click = Math.sin(2 * Math.PI * fRes * t) * envClick * 0.55;

            // metallic overtone (higher partial)
            const metal = Math.sin(2 * Math.PI * fMetal * t) * envMetal * 0.18;

            // short, filtered-like noise burst to emulate mechanical release
            const noise = (rand() * 2 - 1) * envNoise * 0.35;

            // combine with slight DC removal and scale
            let sample = (click + metal + noise) * 0.7;
            // soft clip
            if (sample > 1) sample = 1;
            if (sample < -1) sample = -1;
            data[i] = sample * 0.5;
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
                    highOsc.frequency.value = 2600;
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
        background: "rgba(0,50,0,0.08)",
        border: "1px solid rgba(0,255,65,0.14)",
        padding: "0.6rem",
        minWidth: "8rem",
                flex: "1 1 14rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 800,
            fontSize: "clamp(3rem, 12vw, 8rem)",
        borderRadius: "8px",
        color: "#00ff41",
        boxShadow: "none",
    };

    return (
        <main style={{backgroundColor: "#000", color: "#00ff41", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Consolas, 'Roboto Mono', 'Fira Code', 'Courier New', monospace, ui-monospace, SFMono-Regular", padding: "1rem"}}>
                    <div style={{textAlign: "center", width: "100%"}}>
                <h1 style={{margin: 0, fontSize: "clamp(2.5rem, 6vw, 6.5rem)", opacity: 0.98, letterSpacing: "0.04em", fontWeight: 900, textShadow: "0 3px 10px rgba(0,255,65,0.08), 0 1px 0 #000"}}>NOVA AETAS ADVENTAT</h1>

                        <div aria-live="polite" style={{display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center", margin: "1.5rem 0", width: "100%", flexWrap: "wrap"}}>
                    <div style={boxStyle} aria-label={`${parts.days} days`}>{parts.days}</div>
                    <div style={boxStyle} aria-label={`${parts.hours} hours`}>{parts.hours}</div>
                    <div style={boxStyle} aria-label={`${parts.minutes} minutes`}>{parts.minutes}</div>
                    <div style={boxStyle} aria-label={`${parts.seconds} seconds`}>{parts.seconds}</div>
                </div>

                {!soundEnabled && <p style={{marginTop: "1rem", opacity: 0.9}}>Click or press any key to enable sound</p>}
            </div>
        </main>
    );
}

export default Sanjussai;
