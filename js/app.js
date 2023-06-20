// ==============VARIABLES Y SELECTORES=============
// =================================================

const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

// ================EVENT LISTENERS==================
// =================================================

eventListeners();

function eventListeners() {
  document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

  formulario.addEventListener("submit", agregarGasto);
}

// ====================CLASES====================
// =================================================

class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );

    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);

    this.calcularRestante();
  }
}

// ==============

class UI {
  insertarPresupuesto(cantidad) {
    // Se extraen valores
    const { presupuesto, restante } = cantidad;

    // Se inserta el presupuesto en el div que lo muestra en el html
    document.querySelector("#total").textContent = presupuesto;

    // Se inserta el restante en el div que lo muestra en el html
    document.querySelector("#restante").textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    // Crear div para la alerta
    const divMensaje = document.createElement("DIV");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    // Agregar el mensaje
    divMensaje.textContent = mensaje;

    // Insertar en el html
    document.querySelector(".primario").insertBefore(divMensaje, formulario);

    // Remover alerta
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    // Limpia el html previo
    this.limpiarHTML();

    // Iterar sobre los gastos
    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;

      // Crear LI
      const nuevoGasto = document.createElement("LI");
      nuevoGasto.className =
        "list-group-item d-flex justify-content-between align-items-center";
      nuevoGasto.setAttribute("data-id", id);

      // Agregar el html del gasto
      nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'>${cantidad} €</span>`;

      // Boton para borrar

      const btnBorrar = document.createElement("button");
      btnBorrar.textContent = "Eliminar";
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");

      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      nuevoGasto.appendChild(btnBorrar);

      // Agregar al html
      gastoListado.appendChild(nuevoGasto);
    });
  }

  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante) {
    // Se inserta el restante en el div que lo muestra en el html
    document.querySelector("#restante").textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;

    const restanteDiv = document.querySelector(".restante");

    // Comprobar 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success");
      restanteDiv.classList.add("alert-warning");
    } else {
      restanteDiv.classList.remove("alert-danger", "alert-warning");
      restanteDiv.classList.add("alert-success");
    }
    formulario.querySelector('button[type="submit"]').disabled = false;

    // Si el total es menor a 0
    if (restante <= 0) {
      ui.imprimirAlerta("No hay más presupuesto disponible", "error");

      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

// Instanciar UI a nivel general
const ui = new UI();

// Variable que contiene el presupuesto general
let presupuesto;

// ====================FUNCIONES====================
// =================================================

function preguntarPresupuesto() {
  const presupuestoUsuario = prompt("¿Cuál es tu presupuesto disponible?");

  if (
    presupuestoUsuario === "" ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }

  presupuesto = new Presupuesto(presupuestoUsuario);

  ui.insertarPresupuesto(presupuesto);
}

// ==============================

// Funcion que añade un gasto

function agregarGasto(e) {
  e.preventDefault();

  // Leemos el input del nombre del gasto
  const nombre = document.querySelector("#gasto").value;

  // Leemos el input de la cantidad del gasto
  const cantidad = parseFloat(document.querySelector("#cantidad").value);

  // Validacion
  if (nombre === "" || cantidad === "") {
    ui.imprimirAlerta("Ambos campos son obligatorios", "error");

    return;
  } else if (isNaN(cantidad) || cantidad <= 0) {
    ui.imprimirAlerta("Cantidad no válida", "error");

    return;
  }

  // Generar un objeto con el gasto completo
  const gasto = {
    nombre,
    cantidad,
    id: Date.now(),
  };

  // Se agrega el gasto al array de gastos
  presupuesto.nuevoGasto(gasto);

  // Alerta de que se ha agregado correctamente el gasto
  ui.imprimirAlerta("Gasto agregado correctamente");

  // Mostrar los gastos en el html
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);

  // Reinicia el formulario
  formulario.reset();
}

function eliminarGasto(id) {
  // Elimina los gastos del objeto
  presupuesto.eliminarGasto(id);

  // Elimina los gastos del HTML
  const { gastos, restante } = presupuesto;

  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuesto);
}
