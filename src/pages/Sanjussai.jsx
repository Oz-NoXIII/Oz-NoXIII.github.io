import React, { useEffect, useRef } from "react";

function Sanjussai() {
    const containerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const prevTextRef = useRef(null);
    const attachIntervalRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

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

            // short percussive tick (sine oscillator + gain envelope)
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            o.frequency.value = 880;
            o.connect(g);
            g.connect(ctx.destination);

            const now = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(0.12, now + 0.004);
            g.gain.linearRampToValueAtTime(0.0001, now + 0.08);

            o.start(now);
            o.stop(now + 0.09);
        }

        // resume audio context on first user gesture (required by many browsers)
        const resumeOnGesture = () => {
            const ctx = ensureAudioContext();
            if (ctx && ctx.state === "suspended") ctx.resume();
            window.removeEventListener("pointerdown", resumeOnGesture);
            window.removeEventListener("keydown", resumeOnGesture);
            window.removeEventListener("touchstart", resumeOnGesture);
        };
        window.addEventListener("pointerdown", resumeOnGesture);
        window.addEventListener("keydown", resumeOnGesture);
        window.addEventListener("touchstart", resumeOnGesture);

        // message listener: TickCounter may post messages from its iframe; play tick on those messages
        const onMessage = (ev) => {
            try {
                if (!ev || !ev.origin) return;
                if (ev.origin.includes("tickcounter.com")) {
                    playTick();
                    return;
                }
                // sometimes the widget posts a structured message from other origins with identifying data
                const d = ev.data;
                if (d && typeof d === "object") {
                    // play on heuristics if it looks like a tickcounter message
                    if (d.widget === "tickcounter" || d.type === "tick" || d.tick) playTick();
                }
            } catch (e) {
                // ignore
            }
        };
        window.addEventListener('message', onMessage, false);

        // create the countdown anchor
        const a = document.createElement("a");
        a.setAttribute("data-type", "countdown");
        a.setAttribute("data-id", "10848915");
        a.className = "tickcounter";
        a.style.cssText = "display:block; left:0; width:100%; height:0; position:relative; padding-bottom:25%; margin:0 auto;";
        a.title = "Nova aetas adventat";
        a.href = "//www.tickcounter.com/";
        container.appendChild(a);

        // load the tickcounter loader script if not present
        if (!document.getElementById("tickcounter-sdk")) {
            const js = document.createElement("script");
            js.id = "tickcounter-sdk";
            js.src = "//www.tickcounter.com/static/js/loader.js";
            js.async = true;
            document.body.appendChild(js);
        }

        // attach a MutationObserver to the widget once it's rendered; if it isn't ready yet, poll briefly
        function tryAttachObserver() {
            const el = container.querySelector(".tickcounter");
            if (!el) return;

            // observe subtree text/child changes and trigger tick when displayed text changes
            const observer = new MutationObserver(() => {
                try {
                    const text = (el.innerText || el.textContent || "").trim();
                    if (!text) return;
                    if (prevTextRef.current == null) {
                        prevTextRef.current = text; // initialize without sound on first render
                        return;
                    }
                    if (text !== prevTextRef.current) {
                        prevTextRef.current = text;
                        playTick();
                    }
                } catch (e) {
                    // ignore
                }
            });

            observer.observe(el, { childList: true, subtree: true, characterData: true });
            observerRef.current = observer;

            if (attachIntervalRef.current) {
                clearInterval(attachIntervalRef.current);
                attachIntervalRef.current = null;
            }
        }

        attachIntervalRef.current = setInterval(tryAttachObserver, 250);
        // try immediately once too
        tryAttachObserver();

        return () => {
            if (attachIntervalRef.current) clearInterval(attachIntervalRef.current);
            if (observerRef.current) observerRef.current.disconnect();
            window.removeEventListener("pointerdown", resumeOnGesture);
            window.removeEventListener("keydown", resumeOnGesture);
            window.removeEventListener("touchstart", resumeOnGesture);
            if (container.contains(a)) container.removeChild(a);
        };
    }, []);

    return (
        <section className="container section page-section sanjussai-page">
            <p className="eyebrow">sanjussai</p>
            <h1 className="page-title">Nova aetas adventat</h1>
            <div ref={containerRef} tabIndex={0}></div>
        </section>
    );
}

export default Sanjussai;
