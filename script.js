let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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
  localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardamos el carrito en localStorage
  mostrarToast();
  actualizarCarrito();
  document.getElementById('ver-carrito').style.display = 'block';

  // Actualizar el contador del carrito
  const contadorMenu = document.getElementById("contador-menu");
  if (contadorMenu) {
    // Actualizar el número de productos en el carrito
    contadorMenu.textContent = carrito.reduce((total, p) => total + p.cantidad, 0);

    // Activar el parpadeo del contador
    contadorMenu.classList.add("contador-carrito");
    setTimeout(() => {
      contadorMenu.classList.remove("contador-carrito");
    }, 500); // El parpadeo durará 0.5s
  }
}

function actualizarContadorCarrito() {
  const contadorMenu = document.getElementById("contador-menu");
  if (contadorMenu) {
    // Actualizamos el número de productos en el carrito
    const cantidadTotal = carrito.reduce((total, p) => total + p.cantidad, 0);
    contadorMenu.textContent = cantidadTotal;

    // Activar el parpadeo del contador
    contadorMenu.classList.add("contador-carrito");
    setTimeout(() => {
      contadorMenu.classList.remove("contador-carrito");
    }, 500); // El parpadeo durará 0.5s
  }
  actualizarBotonWhatsApp();  // Actualizamos el botón de WhatsApp después de modificar el carrito
}

function mostrarToast() {
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2000);
}


//MENSAJE PARA WHATSAPP
const NUMERO_WHATSAPP = "5491160157837";

function enviarWhatsApp() { 
  if (carrito.length === 0) {
    // Mensaje de consulta si el carrito está vacío
    let mensaje = "¡Hola! Me gustaría hacer una consulta.%0A";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
  } else {
    // Mensaje con los productos del carrito si hay productos
    let mensaje = "¡Hola! Me interesa realizar el siguiente pedido:%0A";
    let total = 0;

    carrito.forEach(p => {
      mensaje += `🧴 ${p.nombre} x${p.cantidad} = $${p.precio * p.cantidad}%0A`;
      total += p.precio * p.cantidad;
    });

    mensaje += `%0A----------------------------%0ATotal: $${total}`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
  }
}

// Actualizamos la visibilidad del botón flotante en función del contenido del carrito
function actualizarBotonWhatsApp() {
  const boton = document.getElementById("ver-carrito");
  
  if (carrito.length === 0) {
    // Mostrar el botón para consulta si el carrito está vacío
    boton.style.display = 'block';
  } else {
    // Mostrar el botón para mandar el pedido si el carrito tiene productos
    boton.style.display = 'block';
  }
}


window.onload = () => {
  cargarProductos();
  actualizarCarrito(); // Cargar carrito al iniciar
  actualizarContadorCarrito(); // Actualizar contador de productos
  actualizarBotonWhatsApp();  // Actualizamos el botón de WhatsApp después de modificar el carrito
}




function actualizarCarrito() {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";

  let total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  carrito.forEach((item, index) => {
    const p = document.createElement("p");
    p.innerHTML = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)} 
    <button onclick="eliminarDelCarrito(${index})">X</button>`;
    lista.appendChild(p);
  });

  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1); // Eliminar producto por índice
  localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardamos el carrito actualizado
  actualizarCarrito();
  actualizarContadorCarrito(); // Actualizar contador después de eliminar un producto
}




const linkCarrito = document.querySelector('.menu a[href="#carrito"]');
if (linkCarrito) {
  linkCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    toggleCarrito();
  });
}

function toggleCarrito() {
  const panel = document.getElementById("carrito-panel");
  panel.classList.toggle("abierto");
  panel.classList.toggle("oculto");
}

function eliminarProducto(index) {
  productos.splice(index, 1);
  actualizarCarrito();
}
