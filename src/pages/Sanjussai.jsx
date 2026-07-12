import React, { useEffect, useRef } from "react";

function Sanjussai() {
    const containerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const prevTextRef = useRef(null);
    const pollRef = useRef(null);

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
            const ctx = ensureAudioContext();
            if (!ctx) return;

            // small click using oscillator and short gain envelope
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "square";
            o.frequency.value = 1000;
            g.gain.value = 0.00001; // start very low to avoid pops on some browsers
            o.connect(g);
            g.connect(ctx.destination);

            const now = ctx.currentTime;
            g.gain.setValueAtTime(0.00001, now);
            g.gain.exponentialRampToValueAtTime(0.15, now + 0.001);
            g.gain.exponentialRampToValueAtTime(0.00001, now + 0.06);

            o.start(now);
            o.stop(now + 0.07);
        }

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

        // allow user interaction to resume audio context (browsers may require gesture)
        const resumeOnInteraction = () => {
            const ctx = ensureAudioContext();
            if (ctx && ctx.state === "suspended") ctx.resume();
        };
        container.addEventListener("click", resumeOnInteraction);
        container.addEventListener("keydown", resumeOnInteraction);

        // poll the rendered widget for changes in displayed text and play a tick when it changes
        const targetEl = () => container.querySelector(".tickcounter");

        pollRef.current = setInterval(() => {
            const el = targetEl();
            if (!el) return;
            const text = el.textContent && el.textContent.trim();
            if (!text) return;
            if (prevTextRef.current == null) {
                prevTextRef.current = text; // initialize without playing on first read
                return;
            }
            if (text !== prevTextRef.current) {
                // text changed -> likely a tick
                try {
                    playTick();
                } catch (e) {
                    // ignore audio errors
                }
                prevTextRef.current = text;
            }
        }, 300);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            container.removeEventListener("click", resumeOnInteraction);
            container.removeEventListener("keydown", resumeOnInteraction);
            if (container.contains(a)) container.removeChild(a);
            // leave the global loader script in place in case other pages use it
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
