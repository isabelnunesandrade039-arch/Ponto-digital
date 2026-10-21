(function () {
    var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var q = function (s, c) { return (c || document).querySelector(s); };
    var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");

    function barraProgresso() {
        var barra = document.createElement("div");
        barra.className = "jn-progresso";
        barra.setAttribute("aria-hidden", "true");
        document.body.appendChild(barra);

        function actualizar() {
            var total = document.documentElement.scrollHeight - window.innerHeight;
            var p = total > 0 ? window.scrollY / total : 0;
            barra.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
        }

        actualizar();
        window.addEventListener("scroll", actualizar, { passive: true });
        window.addEventListener("resize", actualizar);
    }

    function botaoTopo() {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "jn-topo";
        b.setAttribute("aria-label", "Voltar ao topo");
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
        document.body.appendChild(b);

        function actualizar() {
            b.classList.toggle("visivel", window.scrollY > 600);
        }

        actualizar();
        window.addEventListener("scroll", actualizar, { passive: true });
        b.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduzir.matches ? "auto" : "smooth" });
        });
    }

    function destacar(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.classList.contains("secao-etapas-detalhe")) el = q(".etapa-bloco", el);
        if (!el) return;
        el.classList.remove("jn-destaque");
        setTimeout(function () {
            el.classList.add("jn-destaque");
            setTimeout(function () { el.classList.remove("jn-destaque"); }, 1800);
        }, 500);
    }

    function ancoras() {
        qa('a[href^="#etapa-"]').forEach(function (a) {
            a.addEventListener("click", function () {
                destacar(a.getAttribute("href").slice(1));
            });
        });
        if (location.hash.indexOf("#etapa-") === 0) destacar(location.hash.slice(1));
    }

    function respostaDiagnostico() {
        var res = document.getElementById("diag-result");
        var tit = document.getElementById("diag-title");
        if (!res || !tit || !window.MutationObserver) return;

        new MutationObserver(function () {
            res.classList.remove("jn-novo");
            void res.offsetWidth;
            res.classList.add("jn-novo");
            var r = res.getBoundingClientRect();
            if (r.bottom > window.innerHeight || r.top < 0) {
                res.scrollIntoView({ behavior: reduzir.matches ? "auto" : "smooth", block: "nearest" });
            }
        }).observe(tit, { childList: true, characterData: true, subtree: true });
    }

    function animar() {
        gsap.registerPlugin(ScrollTrigger);
        var mm = gsap.matchMedia();

        function entrada(alvos, vars, gatilho, inicio) {
            var lista = typeof alvos === "string" ? qa(alvos) : alvos;
            if (!lista.length) return;
            gsap.set(lista, { transition: "none" });
            gsap.from(lista, Object.assign({
                duration: 0.8,
                ease: "power3.out",
                clearProps: "all",
                scrollTrigger: { trigger: gatilho, start: inicio || "top 80%", once: true }
            }, vars));
        }

        mm.add("(prefers-reduced-motion: no-preference)", function () {
            var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            intro
                .from(".hero-conteudo > *", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
                .from(".jornada-nav-item", { y: 50, opacity: 0, duration: 0.7, stagger: 0.1, clearProps: "all" }, "-=0.4")
                .fromTo(".jornada-nav-grid", { "--linha": 0 }, { "--linha": 1, duration: 1.1, ease: "power2.inOut" }, "<");

            qa(".etapa-bloco").forEach(function (bloco) {
                var inverso = bloco.classList.contains("etapa-bloco-inverso");
                var lado = inverso ? 1 : -1;
                var img = q(".etapa-imagem", bloco);
                var cont = q(".etapa-imagem-container", bloco);
                var dica = q(".etapa-dica", bloco);
                var textos = qa(".etapa-tag, .etapa-titulo, .etapa-paragrafo", bloco);

                var tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: bloco, start: "top 75%", once: true }
                });

                if (textos.length) tl.from(textos, { x: lado * 40, y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, 0);
                if (img) tl.fromTo(img,
                    { clipPath: inverso ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
                    { clipPath: "inset(0 0 0 0)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" }, 0.1);
                if (cont) tl.fromTo(cont, { "--moldura": 0 }, { "--moldura": 1, duration: 0.9 }, 0.5);
                if (dica) tl.from(dica, { y: 40, opacity: 0, duration: 0.7 }, 0.7);
            });

            entrada(".bento-cabecalho > *", { y: 30, stagger: 0.12, opacity: 0 }, ".bento-cabecalho");
            entrada(".bento-card", { y: 70, opacity: 0, duration: 0.9, stagger: 0.15 }, ".bento-grid");
            entrada(".bento-card-icone", { scale: 0, rotate: -90, duration: 0.7, stagger: 0.15, delay: 0.3, ease: "back.out(1.7)" }, ".bento-grid");

            var frame = q(".oficina-imagem-frame");
            if (frame) {
                gsap.fromTo(frame,
                    { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
                    {
                        clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)",
                        duration: 1.2,
                        ease: "power3.inOut",
                        clearProps: "clipPath",
                        scrollTrigger: { trigger: ".oficina-grid", start: "top 75%", once: true }
                    });
            }
            entrada(".oficina-conteudo > *", { y: 30, opacity: 0, stagger: 0.12 }, ".oficina-grid", "top 75%");

            entrada(".kit-topo > *, .kit-topo .kit-titulo-grupo > *", { y: 30, opacity: 0, stagger: 0.1 }, ".kit-topo");
            entrada(".kit-card", { y: 60, scale: 0.96, opacity: 0, duration: 0.8, stagger: 0.12 }, ".kit-grid");
            entrada(".kit-card-icone-wrapper", { scale: 0, rotate: -60, duration: 0.6, stagger: 0.12, delay: 0.3, ease: "back.out(1.7)" }, ".kit-grid");

            entrada(".diagnostico-intro", { x: -40, opacity: 0 }, ".diagnostico-container", "top 75%");
            entrada(".diagnostico-quiz", { y: 40, opacity: 0 }, ".diagnostico-container", "top 75%");
            entrada(".botao-opcao", { x: 24, opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.3 }, ".diagnostico-quiz", "top 75%");

            entrada(".cta-wrapper > *", { y: 30, opacity: 0, stagger: 0.12 }, ".cta-wrapper", "top 85%");
        });

        mm.add("(min-width: 751px) and (prefers-reduced-motion: no-preference)", function () {
            gsap.to(".hero-conteudo", {
                y: 70,
                ease: "none",
                scrollTrigger: { trigger: ".secao-hero", start: "top top", end: "bottom top", scrub: true }
            });
        });

        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }

    barraProgresso();
    botaoTopo();
    ancoras();
    respostaDiagnostico();

    if (window.gsap && window.ScrollTrigger) animar();
})();
