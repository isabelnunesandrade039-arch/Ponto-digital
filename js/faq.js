console.log("Botões:", document.querySelectorAll(".faq-cats button").length);
console.log("Perguntas:", document.querySelectorAll(".faq-item").length);
console.log("Pesquisa:", document.getElementById("faq-busca"));
console.log("Mensagem vazia:", document.getElementById("faq-vazio"));

const botoes = document.querySelectorAll(".faq-cats button");
    const itens = document.querySelectorAll(".faq-item");
    const busca = document.getElementById("faq-busca");
    const vazio = document.getElementById("faq-vazio");
    let categoria = "todas";

    const limpar = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    function filtrar() {
        const termo = limpar(busca.value.trim());
        let visiveis = 0;
        itens.forEach(item => {
            const certaCat = categoria === "todas" || item.dataset.cat === categoria;
            const certoTexto = !termo || limpar(item.textContent).includes(termo);
            const mostrar = certaCat && certoTexto;
            item.hidden = !mostrar;
            if (mostrar) visiveis++;
        });
        vazio.hidden = visiveis > 0;
    }

    botoes.forEach(b => b.addEventListener("click", () => {
        categoria = b.dataset.cat;
        botoes.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        filtrar();
    }));

    busca.addEventListener("input", filtrar);

    // Só uma pergunta aberta de cada vez
    itens.forEach(item => item.addEventListener("toggle", () => {
        if (item.open) itens.forEach(o => { if (o !== item) o.open = false; });
    }));