const fs = require('fs');
const mysql = require('mysql2/promise');

const preguntasJSON = JSON.parse(
    fs.readFileSync('./preguntes_flagsapi.json', 'utf8')
);

const correctesJSON = JSON.parse(
    fs.readFileSync('./respostes_correctes.json', 'utf8')
);

const preguntas = preguntasJSON.preguntes;
const respuestasCorrectas = correctesJSON.respostes_correctes;

async function migrar() {

    const con = await mysql.createConnection({
        host: "localhost",
        user: "a25adrtomdie_TR0DAW",
        password: "d+Klv#;V_uv3636;",
        database: "a25adrtomdie_TR0DAW",
        charset: "utf8mb4"
    });

    try {

        await con.query("TRUNCATE TABLE PREGUNTAS");

        for (const pregunta of preguntas) {

            const correcta = respuestasCorrectas.find(
                r => r.pregunta_id === pregunta.id
            );

            const posicionCorrecta = correcta.resposta_correcta_id - 1;

            const respuesta1 =
                pregunta.respostes[posicionCorrecta];

            const respuestasIncorrectas =
                pregunta.respostes.filter(
                    (_, index) => index !== posicionCorrecta
                );

            const respuesta2 = respuestasIncorrectas[0];
            const respuesta3 = respuestasIncorrectas[1];
            const respuesta4 = respuestasIncorrectas[2];

            const sql = `
                INSERT INTO PREGUNTAS
                (id, pregunta, respuesta1, respuesta2, respuesta3, respuesta4)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await con.query(sql, [
                pregunta.id,
                pregunta.pregunta,
                respuesta1,
                respuesta2,
                respuesta3,
                respuesta4
            ]);
        }

        console.log("Migració completada!");
        console.log("Preguntes migrades:", preguntas.length);

    } catch (error) {

        console.log("Error durant la migració:", error);

    } finally {

        await con.end();

    }
}

migrar();