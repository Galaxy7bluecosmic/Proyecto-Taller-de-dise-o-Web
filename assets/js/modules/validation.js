const SOLO_DIGITOS = /\D/g;
const ESPACIOS = /\s+/g;
const LETRAS = "a-zA-ZáéíóúÁÉÍÓÚñÑ";
const REGEX_NOMBRE = new RegExp(`^[${LETRAS}]+$`);
const REGEX_EMAIL = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const DOMINIOS_EMAIL = ["com", "edu", "pe", "org", "net"];
const REGEX_DIRECCION = new RegExp(`^[${LETRAS}0-9\\s#]+$`);

export const reglas = {
    nombre: {
        ejemplo: "Ejemplo: Juan",
        limpiar: (valor) => limpiarTexto(valor).replace(new RegExp(`[^${LETRAS}]`, "g"), "").slice(0, 15),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Este campo es obligatorio.";
            if (texto.length < 2) return "Debe tener al menos 2 letras.";
            if (texto.length > 15) return "Debe tener máximo 15 letras.";
            if (!REGEX_NOMBRE.test(texto)) return "Usa solo letras, sin números ni símbolos.";
            return "";
        }
    },
    apellido: {
        ejemplo: "Ejemplo: Perez",
        limpiar: (valor) => limpiarTexto(valor).replace(new RegExp(`[^${LETRAS}]`, "g"), "").slice(0, 15),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Este campo es obligatorio.";
            if (texto.length < 2) return "Debe tener al menos 2 letras.";
            if (texto.length > 15) return "Debe tener mÃ¡ximo 15 letras.";
            if (!REGEX_NOMBRE.test(texto)) return "Usa solo letras, sin nÃºmeros ni sÃ­mbolos.";
            return "";
        }
    },
    email: {
        ejemplo: "Ejemplo: usuario123@correo.com",
        limpiar: (valor) => limpiarTexto(valor).replace(/[^A-Za-z0-9@._-]/g, "").slice(0, 60),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Escribe tu correo electrónico.";
            if ((texto.match(/@/g) || []).length !== 1) return "El correo debe tener un solo @.";
            if (!/^[A-Za-z0-9._-]+@/.test(texto)) return "Antes del @ solo usa letras, números, punto, guion o guion bajo.";
            if (!REGEX_EMAIL.test(texto)) return "Agrega el final del correo, por ejemplo .com o .edu.";
            const final = texto.split(".").pop().toLowerCase();
            if (!DOMINIOS_EMAIL.includes(final)) return "El correo debe terminar en .com, .edu, .pe, .org o .net.";
            return "";
        }
    },
    telefono: {
        ejemplo: "Ejemplo: 987654321",
        limpiar: (valor) => String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 9),
        validar: (valor) => {
            const texto = String(valor || "").replace(SOLO_DIGITOS, "");
            if (!texto) return "Escribe un celular peruano.";
            if (texto.length !== 9) return "El celular debe tener exactamente 9 números.";
            if (!texto.startsWith("9")) return "El celular peruano debe empezar con 9.";
            return "";
        }
    },
    direccion: {
        ejemplo: "Ejemplo: Av Lima #123",
        limpiar: (valor) => limpiarTexto(valor).replace(new RegExp(`[^${LETRAS}0-9\\s#]`, "g"), "").slice(0, 80),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Escribe una dirección de delivery.";
            if (texto.length < 8) return "Agrega distrito, calle y numeración.";
            if (!new RegExp(`[${LETRAS}]`).test(texto)) return "La dirección debe incluir letras.";
            if (texto.includes("#") && !/#\d+/.test(texto)) return "Usa el michi solo para enumerar, por ejemplo #123.";
            if ((texto.match(/#/g) || []).length > 1) return "Usa un solo michi para la numeración.";
            if (!REGEX_DIRECCION.test(texto)) return "Solo se permiten letras, números, espacios y #.";
            return "";
        }
    },
    password: {
        ejemplo: "Ejemplo: Bocados",
        validar: (valor) => {
            const texto = String(valor || "");
            if (!texto) return "Escribe tu contraseña.";
            if (texto.length < 6) return "Debe tener al menos 6 caracteres.";
            return "";
        }
    },
    passwordFuerte: {
        ejemplo: "Ejemplo: Bocados",
        validar: (valor) => {
            const texto = String(valor || "");
            if (!texto) return "Crea una contraseña.";
            if (texto.length < 6) return "Debe tener al menos 6 caracteres.";
            if (!/[A-Za-z]/.test(texto) || !/\d/.test(texto)) return "Combina letras y números.";
            return "";
        }
    },
    tarjeta: {
        ejemplo: "Ejemplo: 4111111111111111",
        limpiar: (valor) => String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 16),
        validar: (valor) => {
            const texto = String(valor || "").replace(SOLO_DIGITOS, "");
            if (!texto) return "Escribe el número de tarjeta.";
            if (texto.length < 13 || texto.length > 16) return "La tarjeta debe tener entre 13 y 16 números.";
            return "";
        }
    },
    titular: {
        ejemplo: "Ejemplo: Juan Perez",
        limpiar: (valor) => limpiarTexto(valor).replace(new RegExp(`[^${LETRAS}\\s]`, "g"), "").slice(0, 60),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Escribe el nombre del titular.";
            if (texto.split(" ").filter(Boolean).length < 2) return "Escribe nombre y apellido del titular.";
            if (!new RegExp(`^[${LETRAS}\\s]+$`).test(texto)) return "Usa solo letras y espacios.";
            return "";
        }
    },
    fechaTarjeta: {
        ejemplo: "Ejemplo: 08/28",
        limpiar: (valor) => {
            const digitos = String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 4);
            return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
        },
        validar: (valor) => {
            const texto = String(valor || "");
            if (!texto) return "Escribe la fecha de vencimiento.";
            const partes = texto.match(/^(\d{2})\/(\d{2})$/);
            if (!partes) return "Usa el formato MM/AA.";
            const mes = Number(partes[1]);
            const anio = 2000 + Number(partes[2]);
            if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12.";
            const finMes = new Date(anio, mes, 0, 23, 59, 59);
            if (finMes < new Date()) return "La tarjeta no puede estar vencida.";
            return "";
        }
    },
    cvv: {
        ejemplo: "Ejemplo: 123",
        limpiar: (valor) => String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 4),
        validar: (valor) => {
            const texto = String(valor || "").replace(SOLO_DIGITOS, "");
            if (!texto) return "Escribe el CVV.";
            if (texto.length < 3 || texto.length > 4) return "El CVV debe tener 3 o 4 números.";
            return "";
        }
    },
    dinero: {
        ejemplo: "Ejemplo: 18.90",
        limpiar: (valor) => String(valor || "").replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d{0,2}).*$/, "$1").slice(0, 8),
        validar: (valor) => {
            const numero = Number(valor);
            if (!String(valor || "").trim()) return "Este precio es obligatorio.";
            if (!Number.isFinite(numero) || numero <= 0) return "El precio debe ser mayor que 0.";
            return "";
        }
    },
    enteroPositivo: {
        ejemplo: "Ejemplo: 20",
        limpiar: (valor) => String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 3),
        validar: (valor) => {
            const numero = Number(valor);
            if (!String(valor || "").trim()) return "Este número es obligatorio.";
            if (!Number.isInteger(numero) || numero < 1) return "Debe ser un número entero mayor que 0.";
            return "";
        }
    },
    stock: {
        ejemplo: "Ejemplo: 10",
        limpiar: (valor) => String(valor || "").replace(SOLO_DIGITOS, "").slice(0, 4),
        validar: (valor) => {
            const numero = Number(valor);
            if (!String(valor || "").trim()) return "Escribe el stock disponible.";
            if (!Number.isInteger(numero) || numero < 0) return "El stock debe ser 0 o un número mayor.";
            return "";
        }
    },
    textoCorto: {
        ejemplo: "Ejemplo: Combo familiar",
        limpiar: (valor) => limpiarTexto(valor).slice(0, 80),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Este campo es obligatorio.";
            if (texto.length < 3) return "Escribe al menos 3 caracteres.";
            return "";
        }
    },
    descripcion: {
        ejemplo: "Ejemplo: Plato con arroz, papas y ensalada.",
        limpiar: (valor) => limpiarTexto(valor).slice(0, 260),
        validar: (valor) => {
            const texto = limpiarTexto(valor);
            if (!texto) return "Escribe una descripción.";
            if (texto.length < 10) return "Agrega una descripción más clara.";
            return "";
        }
    },
    imagen: {
        ejemplo: "Ejemplo: img/plato.jpg",
        limpiar: (valor) => limpiarTexto(valor).replace(new RegExp(`[^${LETRAS}0-9\\s._\\-\\/]`, "g"), "").slice(0, 160),
        validar: (valor, input, form) => {
            const archivo = form?.querySelector('input[type="file"]')?.files?.[0];
            const texto = limpiarTexto(valor);
            if (!texto && !archivo) return "Agrega una ruta o selecciona una imagen.";
            if (archivo && !archivo.type.startsWith("image/")) return "El archivo debe ser una imagen.";
            return "";
        }
    }
};

