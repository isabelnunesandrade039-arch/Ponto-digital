(function () {
    var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var q = function (s, c) { return (c || document).querySelector(s); };
    var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");

    var SVG = function (caminhos, preenchido) {
        return '<svg viewBox="0 0 24 24" fill="' + (preenchido ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + caminhos + '</svg>';
    };
    var ICONE_CIMA = SVG('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>');
    var ICONE_PAUSA = SVG('<path d="M6 4h4v16H6z"/><path d="M14 4h4v16h-4z"/>', true);
    var ICONE_PLAY = SVG('<path d="M6 3l14 9-14 9z"/>', true);

    function barraProgresso() {
        var barra = document.createElement("div");
        barra.className = "inicio-progresso";
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
        b.className = "inicio-topo";
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

    function controloVideo() {
        var video = q(".hero__video");
        var hero = q(".hero");
        if (!video || video.tagName !== "VIDEO" || !hero) return;

        var ligacao = navigator.connection || {};
        var poupar = reduzir.matches || ligacao.saveData === true;
        var pausadoPeloUtilizador = poupar;

        var b = document.createElement("button");
        b.type = "button";
        b.className = "inicio-pausa";
        hero.appendChild(b);

        function rotulo() {
            var parado = pausadoPeloUtilizador;
            b.innerHTML = parado ? ICONE_PLAY : ICONE_PAUSA;
            b.setAttribute("aria-label", parado ? "Reproduzir vídeo de fundo" : "Pausar vídeo de fundo");
        }

        if (poupar) {
            video.removeAttribute("autoplay");
            video.pause();
        }
        rotulo();

        b.addEventListener("click", function () {
            pausadoPeloUtilizador = !pausadoPeloUtilizador;
            if (pausadoPeloUtilizador) video.pause();
            else video.play().catch(function () {});
            rotulo();
        });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (es) {
                es.forEach(function (e) {
                    if (!e.isIntersecting) video.pause();
                    else if (!pausadoPeloUtilizador) video.play().catch(function () {});
                });
            }, { threshold: 0.1 }).observe(hero);
        }
    }

    function imagensLeves() {
        qa("img").forEach(function (img) {
            if (img.closest(".hero, .inicio-cont")) return;
            if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
            if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
        });
    }

    function indicadorSecoes() {
        var seletores = [".hero", ".conteiner-online", ".fundo-facil", ".sobre", ".cont-conteudo", ".fundo-nao", ".conteudo-pec", ".frase"];
        var alvos = [];
        seletores.forEach(function (s) {
            var el = q(s);
            if (!el) return;
            el = el.closest("section") || el;
            if (alvos.indexOf(el) === -1) alvos.push(el);
        });
        if (alvos.length < 3) return;

        var nav = document.createElement("nav");
        nav.className = "inicio-secoes";
        nav.setAttribute("aria-label", "Secções da página");

        var botoes = alvos.map(function (el, i) {
            el.style.scrollMarginTop = "var(--altura-cabecalho, 64px)";
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Ir para a secção " + (i + 1) + " de " + alvos.length);
            b.addEventListener("click", function () {
                el.scrollIntoView({ behavior: reduzir.matches ? "auto" : "smooth", block: "start" });
            });
            nav.appendChild(b);
            return b;
        });
        document.body.appendChild(nav);

        if (!("IntersectionObserver" in window)) return;
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting) return;
                botoes.forEach(function (b, i) { b.classList.toggle("activo", alvos[i] === e.target); });
            });
        }, { rootMargin: "-45% 0px -45% 0px" });
        alvos.forEach(function (el) { io.observe(el); });
    }

    function dividirPalavras(el) {
        if (el.dataset.dividido) return qa(".pal-in", el);
        el.dataset.dividido = "1";
        el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));

        var frag = document.createDocumentFragment();
        Array.prototype.slice.call(el.childNodes).forEach(function (no) {
            if (no.nodeType === 3) {
                no.textContent.split(/(\s+)/).forEach(function (parte) {
                    if (!parte) return;
                    if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(" ")); return; }
                    var m = document.createElement("span");
                    var i = document.createElement("span");
                    m.className = "pal";
                    i.className = "pal-in";
                    i.setAttribute("aria-hidden", "true");
                    i.textContent = parte;
                    m.appendChild(i);
                    frag.appendChild(m);
                });
            } else if (no.nodeName === "BR") {
                frag.appendChild(no);
            } else if (no.nodeType === 1) {
                var m2 = document.createElement("span");
                var i2 = document.createElement("span");
                m2.className = "pal";
                i2.className = "pal-in";
                i2.setAttribute("aria-hidden", "true");
                i2.appendChild(no);
                m2.appendChild(i2);
                frag.appendChild(m2);
            }
        });
        el.textContent = "";
        el.appendChild(frag);
        return qa(".pal-in", el);
    }

    function dividirFrase(el) {
        if (el.dataset.dividido || el.children.length) return qa(".frase-pal", el);
        el.dataset.dividido = "1";
        var texto = el.textContent.trim().replace(/\s+/g, " ");
        el.setAttribute("aria-label", texto);
        el.textContent = "";
        texto.split(" ").forEach(function (p, i, todas) {
            var s = document.createElement("span");
            s.className = "frase-pal";
            s.setAttribute("aria-hidden", "true");
            s.textContent = p;
            el.appendChild(s);
            if (i < todas.length - 1) el.appendChild(document.createTextNode(" "));
        });
        return qa(".frase-pal", el);
    }

    function inclinar(alvos) {
        alvos.forEach(function (el) {
            el.addEventListener("pointermove", function (e) {
                if (e.pointerType !== "mouse") return;
                var r = el.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                el.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
                el.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
            });
            el.addEventListener("pointerleave", function () {
                el.style.setProperty("--rx", "0deg");
                el.style.setProperty("--ry", "0deg");
            });
        });
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

        function contar(el, tl, posicao) {
            if (!el || !/^\d+$/.test(el.textContent.trim())) return;
            var texto = el.textContent.trim();
            var obj = { v: 0 };
            el.textContent = "".padStart(texto.length, "0");
            tl.to(obj, {
                v: parseInt(texto, 10),
                duration: 1.2,
                ease: "power2.out",
                onUpdate: function () {
                    el.textContent = String(Math.round(obj.v)).padStart(texto.length, "0");
                }
            }, posicao);
        }

        mm.add("(prefers-reduced-motion: no-preference)", function () {
            var titulo = q(".hero .titulo");
            var palavras = titulo ? dividirPalavras(titulo) : [];
            var botoes = qa(".botoes > *");
            if (botoes.length) gsap.set(botoes, { transition: "none" });

            var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (palavras.length) intro.from(palavras, { yPercent: 115, duration: 0.9, stagger: 0.07 });
            if (q(".hero .ponto")) intro.from(".hero .ponto", { scale: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(3)" }, "-=0.3");
            if (q(".hero p")) intro.from(".hero p", { y: 30, opacity: 0, duration: 0.8 }, "-=0.5");
            if (botoes.length) intro.from(botoes, { y: 24, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, clearProps: "all" }, "-=0.5");
            if (q(".img-tel img")) intro.from(".img-tel img", { x: 80, rotate: 6, opacity: 0, duration: 1, clearProps: "transform,opacity" }, 0.4);

            if (q(".hero__video")) {
                gsap.to(".hero__video", {
                    scale: 1.18,
                    ease: "none",
                    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
                });
            }

            entrada(".conteudo-online > h2", { y: 30, opacity: 0 }, ".conteiner-online", "top 75%");
            entrada(".conteudo-online > div", { x: -50, opacity: 0, stagger: 0.14, delay: 0.1 }, ".conteiner-online", "top 75%");
            entrada(".conteudo-online i", { scale: 0, rotate: -120, duration: 0.6, stagger: 0.14, delay: 0.3, ease: "back.out(1.8)" }, ".conteiner-online", "top 75%");

            var imgOnline = q(".cont-imagem img");
            if (imgOnline) {
                gsap.fromTo(imgOnline,
                    { clipPath: "circle(0% at 0% 100%)" },
                    {
                        clipPath: "circle(150% at 0% 100%)",
                        duration: 1.4,
                        ease: "power2.inOut",
                        clearProps: "clipPath",
                        scrollTrigger: { trigger: ".cont-imagem", start: "top 75%", once: true }
                    });
            }
            var selo = q(".cont-imagem span");
            if (selo) {
                gsap.set(selo, { transition: "none" });
                gsap.from(selo, {
                    y: 40,
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.8,
                    delay: 0.9,
                    ease: "back.out(1.6)",
                    clearProps: "all",
                    scrollTrigger: { trigger: ".cont-imagem", start: "top 75%", once: true },
                    onComplete: function () { selo.classList.add("flutua"); }
                });
            }

            var banner = q(".cont-img");
            if (banner) {
                gsap.fromTo(banner,
                    { clipPath: "inset(0 0 100% 0)" },
                    {
                        clipPath: "inset(0 0 0% 0)",
                        duration: 1.1,
                        ease: "power3.inOut",
                        clearProps: "clipPath",
                        scrollTrigger: { trigger: banner, start: "top 80%", once: true }
                    });
                gsap.from(".cont-img img", {
                    scale: 1.25,
                    duration: 1.6,
                    ease: "power2.out",
                    clearProps: "transform",
                    scrollTrigger: { trigger: banner, start: "top 80%", once: true }
                });
            }
            entrada(".conteudo-facil > h2", { y: 30, opacity: 0 }, ".conteudo-facil", "top 70%");
            entrada(".grupo-cards .card", { rotationX: -70, transformPerspective: 800, transformOrigin: "50% 0%", opacity: 0, duration: 0.9, stagger: 0.15 }, ".grupo-cards", "top 80%");
            entrada(".card i", { scale: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: "back.out(2)" }, ".grupo-cards", "top 80%");

            entrada(".sobre .conteudo", { x: -60, opacity: 0, duration: 1, delay: 0.2 }, ".sobre", "top 70%");
            entrada(".sobre .conteudo > *", { y: 20, opacity: 0, stagger: 0.1, delay: 0.5 }, ".sobre", "top 70%");

            if (q(".cont-conteudo")) {
                var wipe = [
                    [".primeiro-cont", "inset(0 100% 0 0)"],
                    [".segundo-cont", "inset(0 0 100% 0)"],
                    [".terceiro-cont", "inset(100% 0 0 0)"],
                    [".quarto-cont", "inset(0 0 0 100%)"]
                ];
                var tl = gsap.timeline({
                    defaults: { ease: "power3.inOut" },
                    scrollTrigger: { trigger: ".cont-conteudo", start: "top 75%", once: true }
                });
                wipe.forEach(function (par, i) {
                    var el = q(par[0]);
                    if (!el) return;
                    var t0 = i * 0.18;
                    gsap.set(el, { transition: "none" });
                    tl.fromTo(el, { clipPath: par[1] }, { clipPath: "inset(0 0 0 0)", duration: 1, clearProps: "clipPath" }, t0);
                    tl.from(qa(":scope > *", el), { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", clearProps: "transform,opacity" }, t0 + 0.5);
                    contar(q("span", el), tl, t0 + 0.5);
                    tl.set(el, { clearProps: "transition" }, t0 + 1.6);
                });
            }

            var imagens = qa(".imagens > *");
            if (imagens.length) {
                gsap.fromTo(imagens,
                    { clipPath: "inset(100% 0 0 0)" },
                    {
                        clipPath: "inset(0% 0 0 0)",
                        duration: 1,
                        stagger: 0.18,
                        ease: "power3.inOut",
                        clearProps: "clipPath",
                        scrollTrigger: { trigger: ".imagens", start: "top 80%", once: true }
                    });
            }

            entrada(".conteudo-1 > *", { y: 30, opacity: 0, stagger: 0.1 }, ".conteudo-nao", "top 75%");
            entrada(".conteudo-lista .dados", { x: 40, opacity: 0, stagger: 0.12, delay: 0.2 }, ".conteudo-nao", "top 75%");
            entrada(".conteudo-lista .dados span", { scale: 0, duration: 0.5, stagger: 0.12, delay: 0.4, ease: "back.out(2)" }, ".conteudo-nao", "top 75%");

            entrada(".cont-geral h2", { y: 30, opacity: 0 }, ".conteudo-pec", "top 75%");
            entrada(".conteudo-antes-depois > *", { x: -30, opacity: 0, stagger: 0.25, delay: 0.2 }, ".conteudo-pec", "top 75%");
            var imgPec = q(".pec-img img");
            if (imgPec) {
                gsap.fromTo(imgPec,
                    { clipPath: "inset(0 0 0 100%)" },
                    {
                        clipPath: "inset(0 0 0 0)",
                        duration: 1.1,
                        ease: "power3.inOut",
                        clearProps: "clipPath",
                        scrollTrigger: { trigger: ".pec-img", start: "top 80%", once: true }
                    });
            }

            var frase = q(".frase h3");
            if (frase) {
                var pal = dividirFrase(frase);
                if (pal.length) {
                    gsap.fromTo(pal, { opacity: 0.18 }, {
                        opacity: 1,
                        stagger: 0.12,
                        ease: "none",
                        scrollTrigger: { trigger: frase, start: "top 80%", end: "bottom 45%", scrub: true }
                    });
                }
            }
            entrada(".frase p", { y: 24, opacity: 0 }, ".frase p", "top 90%");

            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                inclinar(qa(".card, .cont-conteudo > div"));
            }
        });

        mm.add("(min-width: 751px) and (prefers-reduced-motion: no-preference)", function () {
            var img = q(".sobre img");
            if (!img) return;
            gsap.fromTo(img, { yPercent: -6 }, {
                yPercent: 6,
                ease: "none",
                scrollTrigger: { trigger: ".sobre", start: "top bottom", end: "bottom top", scrub: true }
            });
        });

        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }

    barraProgresso();
    botaoTopo();
    controloVideo();
    imagensLeves();
    indicadorSecoes();

    if (window.gsap && window.ScrollTrigger) animar();
})();
