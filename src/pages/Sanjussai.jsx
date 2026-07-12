import React, { useEffect, useRef } from "react";

function Sanjussai() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

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

        return () => {
            if (container.contains(a)) container.removeChild(a);
            // leave the global loader script in place in case other pages use it
        };
    }, []);

    return (
        <section className="container section page-section sanjussai-page">
            <p className="eyebrow">sanjussai</p>
            <h1 className="page-title">Nova aetas adventat</h1>
            <div ref={containerRef}></div>
        </section>
    );
}

export default Sanjussai;
