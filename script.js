// Carrito en localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variable para almacenar los productos cargados desde el JSON
let PRODUCTOS = [];

// Cargar productos desde el archivo JSON
async function cargarProductos(filtro = "todos", terminoBusqueda = "") {
  try {
    // Si los productos aún no se han cargado, cargarlos desde el JSON
    if (PRODUCTOS.length === 0) {
      const respuesta = await fetch('productos.json');
      if (!respuesta.ok) {
        throw new Error('No se pudo cargar el archivo de productos');
      }
      PRODUCTOS = await respuesta.json();
    }
    
    const contenedor = document.getElementById('products-container');
    contenedor.innerHTML = '';
    
    // Mostrar un mensaje de carga
    contenedor.innerHTML = '<p class="loading">Cargando productos...</p>';
    
    // Aplicar filtros (categoría y búsqueda)
    let productosFiltrados = PRODUCTOS;
    
    // Filtrar por categoría si no es "todos"
    if (filtro !== "todos") {
      productosFiltrados = productosFiltrados.filter(p => p.tipo === filtro);
    }
    
    // Filtrar por término de búsqueda si existe
    if (terminoBusqueda && terminoBusqueda !== "") {
      const primeraLetra = terminoBusqueda.trim().charAt(0).toLowerCase();
      console.log("Filtrando por primera letra:", primeraLetra); // Para depuración
      
      // Filtrar productos que comienzan con la letra especificada
      productosFiltrados = productosFiltrados.filter(producto => {
        const primeraLetraNombre = producto.nombre.charAt(0).toLowerCase();
        return primeraLetraNombre === primeraLetra;
      });
      
      console.log("Productos encontrados:", productosFiltrados.length);
    }
    
    // Limpiar el contenedor
    contenedor.innerHTML = '';
    
    // Mostrar mensaje si no hay productos
    if (productosFiltrados.length === 0) {
      contenedor.innerHTML = '<p class="no-products">No se encontraron productos que coincidan con la búsqueda.</p>';
      return;
    }
    
    // Crear elementos HTML para cada producto
    productosFiltrados.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = ` 
        <div class="product-image-container">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />
          <div class="product-overlay">
            <p class="descripcion-overlay">${p.descripcion || 'Sin descripción disponible'}</p>
          </div>
        </div>
        <h3>${p.nombre}</h3>
        <p>$${p.precio.toLocaleString('es-AR')}</p>
        <button onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">Agregar al carrito</button>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    document.getElementById('products-container').innerHTML = 
      '<p class="error">Error al cargar productos. Por favor, intenta nuevamente.</p>';
  }
}

// Filtrar productos por categoría
function filtrarCategoria(tipo) {
  // Obtener el término de búsqueda actual (si existe)
  const terminoBusqueda = document.getElementById('search-input').value;
  
  // Cargar productos con el filtro de categoría y el término de búsqueda
  cargarProductos(tipo, terminoBusqueda);
  
  // Actualizar estado visual de los botones
  document.querySelectorAll('.filtros-catalogo button').forEach(btn => {
    btn.classList.remove('activo');
  });
  
  const boton = document.getElementById("btn-" + tipo);
  if (boton) {
    boton.classList.add("activo");
  }
}

// Buscar productos según el término ingresado
function buscarProductos() {
  const terminoBusqueda = document.getElementById('search-input').value.trim();
  console.log("Término de búsqueda:", terminoBusqueda); // Para depuración
  
  // Obtener categoría actualmente seleccionada
  let categoriaActual = "todos";
  document.querySelectorAll('.filtros-catalogo button').forEach(btn => {
    if (btn.classList.contains('activo')) {
      const id = btn.id;
      categoriaActual = id.replace('btn-', '');
    }
  });
  console.log("Categoría actual:", categoriaActual); // Para depuración
  
  // Mostrar mensaje de búsqueda
  if (terminoBusqueda !== "") {
    const toast = document.getElementById('toast');
    toast.textContent = `Buscando: "${terminoBusqueda}"`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.textContent = "Producto agregado ✅"; // Restaurar mensaje original
    }, 2000);
  }
  
  // Cargar productos con la categoría actual y el término de búsqueda
  cargarProductos(categoriaActual, terminoBusqueda);
}

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio) {
  // Verificar si el producto ya está en el carrito
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  
  // Guardar en localStorage y actualizar interfaz
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarToast();
  actualizarCarrito();
  actualizarContadorCarrito();
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
  const contadorMenu = document.getElementById("contador-menu");
  if (contadorMenu) {
    // Calcular cantidad total de productos
    const cantidadTotal = carrito.reduce((total, p) => total + p.cantidad, 0);
    contadorMenu.textContent = cantidadTotal;
    
    // Efecto visual cuando se actualiza
    contadorMenu.classList.add("parpadeo");
    setTimeout(() => {
      contadorMenu.classList.remove("parpadeo");
    }, 500);
  }
}

// Mostrar toast de confirmación
function mostrarToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Constantes
const NUMERO_WHATSAPP = "5491160157837";

// Enviar pedido por WhatsApp
function enviarWhatsApp() { 
  if (carrito.length === 0) {
    // Mensaje de consulta si el carrito está vacío
    let mensaje = "¡Hola! Me gustaría hacer una consulta sobre sus perfumes.%0A";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
  } else {
    // Generar mensaje con los items del carrito
    let mensaje = "¡Hola! Me gustaría hacer el siguiente pedido:%0A%0A";
    
    carrito.forEach(item => {
      mensaje += `- ${item.nombre} x${item.cantidad}: $${(item.precio * item.cantidad).toLocaleString('es-AR')}%0A`;
    });
    
    mensaje += `%0ATotal: $${calcularTotal().toLocaleString('es-AR')}%0A%0A`;
    mensaje += "Por favor, quiero coordinar el pago y la entrega. ¡Gracias!";
    
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
  }
}

// Actualizar contenido del carrito
function actualizarCarrito() {
  const lista = document.getElementById("lista-productos");
  if (!lista) return;
  
  lista.innerHTML = "";
  
  if (carrito.length === 0) {
    lista.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío</p>";
    document.querySelector(".carrito-footer .btn-enviar").textContent = "Hacer consulta";
  } else {
    // Crear elementos para cada producto
    carrito.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      
      const p = document.createElement("p");
      p.className = "item-carrito";
      
      // Crear elemento para el nombre y cantidad
      const spanNombre = document.createElement("span");
      spanNombre.textContent = `${item.nombre} x${item.cantidad}`;
      
      // Crear elemento para el precio
      const spanPrecio = document.createElement("span");
      spanPrecio.className = "precio-item";
      spanPrecio.textContent = `$${subtotal.toLocaleString('es-AR')}`;
      
      // Crear botón eliminar explícitamente
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "✕";
      btnEliminar.className = "btn-eliminar";
      // Asignar el evento directamente aquí
      btnEliminar.addEventListener("click", function(e) {
        e.stopPropagation(); // Evitar propagación
        eliminarDelCarrito(index);
      });
      
      // Añadir el botón al span de precio
      spanPrecio.appendChild(btnEliminar);
      
      // Añadir los elementos al párrafo
      p.appendChild(spanNombre);
      p.appendChild(spanPrecio);
      
      // Añadir el párrafo a la lista
      lista.appendChild(p);
    });
    
    document.querySelector(".carrito-footer .btn-enviar").textContent = "Enviar por WhatsApp";
  }
  
  // Actualizar total
  document.getElementById("total").textContent = `$${calcularTotal().toLocaleString('es-AR')}`;
}

// Calcular total del carrito
function calcularTotal() {
  return carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
  console.log("Eliminando producto en índice:", index);
  
  // Eliminar el producto del carrito
  carrito.splice(index, 1);
  
  // Guardar en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Actualizar la interfaz
  actualizarCarrito();
  actualizarContadorCarrito();
}

// Toggle panel del carrito
function toggleCarrito() {
  const panel = document.getElementById("carrito-panel");
  panel.classList.toggle("abierto");
  panel.classList.toggle("oculto");
  
  // Si estamos abriendo el carrito, actualizar contenido
  if (panel.classList.contains("abierto")) {
    actualizarCarrito();
  }
}

// Función específica para cerrar el carrito
function cerrarCarrito() {
  const panel = document.getElementById("carrito-panel");
  panel.classList.remove("abierto");
  panel.classList.add("oculto");
}

// Funcionalidad para el botón de hamburguesa
function toggleMenu() {
  const menu = document.getElementById('menu-nav');
  const hamburger = document.getElementById('hamburger-toggle');
  
  menu.classList.toggle('active');
  hamburger.classList.toggle('active');
  
  // Prevent scrolling when menu is open
  document.body.classList.toggle('menu-open');
}

// Iniciar slider automático
function initSlider() {
  // No necesita funcionalidad adicional
  // El slider ahora usa animación CSS automática
}

// Lazy loading de imágenes
function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imgObserver.observe(img);
    });
  } else {
    // Fallback para navegadores sin soporte
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

// Actualizar año del copyright
function updateCopyright() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos iniciales
  cargarProductos();
  
  // Inicializar carrito
  actualizarCarrito();
  actualizarContadorCarrito();
  
  // Inicializar slider con soporte de touch
  initSlider();
  
  // Lazy load de imágenes
  lazyLoadImages();
  
  // Actualizar año del copyright
  updateCopyright();
  
  // Event listener para toggle del menú
  document.getElementById('hamburger-toggle').addEventListener('click', toggleMenu);
  
  // Event listener para toggle del carrito
  document.getElementById('carrito-link').addEventListener('click', (e) => {
    e.preventDefault();
    toggleCarrito();
  });
  
  // Event listener para el botón de búsqueda
  document.getElementById('search-button').addEventListener('click', (e) => {
    e.preventDefault();
    buscarProductos();
    console.log("Botón de búsqueda clickeado"); // Para depuración
  });
  
  // Event listener para la búsqueda al presionar Enter
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarProductos();
      console.log("Enter presionado en búsqueda"); // Para depuración
    }
  });
  
  // Cerrar menú al seleccionar un item
  document.querySelectorAll('.menu a').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMenu();
      }
    });
  });
  
  // Cerrar carrito y menu al hacer click fuera
  document.addEventListener('click', (e) => {
    const carritoPanelIsOpen = document.getElementById('carrito-panel').classList.contains('abierto');
    const menuIsOpen = document.getElementById('menu-nav').classList.contains('active');
    
    // Si el carrito está abierto y se hace click fuera
    if (carritoPanelIsOpen && 
        !e.target.closest('#carrito-panel') && 
        !e.target.closest('#carrito-link')) {
      toggleCarrito();
    }
    
    // Si el menú está abierto y se hace click fuera
    if (menuIsOpen && !e.target.closest('#menu-nav') && !e.target.closest('#hamburger-toggle')) {
      toggleMenu();
    }
  });
});