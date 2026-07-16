export function iniciarMostrarContrasena() {
    const loginIcono = document.getElementById("ojoCerradoIconPass");
    if (loginIcono) {
        loginIcono.addEventListener("click", () => alternarCampos(["loginPass"], loginIcono));
    }

    document.querySelectorAll("[data-toggle-password]").forEach((boton) => {
        boton.addEventListener("click", () => alternarCampos(String(boton.dataset.togglePassword).split(",")));
    });
}

function alternarCampos(ids, icono = null) {
    let mostrando = false;
    ids.forEach((id) => {
        const input = document.getElementById(id.trim());
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
        mostrando = input.type === "text";
    });

    if (icono) {
        icono.src = mostrando ? "img/abierto.png" : "img/cerrado.png";
        icono.alt = mostrando ? "Ocultar contraseña" : "Mostrar contraseña";
        icono.title = icono.alt;
    }
}
