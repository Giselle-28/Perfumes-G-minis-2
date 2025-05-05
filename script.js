let carrito = [];

async function cargarProductos(filtro = "todos") {
  const respuesta = await fetch('productos.json');
  const productos = await respuesta.json();
  const contenedor = document.getElementById('products-container');
  contenedor.innerHTML = '';
  productos
    .filter(p => filtro === "todos" || p.tipo === filtro)
    .forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" />
        <h3>${p.nombre}</h3>
        <p>$${p.precio}</p>
        <button onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">Agregar al carrito</button>
      `;
      contenedor.appendChild(div);
    });
}

function filtrarCategoria(tipo) {
  cargarProductos(tipo);
  document.querySelectorAll('.filtros-catalogo button').forEach(btn => {
    btn.classList.remove('activo');
  });

  // Agregar clase activo al botón actual
  const boton = document.getElementById("btn-" + tipo);
  if (boton) {
    boton.classList.add("activo");
  }
}

function agregarAlCarrito(nombre, precio) {
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  mostrarToast();
  actualizarCarrito(); // actualiza el contenido visible
  document.getElementById('ver-carrito').style.display = 'block';
}

function mostrarToast() {
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2000);
}

function enviarWhatsApp() {
  if (carrito.length === 0) return alert('Tu carrito está vacío');
  let mensaje = "¡Hola! Me interesa realizar el siguiente pedido:%0A";
  let total = 0;
  carrito.forEach(p => {
    mensaje += `🧴 ${p.nombre} x${p.cantidad} = $${p.precio * p.cantidad}%0A`;
    total += p.precio * p.cantidad;
  });
  mensaje += `%0A----------------------------%0ATotal: $${total}`;
  window.open(`https://wa.me/5491112345678?text=${mensaje}`, '_blank');
}

window.onload = () => cargarProductos();

function actualizarCarrito() {
  const contenedor = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  contenedor.innerHTML = '';

  let sumaTotal = 0;

  carrito.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'item-carrito';
    div.innerHTML = `
      <strong>${item.nombre}</strong><br>
      Cantidad: ${item.cantidad} - $${item.precio * item.cantidad}
      <button onclick="eliminarDelCarrito(${index})">❌</button>
      <hr>
    `;
    contenedor.appendChild(div);
    sumaTotal += item.precio * item.cantidad;
  });

  total.textContent = `Total: $${sumaTotal}`;
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1); // elimina por posición
  actualizarCarrito(); // actualiza la vista
}

