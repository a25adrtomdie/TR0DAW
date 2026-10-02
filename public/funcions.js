let nomGuardat = localStorage.getItem("nom");

if (nomGuardat) {
  document.getElementById("usuari").innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span class="fw-bold">Hola ${nomGuardat}!</span>
            <button id="borrarNom" class="btn btn-outline-danger btn-sm">Esborrar nom</button>
        </div>
    `;
} else {
  document.getElementById("usuari").innerHTML = `
        <div class="input-group">
            <input type="text" id="nom" class="form-control" placeholder="Escriu el teu nom">
            <button id="guardarNom" class="btn btn-primary">Guardar nom</button>
        </div>
    `;
}

document.getElementById("usuari").addEventListener("click", function (e) {
  if (e.target.id == "guardarNom") {
    let nom = document.getElementById("nom").value;
    localStorage.setItem("nom", nom);
    document.getElementById("usuari").innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold">Hola ${nom}!</span>
                <button id="borrarNom" class="btn btn-outline-danger btn-sm">Esborrar nom</button>
            </div>
        `;
  }

  if (e.target.id == "borrarNom") {
    localStorage.removeItem("nom");
    document.getElementById("usuari").innerHTML = `
            <div class="input-group">
                <input type="text" id="nom" class="form-control" placeholder="Escriu el teu nom">
                <button id="guardarNom" class="btn btn-primary">Guardar nom</button>
            </div>
        `;
  }
});

let sessionId;
let contador;

fetch('/preguntas')
  .then(response => response.json())
  .then(data => {
    console.log("Dades carregades!", data);

    sessionId = data.sessionId;

    iniciarPartida(data.questions);
  });

const NPREG = 10;
let preguntesPartida = [];

function iniciarPartida(preguntes) {

  preguntesPartida = preguntes;

  let tiempo = 30;
  document.getElementById("tiempo").innerHTML = "⏱ Temps: " + tiempo + "s";

  contador = setInterval(function () {
    tiempo--;
    document.getElementById("tiempo").innerHTML = "⏱ Temps: " + tiempo + "s";

    if (tiempo == 0) {
      clearInterval(contador);
      Swal.fire({
        title: "Temps acabat!",
        text: "S'ha acabat el temps de la partida.",
        icon: "warning"
      });
    }
  }, 1000);

  let html = "";

  for (let i = 0; i < NPREG; i++) {
    html += "<div class='card mb-4 border shadow-sm p-3' data-id-preg='" + i + "'>";
    html += "<h4 class='card-title text-primary fw-bold mb-3'>" + (i + 1) + ". " + preguntes[i].pregunta + "</h4>";

    html += "<div class='row row-cols-2 g-2'>";
    for (let j = 0; j < preguntes[i].respostes.length; j++) {
      html += "<div class='col'>";
      html += "  <button data-id-preg='" + i + "' data-id-resp='" + j + "' class='btn btn-outline-primary p-2 w-100 btnRespuesta d-flex align-items-center justify-content-center' style='height: 70px;'>";
      html += "    <img src='" + preguntes[i].respostes[j] + "' class='img-fluid' style='max-height: 50px;'>";
      html += "  </button>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";
  }

  document.getElementById("partida").innerHTML = html;

  document.getElementById("partida").addEventListener("click", function (e) {
    let boton = e.target.closest(".btnRespuesta");
    if (boton) {
      marcar(boton.dataset.idPreg, boton.dataset.idResp);
    }
  });
}

let estatDeLaPartida = {
  contadorPreguntes: 0,
  respostesUsuari: new Array(NPREG).fill(null)
};

function marcar(preg, resp) {
  let parentCard = document.querySelectorAll("[data-id-preg='" + preg + "']")[0];
  let botones = parentCard.querySelectorAll(".btnRespuesta");
  botones.forEach(b => {
    b.classList.remove("btn-primary", "text-white");
    b.classList.add("btn-outline-primary");
  });

  let botonSeleccionado = Array.from(botones).find(b => b.dataset.idResp == resp);
  if (botonSeleccionado) {
    botonSeleccionado.classList.remove("btn-outline-primary");
    botonSeleccionado.classList.add("btn-primary", "text-white");
  }

  if (estatDeLaPartida.respostesUsuari[preg] == null) {
    estatDeLaPartida.contadorPreguntes++;
  }

  estatDeLaPartida.respostesUsuari[preg] = {
    pr: preguntesPartida[preg].id,
    resp: resp
  };

  renderMarcador();

  if (estatDeLaPartida.contadorPreguntes == NPREG) {
    document.getElementById("enviarResultados").classList.remove("d-none");
  }
}

function renderMarcador() {
  let pctActual = (estatDeLaPartida.contadorPreguntes / NPREG) * 100;

  document.getElementById("marcador").innerHTML = `
    <div class="text-end">
        <small class="fw-bold d-block mb-1">Respostes: ${estatDeLaPartida.contadorPreguntes} / ${NPREG}</small>
        <div class="progress" style="height: 12px; min-width: 140px;">
          <div class="progress-bar bg-success" role="progressbar"
            style="width: ${pctActual}%"
            aria-valuenow="${pctActual}"
            aria-valuemin="0"
            aria-valuemax="100">
          </div>
        </div>
    </div>
  `;
}

document.getElementById("enviarResultados").addEventListener("click", function () {

  clearInterval(contador);

  fetch("/finalitza", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId: sessionId,
      respuestas: estatDeLaPartida.respostesUsuari
    })
  })
    .then(response => response.json())
    .then(data => {
      Swal.fire({
        title: "Partida acabada",
        text: "Has encertat " + data.correctes + " de " + data.total,
        icon: "success"
      });
    });

});