/* ─────────────────────────────────
   Verificar sesión
───────────────────────────────── */
const usuarioActivo = obtenerUsuario();

/* ─────────────────────────────────
  Estado de la aplicacion
───────────────────────────────── */
let allBooks = [];
let visibleBooks = [];

/* ─────────────────────────────────
  Cargar anuncios
───────────────────────────────── */
async function cargarAnuncios() {
  try {
    const res = await fetch('http://localhost:3000/api/anuncios');
    allBooks = await res.json();
    visibleBooks = [...allBooks];
    sortBooks();
  } catch (error) {
    console.error('Error al cargar anuncios:',)
  }
}

/* ─────────────────────────────────
   Renderizar tarjetas
───────────────────────────────── */
function renderBooks(books) {
  const grid     = document.getElementById('booksGrid');
  const noResult = document.getElementById('noResults');

  if (books.length === 0) {
    grid.innerHTML = '';
    noResult.classList.remove('d-none');
    return;
  }
  noResult.classList.add('d-none');

  grid.innerHTML = books.map(b => `
    <div class="book-card">
      <div class="book-img-wrapper">
        <img src="${b.img}" alt="${b.titulo}" onerror="this.src=''"/>
        <span class="badge-estado badge-${b.estado === 'Nuevo' ? 'nuevo' : 'usado'}">${b.estado}</span>
      </div>
      <div class="book-body">
        <div class="book-title">${b.titulo}</div>
        <div class="book-author">${b.autor}</div>
        <div class="book-edicion">${b.edicion}</div>
        <div class="book-materia">${b.materia}</div>
        <a href="https://wa.me/58${b.telefono.replace(/^0/,'')}?text=${encodeURIComponent('Hola, vi tu anuncio de "' + b.titulo + '" en U-Books y me interesa.')}"
           class="btn-contacto" target="_blank" rel="noopener">
          Ver contacto <i class="bi bi-whatsapp wa-icon"></i>
        </a>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────
   Filtrar
───────────────────────────────── */
function limpiarTexto(searchInput) {
  return searchInput
    // 1. Separa las letras de sus acentos (ej: "á" se vuelve "a" + "´")
    .normalize("NFD") 
    // 2. Elimina los símbolos de los acentos usando una expresión regular
    .replace(/[\u0300-\u036f]/g, "") 
    // 3. Pasa todo a minúsculas para que "C" y "c" sean iguales
    .toLowerCase(); 
}

function toggleCheckbox(elementoClickeado) {
  if (elementoClickeado.id === 'chkNuevo' && elementoClickeado.checked) {
    document.getElementById('chkUsado').checked = false;
  } 
  else if (elementoClickeado.id === 'chkUsado' && elementoClickeado.checked) {
    document.getElementById('chkNuevo').checked = false;
  }
}

function filterBooks() {
  const query   = limpiarTexto(document.getElementById('searchInput').value);
  const materia = document.getElementById('filterMateria').value;
  const nuevo   = document.getElementById('chkNuevo').checked;
  const usado   = document.getElementById('chkUsado').checked;

  visibleBooks = allBooks.filter(b => {
    const matchSearch  = !query || limpiarTexto(b.titulo).includes(query) || limpiarTexto(b.autor).includes(query);
    const matchMateria = !materia || b.materia === materia;
    const matchEstado  = (!nuevo && !usado) || (nuevo && b.estado === 'Nuevo') || (usado && b.estado === 'Usado');
    return matchSearch && matchMateria && matchEstado;
  });

  sortBooks();
}

/* ─────────────────────────────────
   Ordenar
───────────────────────────────── */
function sortBooks() {
  const sort = document.getElementById('sortSelect').value;
  const copy = [...visibleBooks];

  if (sort === 'az') copy.sort((a,b) => a.titulo.localeCompare(b.titulo));
  else if (sort === 'za') copy.sort((a,b) => b.titulo.localeCompare(a.titulo));
  else copy.sort((a,b) => b.fecha - a.fecha);

  renderBooks(copy);
}

/* ─────────────────────────────────
   Limpiar filtros
───────────────────────────────── */
function clearFilters() {
  document.getElementById('searchInput').value    = '';
  document.getElementById('filterMateria').value  = '';
  document.getElementById('chkNuevo').checked     = false;
  document.getElementById('chkUsado').checked     = false;
  visibleBooks = [...allBooks];
  sortBooks();
}

/* ─────────────────────────────────
   Dropdown Mi Perfil
───────────────────────────────── */
function toggleDropdown() {
  document.getElementById('profileDropdown').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const wrapper = document.querySelector('.profile-wrapper');
  if (!wrapper.contains(e.target)) {
    document.getElementById('profileDropdown').classList.remove('open');
  }
});

/* ─────────────────────────────────
    Cargar materias dinamicamente desde la BD
───────────────────────────────── */
async function cargarMaterias() {
  const selectFiltro = document.getElementById('filterMateria');
  const selectModal = document.getElementById('aMateria');

  // Limpiamos las opciones anteriores
  if (selectFiltro) selectFiltro.innerHTML = '<option value="">Seleccionar materia</option>';
  if (selectModal)  selectModal.innerHTML  = '<option value="" disabled selected>Selecciona la materia</option>';

  try {
    const res = await fetch('http://localhost:3000/api/materias');
    const materias = await res.json();

    materias.forEach(m => {
      // 1. LLenar el select del filtro, usando el nombre para compara texto
      if (selectFiltro) {
        const opt = document.createElement('option');
        opt.value = m.nombre;
        opt.textContent = m.nombre;
        selectFiltro.appendChild(opt);
      }

      // 2. LLenar el select del modal, usando el id_materia para la DB
      if (selectModal) {
        const opt = document.createElement('option');
        opt.value = m.id_materia;
        opt.textContent = m.nombre;
        selectModal.appendChild(opt);
      }
    });
    } catch (error) {
      console.error('Error al cargar las materias:', error);
    }
  }

/* ─────────────────────────────────
   Modal Crear Anuncio
───────────────────────────────── */
function togglePublish() {
  const checked = document.getElementById('terminosAnuncio').checked;
  document.getElementById('btnPublicar').disabled = !checked;
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tamaño (10 MB = 10 * 1024 * 1024)
  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen supera el límite de 10 MB. Por favor elige una imagen más pequeña.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const box = document.getElementById('previewBox');
    // Eliminar contenido previo excepto el input
    const input = box.querySelector('input[type=file]');
    box.innerHTML = '';
    const img = document.createElement('img');
    img.src = e.target.result;
    box.appendChild(img);
    box.appendChild(input);
  };
  reader.readAsDataURL(file);
}

function publicarAnuncio() {
  const titulo  = document.getElementById('aTitulo').value.trim();
  const autor   = document.getElementById('aAutor').value.trim();
  const materia = document.getElementById('aMateria').value;
  const edicion = document.getElementById('aEdicion').value.trim();
  const estado  = document.getElementById('aEstado').value;

  if (!titulo || !autor || !materia || !estado) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  // Agregar el nuevo libro al catálogo
  const nuevo = {
    titulo,
    autor,
    materia,
    edicion,
    estado,
    telefono: '04140000000',
    img: document.querySelector('#previewBox img')?.src ||
         'https://via.placeholder.com/300x175?text=Sin+imagen',
    fecha: Date.now()
  };
  allBooks.unshift(nuevo);
  visibleBooks = [...allBooks];

  // Cerrar modal, limpiar y mostrar toast
  bootstrap.Modal.getInstance(document.getElementById('modalAnuncio')).hide();
  resetModal();
  sortBooks();

  const toast = new bootstrap.Toast(document.getElementById('toastPublicado'));
  toast.show();
}

function resetModal() {
  document.getElementById('aTitulo').value  = '';
  document.getElementById('aAutor').value   = '';
  document.getElementById('aEdicion').value = '';
  document.getElementById('aMateria').value = '';
  document.getElementById('aEstado').value  = '';
  document.getElementById('terminosAnuncio').checked = false;
  document.getElementById('btnPublicar').disabled = true;
  const box   = document.getElementById('previewBox');
  const input = box.querySelector('input[type=file]');
  box.innerHTML = `
    <i class="bi bi-cloud-arrow-up" style="font-size:1.8rem;"></i>
    <span>Haz clic para subir una imagen (máx. 10 MB)</span>
  `;
  box.appendChild(input);
  input.value = '';
}

// Limpiar modal al cerrarlo
document.getElementById('modalAnuncio').addEventListener('hidden.bs.modal', resetModal);

/* ─────────────────────────────────
   Carga inicial
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
CargarAnuncios();
cargarMaterias();
});
