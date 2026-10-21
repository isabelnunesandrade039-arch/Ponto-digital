

function abrirMenu(){
    menu.classList.toggle("menu-ativo")
    
    const icon = document.querySelector("#btn [data-lucide]") 
    
    if(menu.classList.contains("menu-ativo")){
        icon.setAttribute("data-lucide","x")
    }else{
        icon.setAttribute("data-lucide","menu")
    }
    lucide.createIcons();
}
const cabecalho = document.querySelector(".cabecalho");

function actualizarCabecalho() {
    cabecalho.classList.toggle("rolou", window.scrollY > 20);
}

actualizarCabecalho();
window.addEventListener("scroll", actualizarCabecalho, { passive: true });

    