export function conectarCampo(input, reglaNombre) {
    const regla = reglas[reglaNombre];
    if (!input || !regla) return;
    input.dataset.regla = reglaNombre;
    input.setAttribute("aria-describedby", idError(input));
    input.addEventListener("input", () => {
        if (regla.limpiar) input.value = regla.limpiar(input.value);
        mostrarError(input, regla.validar(input.value, input, input.form));
    });
    input.addEventListener("blur", () => mostrarError(input, regla.validar(input.value, input, input.form)));
}

export function validarFormulario(formulario, mapa) {
    let primerError = null;
    Object.entries(mapa).forEach(([selector, reglaNombre]) => {
        const input = formulario.querySelector(selector);
        const regla = reglas[reglaNombre];
        if (!input || !regla) return;
        if (regla.limpiar) input.value = regla.limpiar(input.value);
        const error = regla.validar(input.value, input, formulario);
        mostrarError(input, error);
        if (error && !primerError) primerError = input;
    });
    if (primerError) {
        primerError.focus();
        return false;
    }
    return true;
}

export function prepararFormulario(formulario, mapa) {
    Object.entries(mapa).forEach(([selector, reglaNombre]) => conectarCampo(formulario.querySelector(selector), reglaNombre));
}

export function mostrarError(input, mensaje) {
    if (!input) return;
    const error = obtenerError(input);
    input.classList.toggle("campo_invalido", Boolean(mensaje));
    input.setAttribute("aria-invalid", mensaje ? "true" : "false");
    error.textContent = mensaje ? `${mensaje} ${reglas[input.dataset.regla]?.ejemplo || ""}` : "";
}

export function limpiarTexto(valor) {
    return String(valor || "").replace(ESPACIOS, " ").trimStart();
}

function obtenerError(input) {
    let error = document.getElementById(idError(input));
    if (!error) {
        error = document.createElement("small");
        error.id = idError(input);
        error.className = "campo_error";
        input.insertAdjacentElement("afterend", error);
    }
    return error;
}

function idError(input) {
    return `${input.id || input.name}-error`;
}
