let idEditar = null;

function mostrarPreguntas() {

    fetch('/crud/preguntas')
        .then(response => response.json())
        .then(data => {

            console.log(data);

            let html = "";

            if (data.length === 0) {
                document.getElementById("preguntes").innerHTML = "<p class='text-muted'>No hi ha preguntes creades.</p>";
                return;
            }

            for (let i = 0; i < data.length; i++) {

                html += "<div class='card mb-3 border shadow-sm'>";
                html += "  <div class='card-body'>";
                html += "    <h5 class='card-title fw-bold text-primary mb-3'>" + data[i].pregunta + "</h5>";

                html += "    <div class='row row-cols-2 g-2 mb-3'>";
                html += "      <div class='col'><span class='badge bg-secondary me-1'>1</span> <img src='" + data[i].respuesta1 + "' alt='Resposta 1' class='img-thumbnail' style='height: 45px;'></div>";
                html += "      <div class='col'><span class='badge bg-secondary me-1'>2</span> <img src='" + data[i].respuesta2 + "' alt='Resposta 2' class='img-thumbnail' style='height: 45px;'></div>";
                html += "      <div class='col'><span class='badge bg-secondary me-1'>3</span> <img src='" + data[i].respuesta3 + "' alt='Resposta 3' class='img-thumbnail' style='height: 45px;'></div>";
                html += "      <div class='col'><span class='badge bg-secondary me-1'>4</span> <img src='" + data[i].respuesta4 + "' alt='Resposta 4' class='img-thumbnail' style='height: 45px;'></div>";
                html += "    </div>";

                html += "    <div class='d-flex gap-2'>";
                html += "      <button class='btn btn-warning btn-sm' onclick='editarPregunta(" + data[i].id + ")'>Editar</button>";
                html += "      <button class='btn btn-danger btn-sm' onclick='borrarPregunta(" + data[i].id + ")'>Eliminar</button>";
                html += "    </div>";

                html += "  </div>";
                html += "</div>";
            }

            document.getElementById("preguntes").innerHTML = html;

        });
}

mostrarPreguntas();


document.getElementById("crearPregunta").addEventListener("click", function () {

    let pregunta = document.getElementById("pregunta").value;
    let respuesta1 = document.getElementById("respuesta1").value;
    let respuesta2 = document.getElementById("respuesta2").value;
    let respuesta3 = document.getElementById("respuesta3").value;
    let respuesta4 = document.getElementById("respuesta4").value;
    let respuestaCorrecta = document.getElementById("respuesta_correcta").value;

    if (idEditar == null) {

        fetch('/crud/preguntas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pregunta: pregunta,
                respuesta1: respuesta1,
                respuesta2: respuesta2,
                respuesta3: respuesta3,
                respuesta4: respuesta4,
                respuesta_correcta: respuestaCorrecta
            })
        })
            .then(response => response.json())
            .then(data => {

                Swal.fire({
                    title: "Pregunta creada",
                    text: "La pregunta s'ha creat correctament.",
                    icon: "success"
                }).then(() => {
                    document.getElementById("pregunta").value = "";
                    document.getElementById("respuesta1").value = "";
                    document.getElementById("respuesta2").value = "";
                    document.getElementById("respuesta3").value = "";
                    document.getElementById("respuesta4").value = "";
                    document.getElementById("respuesta_correcta").value = "1";

                    mostrarPreguntas();
                });

            });

    } else {

        fetch('/crud/preguntas/' + idEditar, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pregunta: pregunta,
                respuesta1: respuesta1,
                respuesta2: respuesta2,
                respuesta3: respuesta3,
                respuesta4: respuesta4,
                respuesta_correcta: respuestaCorrecta
            })
        })
            .then(response => response.json())
            .then(data => {

                Swal.fire({
                    title: "Pregunta modificada",
                    text: "La pregunta se ha modificado correctamente.",
                    icon: "success"
                }).then(() => {
                    idEditar = null;

                    document.getElementById("crearPregunta").innerText = "Crear pregunta";
                    document.getElementById("crearPregunta").className = "btn btn-success w-100 fw-bold";

                    document.getElementById("pregunta").value = "";
                    document.getElementById("respuesta1").value = "";
                    document.getElementById("respuesta2").value = "";
                    document.getElementById("respuesta3").value = "";
                    document.getElementById("respuesta4").value = "";
                    document.getElementById("respuesta_correcta").value = "1";

                    mostrarPreguntas();
                });

            });

    }

});

function editarPregunta(id) {

    fetch('/crud/preguntas/' + id)
        .then(response => response.json())
        .then(data => {

            document.getElementById("pregunta").value = data.pregunta;
            document.getElementById("respuesta1").value = data.respuesta1;
            document.getElementById("respuesta2").value = data.respuesta2;
            document.getElementById("respuesta3").value = data.respuesta3;
            document.getElementById("respuesta4").value = data.respuesta4;

            document.getElementById("respuesta_correcta").value = data.respuesta_correcta;

            idEditar = id;

            document.getElementById("crearPregunta").innerText = "Modificar pregunta";
            document.getElementById("crearPregunta").className = "btn btn-warning w-100 fw-bold";

        });

}

function borrarPregunta(id) {

    Swal.fire({
        title: "Estàs segur?",
        text: "Aquesta pregunta s'eliminarà.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancel·lar"
    }).then((resultado) => {

        if (resultado.isConfirmed) {

            fetch('/crud/preguntas/' + id, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {

                    Swal.fire({
                        title: "Eliminada!",
                        text: "La pregunta s'ha eliminat correctament.",
                        icon: "success"
                    }).then(() => {
                        mostrarPreguntas();
                    });

                });

        }

    });

}