const express = require('express');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = Number(process.argv[2]) || 20333;

const sessions = new Map();

app.use(express.json());
app.use(express.static('../public'));

async function conectarBD() {
    return await mysql.createConnection({
        host: "db",
        user: "user",
        password: "user",
        database: "juego_banderas",
        charset: "utf8mb4"
    });
} // LOCAL / DOCKER

/*
async function conectarBD() {
    return await mysql.createConnection({
        host: "localhost",
        user: "a25adrtomdie_TR0DAW",
        password: "d+Klv#;V_uv3636;",
        database: "a25adrtomdie_TR0DAW",
        charset: "utf8mb4"
    });
}*/ //PRODUCCIO

app.get('/preguntas', async (req, res) => {
    const sessionId = uuidv4();
    let con;

    try {
        con = await conectarBD();

        const [preguntas] = await con.query("SELECT * FROM PREGUNTAS");

        preguntas.sort(() => Math.random() - 0.5);
        const selectedQuestions = preguntas.slice(0, 10);

        const clientQuestions = selectedQuestions.map(q => {
            const opciones = [
                { url: q.respuesta1, idOriginal: "1" },
                { url: q.respuesta2, idOriginal: "2" },
                { url: q.respuesta3, idOriginal: "3" },
                { url: q.respuesta4, idOriginal: "4" }
            ];

            opciones.sort(() => Math.random() - 0.5);

            return {
                id: q.id,
                pregunta: q.pregunta,
                respostes: opciones.map(o => o.url),
                correctaIndex: opciones.findIndex(o => o.idOriginal == q.respuesta_correcta)
            };
        });

        sessions.set(sessionId, { questions: clientQuestions });

        res.json({
            sessionId: sessionId,
            questions: clientQuestions
        });

    } catch (error) {
        console.log("Error obteniendo preguntas:", error);
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.get('/crud/preguntas', async (req, res) => {
    let con;
    try {
        con = await conectarBD();
        const [preguntas] = await con.query("SELECT * FROM PREGUNTAS");
        res.json(preguntas);
    } catch (error) {
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.get('/crud/preguntas/:id', async (req, res) => {
    const id = req.params.id;
    let con;
    try {
        con = await conectarBD();
        const [resultado] = await con.query("SELECT * FROM PREGUNTAS WHERE id = ?", [id]);
        if (resultado.length === 0) return res.status(404).json({ error: "Pregunta no encontrada" });
        res.json(resultado[0]);
    } catch (error) {
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.post('/crud/preguntas', async (req, res) => {
    const { pregunta, respuesta1, respuesta2, respuesta3, respuesta4, respuesta_correcta } = req.body;
    if (!pregunta || !respuesta1 || !respuesta2 || !respuesta3 || !respuesta4) {
        return res.status(400).json({ error: "Faltan datos" });
    }
    let con;
    try {
        con = await conectarBD();
        const sql = `INSERT INTO PREGUNTAS (pregunta, respuesta1, respuesta2, respuesta3, respuesta4, respuesta_correcta) VALUES (?, ?, ?, ?, ?, ?)`;
        const [resultado] = await con.query(sql, [pregunta, respuesta1, respuesta2, respuesta3, respuesta4, respuesta_correcta]);
        res.status(201).json({ mensaje: "Pregunta creada", id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.put('/crud/preguntas/:id', async (req, res) => {
    const id = req.params.id;
    const { pregunta, respuesta1, respuesta2, respuesta3, respuesta4, respuesta_correcta } = req.body;
    if (!pregunta || !respuesta1 || !respuesta2 || !respuesta3 || !respuesta4) {
        return res.status(400).json({ error: "Faltan datos" });
    }
    let con;
    try {
        con = await conectarBD();
        const sql = `UPDATE PREGUNTAS SET pregunta = ?, respuesta1 = ?, respuesta2 = ?, respuesta3 = ?, respuesta4 = ?, respuesta_correcta = ? WHERE id = ?`;
        const [resultado] = await con.query(sql, [pregunta, respuesta1, respuesta2, respuesta3, respuesta4, respuesta_correcta, id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ error: "Pregunta no encontrada" });
        res.json({ mensaje: "Pregunta modificada" });
    } catch (error) {
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.delete('/crud/preguntas/:id', async (req, res) => {
    const id = req.params.id;
    let con;
    try {
        con = await conectarBD();
        const [resultado] = await con.query("DELETE FROM PREGUNTAS WHERE id = ?", [id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ error: "Pregunta no encontrada" });
        res.json({ mensaje: "Pregunta eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error con la base de datos" });
    } finally {
        if (con) await con.end();
    }
});

app.post('/finalitza', (req, res) => {

    const sessionId = req.body.sessionId;
    const respuestas = req.body.respuestas;

    let partida = sessions.get(sessionId);

    if (!partida) {
        console.log("No se ha encontrado la partida");
        return res.status(404).json({ error: "Partida no encontrada" });
    }

    let correctas = 0;

    for (let i = 0; i < respuestas.length; i++) {

        let pregunta = partida.questions.find(q => q.id == respuestas[i].pr);

        if (pregunta) {

            if (pregunta.correctaIndex == respuestas[i].resp) {
                correctas++;
            }

        }
    }

    res.json({
        total: respuestas.length,
        correctes: correctas
    });

});

app.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
});