export function iniciarMostrarContrasena() {
    const loginIcono = document.getElementById("ojoCerradoIconPass");
    if (loginIcono) {
        loginIcono.addEventListener("click", () => alternarCampos(["loginPass"]));
    }

    document.querySelectorAll("[data-toggle-password]").forEach((boton) => {
        boton.addEventListener("click", () => alternarCampos(String(boton.dataset.togglePassword).split(",")));
    });
}

function alternarCampos(ids) {
    ids.forEach((id) => {
        const input = document.getElementById(id.trim());
        if (input) input.type = input.type === "password" ? "text" : "password";
    });
}
