(function () {
    var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var q = function (s, c) { return (c || document).querySelector(s); };
    var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");

    var SETA_ESQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>';
    var SETA_DIR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    var SETA_CIMA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';

    function barraProgresso() {
        var barra = document.createElement("div");
        barra.className = "hist-progresso";
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
        b.className = "hist-topo";
        b.setAttribute("aria-label", "Voltar ao topo");
        b.innerHTML = SETA_CIMA;
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

    function navegacaoEntreHistorias() {
        var aprend = q(".hist-aprendizagens");
        if (aprend && !aprend.id) aprend.id = "hist-aprendizagens";

        var secoes = qa(".hist-detalhe");
        secoes.forEach(function (sec, i) {
            var conteudo = q(".hist-detalhe-conteudo", sec);
            if (!conteudo || q(".hist-navegar", conteudo)) return;

            var proxima = secoes[i + 1];
            var destino = proxima ? "#" + proxima.id : (aprend ? "#hist-aprendizagens" : "");
            var texto = proxima ? "Próxima história" : "O que fica destas histórias";

            var nav = document.createElement("div");
            nav.className = "hist-navegar";
            nav.innerHTML =
                '<a href="#historias">' + SETA_ESQ + 'Voltar às histórias</a>' +
                (destino ? '<a href="' + destino + '">' + texto + SETA_DIR + '</a>' : "");
            conteudo.appendChild(nav);
        });
    }

    function destacar(id) {
        var el = document.getElementById(id);
        if (!el || !el.classList.contains("hist-detalhe")) return;
        el.classList.remove("jn-destaque");
        setTimeout(function () {
            el.classList.add("jn-destaque");
            setTimeout(function () { el.classList.remove("jn-destaque"); }, 1800);
        }, 500);
    }

    function ancoras() {
        qa('a[href^="#hist-"]').forEach(function (a) {
            a.addEventListener("click", function () {
                destacar(a.getAttribute("href").slice(1));
            });
        });
        if (location.hash.indexOf("#hist-") === 0) destacar(location.hash.slice(1));
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
            var link = qa(".hist-link-principal");
            if (link.length) gsap.set(link, { transition: "none" });

            var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            intro
                .from(".hist-etiqueta", { y: 20, opacity: 0, duration: 0.6, clearProps: "all" })
                .from(".hist-hero h1", { y: 40, opacity: 0, duration: 0.9 }, "-=0.3")
                .from(".hist-hero h1 span", { x: -24, opacity: 0, duration: 0.7 }, "-=0.4")
                .from(".hist-hero-conteudo > p", { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
                .from(".hist-link-principal", { y: 24, opacity: 0, duration: 0.7, clearProps: "all" }, "-=0.5");

            if (q(".hist-hero-imagem")) {
                intro.from(".hist-hero-imagem", { y: 50, opacity: 0, duration: 0.9 }, "-=0.6")
                     .from(".hist-legenda-imagem", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3");
            }

            entrada(".hist-intro-titulo > *", { x: -40, opacity: 0, stagger: 0.1 }, ".hist-introducao", "top 75%");
            entrada(".hist-intro-texto p", { y: 30, opacity: 0, stagger: 0.15 }, ".hist-introducao", "top 75%");

            entrada(".hist-seccao-cabecalho > *", { y: 30, opacity: 0, stagger: 0.12 }, ".hist-seccao-cabecalho");
            entrada(".hist-card", { y: 70, opacity: 0, scale: 0.97, duration: 0.9, stagger: 0.15 }, ".hist-grelha");
            entrada(".hist-card-imagem img", { scale: 1.25, duration: 1.3, ease: "power2.out" }, ".hist-grelha");
            entrada(".hist-numero", { y: -20, opacity: 0, duration: 0.7, stagger: 0.15, delay: 0.4 }, ".hist-grelha");
            entrada(".hist-nota", { y: 20, opacity: 0 }, ".hist-nota", "top 90%");

            qa(".hist-detalhe").forEach(function (sec) {
                var inverso = sec.classList.contains("hist-detalhe-invertido");
                var imgWrap = q(".hist-detalhe-imagem", sec);
                var img = q(".hist-detalhe-imagem img", sec);
                var conteudo = q(".hist-detalhe-conteudo", sec);
                var numero = q(".hist-fundo-numero", sec);
                var filhos = conteudo ? qa(":scope > *", conteudo) : [];
                var icone = q(".hist-aprendizagem svg", sec);

                var tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: sec, start: "top 70%", once: true }
                });

                if (numero) tl.from(numero, { opacity: 0, duration: 1.2, clearProps: "opacity" }, 0);
                if (img) tl.fromTo(img,
                    { clipPath: inverso ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
                    { clipPath: "inset(0 0 0 0)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" }, 0.1);
                if (imgWrap) tl.fromTo(imgWrap, { "--bloco": 0 }, { "--bloco": 1, duration: 0.9, ease: "power2.out" }, 0.5);
                if (conteudo) tl.from(conteudo, { y: 60, opacity: 0, duration: 0.9 }, 0.4);
                if (filhos.length) tl.from(filhos, { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.7);
                if (icone) tl.from(icone, { scale: 0, rotate: -60, duration: 0.6, ease: "back.out(1.8)" }, 1.1);
            });

            entrada(".hist-aprendizagens-cabecalho > *", { y: 30, opacity: 0, stagger: 0.12 }, ".hist-aprendizagens-cabecalho");
            entrada(".hist-aprendizagem-card", { y: 60, opacity: 0, duration: 0.8, stagger: 0.15 }, ".hist-aprendizagens-grelha");
            entrada(".hist-icone", { scale: 0, rotate: -60, duration: 0.6, stagger: 0.15, delay: 0.3, ease: "back.out(1.8)" }, ".hist-aprendizagens-grelha");

            entrada(".hist-encerramento-icone", { scale: 0, rotate: -90, duration: 0.8, ease: "back.out(1.7)" }, ".hist-encerramento", "top 75%");
            entrada(".hist-encerramento > *:not(.hist-encerramento-icone)", { y: 30, opacity: 0, stagger: 0.12, delay: 0.2 }, ".hist-encerramento", "top 75%");
        });

        mm.add("(min-width: 751px) and (prefers-reduced-motion: no-preference)", function () {
            gsap.to(".hist-hero-conteudo", {
                y: 60,
                ease: "none",
                scrollTrigger: { trigger: ".hist-hero", start: "top top", end: "bottom top", scrub: true }
            });

            qa(".hist-fundo-numero").forEach(function (num) {
                gsap.fromTo(num, { yPercent: -8 }, {
                    yPercent: 12,
                    ease: "none",
                    scrollTrigger: { trigger: num.closest(".hist-detalhe"), start: "top bottom", end: "bottom top", scrub: true }
                });
            });
        });

        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }

    barraProgresso();
    botaoTopo();
    navegacaoEntreHistorias();
    ancoras();

    if (window.gsap && window.ScrollTrigger) animar();
})();
