const usuarioActivo = obtenerUsuario();

/* ─────────────────────────────────
   Estado de la aplicación
───────────────────────────────── */
let user = {
  nombre:   'Antonio Suarez',
  email:    '1005.31027537@gmail.com',
  telefono: '0414-1234567',
  carrera:  'Ingeniería Telemática'
};

let ads = [
  {
    id: 1,
    titulo:  'Cálculo Diferencial',
    autor:   'Jorge Saenz',
    edicion: '3ra Edición',
    materia: 'Cálculo',
    estado:  'Nuevo',
    disponible: true,
    fecha:   '06/06/2026',
    img: ''
  },
  {
    id: 2,
    titulo:  'Teoría de Circuitos',
    autor:   'Robert Boylestad',
    edicion: '8va Edición',
    materia: 'Electrónica',
    estado:  'Usado',
    disponible: false,
    fecha:   '23/05/2026',
    img: ''
  }
];

let activeTab     = 'todos';
let pendingDelete = null;

/* ─────────────────────────────────
   Renderizar anuncios
───────────────────────────────── */
function renderAds() {
  const list = document.getElementById('adsList');
  const noAds = document.getElementById('noAds');

  let filtered = ads;
  if (activeTab === 'disponible') filtered = ads.filter(a => a.disponible);
  if (activeTab === 'vendido')    filtered = ads.filter(a => !a.disponible);

  // Actualizar contadores de tabs
  document.getElementById('cntTodos').textContent     = `(${ads.length})`;
  document.getElementById('cntDisponible').textContent = `(${ads.filter(a => a.disponible).length})`;
  document.getElementById('cntVendido').textContent    = `(${ads.filter(a => !a.disponible).length})`;

  if (filtered.length === 0) {
    list.innerHTML = '';
    noAds.classList.remove('d-none');
    return;
  }
  noAds.classList.add('d-none');

  list.innerHTML = filtered.map(ad => `
    <div class="ad-row ${ad.disponible ? '' : 'sold'}" id="adRow-${ad.id}">

      <!-- Imagen -->
      <img class="ad-img"
           src="${ad.img}"
           alt="${ad.titulo}"
           onerror="this.src=''"/>

      <!-- Info -->
      <div class="ad-info">
        <div class="ad-title">${ad.titulo}</div>
        <div class="ad-meta">Autor: ${ad.autor} &bull; Edición: ${ad.edicion} &bull; Materia: ${ad.materia}</div>
        <div class="ad-bottom">
          <span class="badge-${ad.estado === 'Nuevo' ? 'nuevo' : 'usado'}">${ad.estado}</span>
          <span class="ad-date">Publicado el ${ad.fecha}</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="ad-actions">
        <!-- Chip de estado -->
        <div class="status-chip ${ad.disponible ? 'disponible' : 'vendido'}">
          <span class="chip-dot"></span>
          ${ad.disponible ? 'Disponible' : 'Vendido'}
        </div>

        <!-- Toggle -->
        <label class="toggle-switch" title="${ad.disponible ? 'Marcar como vendido' : 'Marcar como disponible'}">
          <input type="checkbox" ${ad.disponible ? 'checked' : ''} onchange="toggleEstado(${ad.id}, this.checked)"/>
          <span class="toggle-track"></span>
        </label>

        <!-- Editar -->
        <button class="btn-ad btn-ad-edit" onclick="abrirEditarAnuncio(${ad.id})">
          <i class="bi bi-pencil"></i> Editar
        </button>

        <!-- Eliminar -->
        <button class="btn-ad btn-ad-delete" onclick="pedirEliminar(${ad.id})">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────
   Tabs
───────────────────────────────── */
function filterTab(tab, el) {
  activeTab = tab;
  document.querySelectorAll('.ads-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderAds();
}

/* ─────────────────────────────────
   Toggle disponible / vendido (RF-04)
───────────────────────────────── */
function toggleEstado(id, checked) {
  const ad = ads.find(a => a.id === id);
  if (!ad) return;
  ad.disponible = checked;
  renderAds();
  showToast(`Anuncio marcado como ${checked ? 'Disponible' : 'Vendido'}.`);
}

/* ─────────────────────────────────
   Editar perfil
───────────────────────────────── */
function abrirEditarPerfil() {
  document.getElementById('editNombre').value      = user.nombre;
  document.getElementById('editEmailLocked').textContent = user.email;
  document.getElementById('editTelefono').value    = user.telefono;
  const sel = document.getElementById('editCarrera');
  for (let opt of sel.options) { if (opt.value === user.carrera) { opt.selected = true; break; } }
  new bootstrap.Modal(document.getElementById('modalEditPerfil')).show();
}

function guardarPerfil() {
  const nombre   = document.getElementById('editNombre').value.trim();
  const telefono = document.getElementById('editTelefono').value.trim();
  const carrera  = document.getElementById('editCarrera').value;

  if (!nombre || !telefono) { alert('Por favor completa todos los campos.'); return; }

  user.nombre   = nombre;
  user.telefono = telefono;
  user.carrera  = carrera;

  document.getElementById('displayNombre').textContent   = nombre;
  document.getElementById('displayTelefono').textContent = telefono;
  document.getElementById('displayCarrera').textContent  = carrera;

  bootstrap.Modal.getInstance(document.getElementById('modalEditPerfil')).hide();
  showToast('Perfil actualizado correctamente.');
}

/* ─────────────────────────────────
   Editar anuncio
───────────────────────────────── */
function abrirEditarAnuncio(id) {
  const ad = ads.find(a => a.id === id);
  if (!ad) return;

  document.getElementById('editAdId').value       = id;
  document.getElementById('editAdTitulo').value   = ad.titulo;
  document.getElementById('editAdAutor').value    = ad.autor;
  document.getElementById('editAdEdicion').value  = ad.edicion;
  document.getElementById('editAdEstado').value   = ad.estado;

  const matSel = document.getElementById('editAdMateria');
  for (let opt of matSel.options) { if (opt.value === ad.materia) { opt.selected = true; break; } }

  // Preview de imagen actual
  const box   = document.getElementById('editPreviewBox');
  const input = box.querySelector('input[type=file]');
  box.innerHTML = '';
  const img = document.createElement('img');
  img.src = ad.img;
  img.onerror = () => { img.remove(); };
  box.appendChild(img);
  box.appendChild(input);

  new bootstrap.Modal(document.getElementById('modalEditAd')).show();
}

function previewEditImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen supera el límite de 10 MB.');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const box   = document.getElementById('editPreviewBox');
    const input = box.querySelector('input[type=file]');
    box.innerHTML = '';
    const img = document.createElement('img');
    img.src = e.target.result;
    box.appendChild(img);
    box.appendChild(input);
  };
  reader.readAsDataURL(file);
}

function guardarAnuncio() {
  const id     = parseInt(document.getElementById('editAdId').value);
  const titulo = document.getElementById('editAdTitulo').value.trim();
  const autor  = document.getElementById('editAdAutor').value.trim();
  const materia = document.getElementById('editAdMateria').value;
  const estado = document.getElementById('editAdEstado').value;
  const edicion = document.getElementById('editAdEdicion').value.trim();

  if (!titulo || !autor || !materia || !estado) { alert('Completa todos los campos obligatorios.'); return; }

  const ad = ads.find(a => a.id === id);
  if (!ad) return;
  ad.titulo  = titulo;
  ad.autor   = autor;
  ad.edicion = edicion;
  ad.materia = materia;
  ad.estado  = estado;

  const newImg = document.querySelector('#editPreviewBox img')?.src;
  if (newImg && !newImg.includes('placeholder')) ad.img = newImg;

  bootstrap.Modal.getInstance(document.getElementById('modalEditAd')).hide();
  renderAds();
  showToast('Anuncio actualizado correctamente.');
}

/* ─────────────────────────────────
   Eliminar anuncio (RNF-04: borrado lógico en BD)
───────────────────────────────── */
function pedirEliminar(id) {
  const ad = ads.find(a => a.id === id);
  if (!ad) return;
  pendingDelete = id;
  document.getElementById('deleteAdName').textContent = `"${ad.titulo}"`;
  new bootstrap.Modal(document.getElementById('modalDelete')).show();
}

function confirmarEliminar() {
  ads = ads.filter(a => a.id !== pendingDelete);
  pendingDelete = null;
  bootstrap.Modal.getInstance(document.getElementById('modalDelete')).hide();
  renderAds();
  new bootstrap.Toast(document.getElementById('toastEliminado')).show();
}

/* ─────────────────────────────────
   Toast general
───────────────────────────────── */
function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  new bootstrap.Toast(document.getElementById('toastGuardado')).show();
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
   Carga inicial
───────────────────────────────── */
renderAds();