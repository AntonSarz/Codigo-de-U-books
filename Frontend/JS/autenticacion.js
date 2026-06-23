/* ─────────────────────────────────
toggle ver/ocultar contraseña 
───────────────────────────────── */
function togglePass(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon  = document.getElementById(iconId);
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye';
      } else {
        input.type = 'password';
        icon.className = 'bi bi-eye-slash';
      }
    }

    /* ─────────────────────────────────
    validar que las contraseñas coincidan 
    ───────────────────────────────── */
    function checkPasswords() {
      const p1  = document.getElementById('pass1').value;
      const p2  = document.getElementById('pass2').value;
      const err = document.getElementById('passError');
      if (p2.length > 0 && p1 !== p2) {
        err.style.display = 'block';
      } else {
        err.style.display = 'none';
      }
    }

    /* ─────────────────────────────────
    habilitar boton de registro al aceptar los terminos 
    ───────────────────────────────── */
    function toggleBtn() {
      const checked = document.getElementById('terminos').checked;
      document.getElementById('btnRegistrar').disabled = !checked;
    }

    /*--- Rutas de navegacion para logoReturn ---*/
    const NAVIGATION_ROUTES = {
      registro: 'registro.html',
      catalogo: 'catalogo.html',
      login: 'login.html',
      perfil: 'perfil.html',
      default: 'catalogo.html'
    };

    const getReturnTarget = (paramKey) => {
      const key = String(paramKey || '').trim();
      return NAVIGATION_ROUTES[key] || NAVIGATION_ROUTES.default;
    };

    const applyLogoReturnLink = () => {
      const params = new URLSearchParams(window.location.search);
      const target = getReturnTarget(params.get('from'));
      const logo = document.getElementById('logoReturn');
      if (logo) logo.href = target;
    };

    document.addEventListener('DOMContentLoaded', applyLogoReturnLink);

    /* ────────────────────────────────── 
    Resaltar sección activa en el índice al hacer scroll  
    ────────────────────────────────── */
    const sections = document.querySelectorAll('.term-section[id]');
    const tocLinks  = document.querySelectorAll('.toc-list a');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

sections.forEach(s => observer.observe(s));


/* ─────────────────────────────────
    Cargar carreras dinamicamente desde la BD
───────────────────────────────── */
const selectCarrera = document.getElementById('carrera');
if (selectCarrera) {
  fetch('http://localhost:3000/api/carreras')
  .then(res => res.json())
  .then(carreras => {
    carreras.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id_carrera;
      opt.textContent = c.nombre;
      selectCarrera.appendChild(opt);
    });
  })
  .catch(error => console.error('Error cargando carreras:', error));
}


/*─────────────────────────────────
Submit del formulario de login 
───────────────────────────────── */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

  // extraer datos del formulario
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // enviar datos al servidor
  try {
    const res = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
  
    if (!res.ok) {
      // Mostrar el error debajo del formulario sin recargar la pagina
      document.getElementById('loginError').textContent = data.error;
      document.getElementById('loginError').style.display = 'block';
      return;
    }

    // Si va todo bien, guardar los datos del usuario en sessionStorage
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
    window.location.href = 'catalogo.html'; // Redirigir al catalogo

  } catch (error) {
    console.error('Error al iniciar sesion:', error);
  }
 });
}

/* ─────────────────────────────────
  Submit del formulario de registro
  ───────────────────────────────── */
const registroForm = document.getElementById('registroForm');
if (registroForm) {
  registroForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validar que las contraseñas coincidan antes de enviar
    const pass1 = document.getElementById('pass1').value;
    const pass2 = document.getElementById('pass2').value;
    if (pass1 !== pass2) {
      document.getElementById('passError').style.display = 'block';
      return;
    }

    // extraer datos del formulario
    const body = {
      nombre_completo: document.getElementById('nombre').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      password: pass1,
      id_carrera: document.getElementById('carrera').value,
      acepto_terminos: document.getElementById('terminos').checked
    };

    // enviar datos al servidor
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        // Mostrar error (por ejemplo: "Ese correo ya esta registrado")
        document.getElementById('registroError').textContent = data.error;
        document.getElementById('registroError').style.display = 'block';
        return;
      }

      // Registro exitoso, redirigir al login
      window.location.href = 'login.html';

    } catch (error) {
      console.error('Error al registrarse:', error);
    }
  });
}