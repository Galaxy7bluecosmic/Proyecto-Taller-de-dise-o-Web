```md
# BocadosDeAyuda

## Cómo ver la página
## Importante tener Xamp instalado
1. Descarga o clona el proyecto.

2. Copia la carpeta del proyecto dentro de la carpeta de XAMPP:

   ```txt
   C:\xampp\htdocs\
   ```

   La ruta final debe quedar así:

   ```txt
   C:\xampp\htdocs\PRUEBAHTML
   ```

3. Abre XAMPP y enciende el servicio **Apache**.

4. En el navegador entra a:

   ```txt
   http://localhost/PRUEBAHTML/
   ```

5. Para abrir páginas específicas puedes usar:

   ```txt
   http://localhost/PRUEBAHTML/index.html
   http://localhost/PRUEBAHTML/menu.html
   http://localhost/PRUEBAHTML/promociones.html
   http://localhost/PRUEBAHTML/pedidos.html
   http://localhost/PRUEBAHTML/form_pedidos.html
   http://localhost/PRUEBAHTML/login.html
   http://localhost/PRUEBAHTML/registrar.html
   ```

## Importante

Si la página se ve desactualizada, recarga con:

```txt
Ctrl + F5
```

Si no tiene XAMPP, puede ver la página con un servidor local simple.

```md
## Si no tienes XAMPP

También puedes abrir el proyecto usando Python.

1. Abre una terminal dentro de la carpeta del proyecto.

   Ejemplo:

   ```txt
   C:\Users\TU_USUARIO\Documents\PRUEBAHTML
   ```

2. Ejecuta este comando:

   ```bash
   python -m http.server 5500
   ```

3. Abre el navegador y entra a:

   ```txt
   http://localhost:5500/
   ```

4. Si tus archivos están dentro de una subcarpeta llamada `PRUEBAHTML`, entra a:

   ```txt
   http://localhost:5500/PRUEBAHTML/
   ```

## Nota

No se recomienda abrir los archivos solo con doble clic, porque algunas funciones de JavaScript pueden no cargar correctamente. Es mejor usar XAMPP o `python -m http.server`.
```

Esto fuerza al navegador a cargar nuevamente los archivos CSS y JavaScript.
```
