(function () {
    var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var q = function (s, c) { return (c || document).querySelector(s); };
    var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ratoFino = window.matchMedia("(hover: hover) and (pointer: fine)");

    var SVG = function (caminhos) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + caminhos + '</svg>';
    };
    var ICONE_CIMA = SVG('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>');
    var ICONE_BAIXO = SVG('<path d="m6 9 6 6 6-6"/>');
    var ICONE_RELOGIO = SVG('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>');

    function barraProgresso() {
        var barra = document.createElement("div");
        barra.className = "dig-progresso";
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
        b.className = "dig-topo";
        b.setAttribute("aria-label", "Voltar ao topo");
        b.innerHTML = ICONE_CIMA;
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

    function tempoLeitura() {
        var hero = q(".dig-hero");
        if (!hero || q(".dig-leitura", hero)) return;
        var palavras = 0;
        qa(".desafios, .motivos, .antes-depois-fundo, .dezzafios, .fim").forEach(function (s) {
            var t = s.textContent.trim();
            if (t) palavras += t.split(/\s+/).length;
        });
        if (!palavras) return;
        var min = Math.max(1, Math.round(palavras / 200));
        var p = document.createElement("p");
        p.className = "dig-leitura";
        p.innerHTML = ICONE_RELOGIO + "<span>Leitura de cerca de " + min + (min === 1 ? " minuto" : " minutos") + "</span>";
        hero.appendChild(p);
    }

    function pistaScroll() {
        var hero = q(".dig-hero");
        var alvo = q(".desafios");
        if (!hero || !alvo) return;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "dig-pista";
        b.setAttribute("aria-label", "Descer para o conteúdo");
        b.innerHTML = ICONE_BAIXO;
        hero.appendChild(b);

        b.addEventListener("click", function () {
            alvo.scrollIntoView({ behavior: reduzir.matches ? "auto" : "smooth", block: "start" });
        });

        function actualizar() {
            b.classList.toggle("oculta", window.scrollY > 80);
        }

        actualizar();
        window.addEventListener("scroll", actualizar, { passive: true });
    }

    function foco() {
        qa(".dezzafios-card").forEach(function (el) {
            el.addEventListener("pointermove", function (e) {
                if (e.pointerType !== "mouse") return;
                var r = el.getBoundingClientRect();
                el.style.setProperty("--mx", (e.clientX - r.left) + "px");
                el.style.setProperty("--my", (e.clientY - r.top) + "px");
            });
        });
    }

    function ima() {
        var sec = q(".fim");
        var btn = q(".fim-botao");
        if (!sec || !btn || !ratoFino.matches || reduzir.matches) return;
        var ix = 0;
        var iy = 0;

        function repor() {
            ix = 0;
            iy = 0;
            btn.style.setProperty("--ix", "0px");
            btn.style.setProperty("--iy", "0px");
        }

        sec.addEventListener("pointermove", function (e) {
            var r = btn.getBoundingClientRect();
            var cx = r.left + r.width / 2 - ix;
            var cy = r.top + r.height / 2 - iy;
            var dx = e.clientX - cx;
            var dy = e.clientY - cy;
            if (Math.hypot(dx, dy) < 160) {
                ix = dx * 0.3;
                iy = dy * 0.3;
                btn.style.setProperty("--ix", ix.toFixed(1) + "px");
                btn.style.setProperty("--iy", iy.toFixed(1) + "px");
            } else if (ix || iy) {
                repor();
            }
        });
        sec.addEventListener("pointerleave", repor);
    }

    function animar() {
        gsap.registerPlugin(ScrollTrigger);
        var mm = gsap.matchMedia();

        function entrada(alvos, vars, gatilho, inicio) {
            var lista = typeof alvos === "string" ? qa(alvos) : alvos;
            if (!lista.length) return;
            var g = typeof gatilho === "string" ? q(gatilho) : gatilho;
            if (!g) g = lista[0];
            gsap.set(lista, { transition: "none" });
            gsap.from(lista, Object.assign({
                duration: 0.8,
                ease: "power3.out",
                clearProps: "all",
                scrollTrigger: { trigger: g, start: inicio || "top 80%", once: true }
            }, vars));
        }

        mm.add("(prefers-reduced-motion: no-preference)", function () {
            var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (q(".dig-hero h1")) intro.from(".dig-hero h1", { y: 40, opacity: 0, filter: "blur(14px)", duration: 1.2, clearProps: "all" });
            if (q(".dig-leitura")) intro.from(".dig-leitura", { y: 16, opacity: 0, duration: 0.6, clearProps: "all" }, "-=0.5");
            if (q(".dig-pista")) intro.from(".dig-pista", { opacity: 0, y: -12, duration: 0.6, clearProps: "opacity,transform" }, "<");

            if (q(".dig-hero")) {
                gsap.fromTo(".dig-hero", { "--sumir": 0 }, {
                    "--sumir": 1,
                    ease: "none",
                    scrollTrigger: { trigger: ".dig-hero", start: "top top", end: "bottom top", scrub: true }
                });
            }

            entrada(".dig-conteudo > *, .mot-conteudo > *", { y: 30, opacity: 0, stagger: 0.12 }, ".dig-conteudo", "top 80%");

            var cartoes = qa(".desa-card");
            if (cartoes.length) {
                gsap.fromTo(cartoes, {
                    rotation: function (i) { return [-7, 5, -4][i % 3]; },
                    y: function (i) { return [30, -20, 40][i % 3]; }
                }, {
                    rotation: 0,
                    y: 0,
                    ease: "none",
                    scrollTrigger: { trigger: ".desafios-grupo-cards", start: "top 90%", end: "top 40%", scrub: true }
                });
            }

            var fotoDesafios = q(".desa-imagem img");
            if (fotoDesafios) {
                gsap.fromTo(fotoDesafios, { scale: 1.2 }, {
                    scale: 1,
                    ease: "none",
                    scrollTrigger: { trigger: ".desa-imagem", start: "top 90%", end: "center 50%", scrub: true }
                });
            }

            entrada(".motivos-titulo, .mot-conteudo > p", { y: 30, opacity: 0, stagger: 0.12 }, ".motivos", "top 80%");

            qa(".pares").forEach(function (par) {
                var moldura = q(".motivos-imagem", par);
                var card = q(".motivos-card", par);
                var partes = card ? qa("i, svg, h3, p", card) : [];

                var tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: par, start: "top 75%", once: true }
                });

                if (moldura) tl.fromTo(moldura, { "--cortina": 1 }, { "--cortina": 0, duration: 1.1, ease: "power3.inOut" }, 0);
                if (card) tl.from(card, { y: 40, opacity: 0, duration: 0.8 }, 0.5);
                if (partes.length) tl.from(partes, { y: 18, opacity: 0, duration: 0.5, stagger: 0.08, clearProps: "transform,opacity" }, 0.8);
            });

            var antes = qa(".dig-antes li");
            var depois = qa(".dig-depois li");
            if (antes.length && depois.length) {
                var par = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: ".antes-depois-conteiner", start: "top 70%", once: true }
                });
                par.from(".dig-antes-cont", { x: -40, opacity: 0, duration: 0.7, clearProps: "all" }, 0)
                   .from(antes, { x: -20, opacity: 0, duration: 0.5, stagger: 0.12, clearProps: "all" }, 0.3)
                   .from(".dig-depois-cont", { x: 40, opacity: 0, duration: 0.7, clearProps: "all" }, 1.1);

                depois.forEach(function (item, i) {
                    var t = 1.5 + i * 0.55;
                    var icone = q("svg", item);
                    par.from(item, { x: 30, opacity: 0, duration: 0.5, clearProps: "all" }, t);
                    if (icone) par.from(icone, { scale: 0, rotate: -90, duration: 0.5, ease: "back.out(2)", clearProps: "all" }, t + 0.1);
                    if (antes[i]) par.call(function () { antes[i].classList.add("riscado"); }, null, t);
                });
            }
            entrada(".dig-titulo", { y: 30, opacity: 0 }, ".antes-depois-fundo", "top 80%");

            entrada(".dezzafios-titulo", { y: 30, opacity: 0 }, ".dezzafios", "top 75%");
            entrada(".dezzafios-card", { y: -90, opacity: 0, duration: 1.1, ease: "bounce.out", stagger: 0.15 }, ".dezzafios-grupo-cards", "top 80%");
            entrada(".dezzafios-card svg", { scale: 0, duration: 0.5, stagger: 0.15, delay: 0.5, ease: "back.out(2)" }, ".dezzafios-grupo-cards", "top 80%");

            entrada(".fim-conteudo > *", { y: 30, opacity: 0, stagger: 0.12 }, ".fim", "top 80%");
        });

        mm.add("(min-width: 751px) and (prefers-reduced-motion: no-preference)", function () {
            qa(".motivos-imagem img").forEach(function (img) {
                gsap.fromTo(img, { yPercent: -7, scale: 1.15 }, {
                    yPercent: 7,
                    scale: 1.15,
                    ease: "none",
                    scrollTrigger: { trigger: img.closest(".pares") || img, start: "top bottom", end: "bottom top", scrub: true }
                });
            });
        });

        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }

    barraProgresso();
    botaoTopo();
    // tempoLeitura();
    pistaScroll();
    foco();
    ima();

    if (window.gsap && window.ScrollTrigger) animar();
})();
