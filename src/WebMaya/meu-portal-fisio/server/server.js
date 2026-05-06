const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const { db, uploadsDir } = require('./database');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'maya-yamamoto-secret';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({ storage });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

function validateRequiredFields(fields, body) {
  return fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token ausente.' });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

function buildRecordPayload(body, patient) {
  const parseArray = (value) => Array.isArray(value) ? value : [];

  return {
    identificacao: {
      nome: body.nome || patient.name,
      dataNascimento: body.data_nascimento || patient.birth_date,
      telefone: body.telefone || patient.phone || '',
      sexo: body.sexo || '',
      cidade: body.cidade || '',
      bairro: body.bairro || '',
      profissao: body.profissao || '',
      enderecoResidencial: body.endereco_residencial || '',
      enderecoComercial: body.endereco_comercial || '',
      naturalidade: body.naturalidade || '',
      estadoCivil: body.estado_civil || '',
      diagnosticoClinico: body.diagnostico_clinico || '',
      diagnosticoFisioterapeutico: body.diagnostico_fisioterapeutico || '',
    },
    avaliacao: {
      historiaClinica: body.historia_clinica || '',
      queixaPrincipalPaciente: body.queixa_principal_paciente || '',
      habitosDeVida: body.habitos_de_vida || '',
      hma: body.hma || '',
      hmp: body.hmp || '',
      antecedentesPessoais: body.antecedentes_pessoais || '',
      antecedentesFamiliares: body.antecedentes_familiares || '',
      tratamentosRealizados: body.tratamentos_realizados || '',
    },
    exameClinico: {
      apresentacaoPaciente: parseArray(body.apresentacao_paciente),
      examesComplementares: {
        possui: Boolean(body.exames_complementares_possui),
        descricao: body.exames_complementares_descricao || '',
      },
      usoMedicamentos: {
        possui: Boolean(body.uso_medicamentos_possui),
        descricao: body.uso_medicamentos_descricao || '',
      },
      cirurgia: {
        possui: Boolean(body.cirurgia_possui),
        descricao: body.cirurgia_descricao || '',
      },
      inspecaoPalpacao: parseArray(body.inspecao_palpacao),
      semiologia: body.semiologia || '',
      testesEspecificos: body.testes_especificos || '',
      escalaEva: Number(body.escala_eva || 0),
    },
    planoTerapeutico: {
      objetivosTratamento: body.objetivos_tratamento || '',
      recursosTerapeuticos: body.recursos_terapeuticos || '',
      planoTratamento: body.plano_tratamento || '',
      evolucao: Array.isArray(body.evolucao) ? body.evolucao : [],
    },
    observacoesGerais: body.observacoes_gerais || '',
  };
}

function parseRecordRow(row) {
  const payload = row.payload_json ? JSON.parse(row.payload_json) : {};
  return {
    id: row.id,
    patient_id: row.patient_id,
    patientName: row.patientName,
    data_avaliacao: row.date,
    fisioterapeuta: row.physiotherapist_name,
    resumo: payload.avaliacao?.queixaPrincipalPaciente || row.main_complaint,
    diagnostico_resumo: payload.identificacao?.diagnosticoFisioterapeutico || row.diagnosis,
    escala_eva: payload.exameClinico?.escalaEva ?? row.pain_scale ?? 0,
    ...payload,
  };
}

function getRecordResponse(recordId, res) {
  const row = db.prepare(`
    SELECT records.*, patients.name AS patientName
    FROM records
    JOIN patients ON patients.id = records.patient_id
    WHERE records.id = ?
  `).get(recordId);

  if (!row) {
    return res.status(404).json({ message: 'Prontuário não encontrado.' });
  }

  return res.json(parseRecordRow(row));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name },
    JWT_SECRET,
    { expiresIn: '12h' },
  );

  res.json({
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      username: admin.username,
      profession: admin.profession,
      email: admin.email,
      phone: admin.phone,
    },
  });
});

app.use('/api', authMiddleware);

app.get('/api/me', (req, res) => {
  const admin = db.prepare(`
    SELECT id, name, username, profession, email, phone
    FROM admins
    WHERE id = ?
  `).get(req.admin.id);
  res.json(admin);
});

app.get('/api/dashboard/summary', (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const totalPatients = db.prepare('SELECT COUNT(*) AS total FROM patients').get().total;
  const todaysAppointments = db.prepare('SELECT COUNT(*) AS total FROM appointments WHERE date = ?').get(today).total;
  const pendingTasks = db.prepare('SELECT COUNT(*) AS total FROM appointments WHERE status = ?').get('pending').total;

  const nextAppointments = db.prepare(`
    SELECT appointments.id, appointments.date, appointments.time, appointments.status, appointments.notes,
           patients.name AS patientName
    FROM appointments
    JOIN patients ON patients.id = appointments.patient_id
    ORDER BY appointments.date ASC, appointments.time ASC
    LIMIT 5
  `).all();

  res.json({
    greeting: 'Olá, Maya! Que bom ver você por aqui.',
    totalPatients,
    todaysAppointments,
    pendingTasks,
    nextAppointments,
  });
});

app.get('/api/patients', (_req, res) => {
  res.json(
    db.prepare('SELECT * FROM patients ORDER BY name COLLATE NOCASE ASC').all(),
  );
});

app.post('/api/patients', (req, res) => {
  const missing = validateRequiredFields(['name', 'birth_date'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  const result = db.prepare(`
    INSERT INTO patients (name, birth_date, phone, email, main_condition, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.body.name,
    req.body.birth_date,
    req.body.phone || '',
    req.body.email || '',
    req.body.main_condition || '',
    req.body.notes || '',
  );

  res.status(201).json(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/patients/:id', (req, res) => {
  const missing = validateRequiredFields(['name', 'birth_date'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  db.prepare(`
    UPDATE patients
    SET name = ?, birth_date = ?, phone = ?, email = ?, main_condition = ?, notes = ?
    WHERE id = ?
  `).run(
    req.body.name,
    req.body.birth_date,
    req.body.phone || '',
    req.body.email || '',
    req.body.main_condition || '',
    req.body.notes || '',
    req.params.id,
  );

  res.json(db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id));
});

app.delete('/api/patients/:id', (req, res) => {
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.use('/api/records/:id', (req, res, next) => {
  if (req.method === 'GET') {
    return getRecordResponse(req.params.id, res);
  }

  return next();
});

app.get('/api/records', (req, res) => {
  const { patientId } = req.query;
  const query = `
    SELECT records.*, patients.name AS patientName
    FROM records
    JOIN patients ON patients.id = records.patient_id
    ${patientId ? 'WHERE patient_id = ?' : ''}
    ORDER BY records.date DESC, records.id DESC
  `;
  const rows = patientId ? db.prepare(query).all(patientId) : db.prepare(query).all();
  res.json(rows.map(parseRecordRow));
});

app.get('/api/records/:id', (req, res) => {
  return getRecordResponse(req.params.id, res);
});

app.get(/^\/api\/records\/(\d+)$/, (req, res) => getRecordResponse(req.params[0], res));

app.post('/api/records', (req, res) => {
  const missing = validateRequiredFields(
    ['patient_id', 'date', 'nome', 'queixa_principal_paciente', 'diagnostico_fisioterapeutico', 'plano_tratamento'],
    req.body,
  );
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.body.patient_id);
  if (!patient) {
    return res.status(404).json({ message: 'Paciente não encontrado.' });
  }

  const payload = buildRecordPayload(req.body, patient);
  const result = db.prepare(`
    INSERT INTO records (
      patient_id, date, main_complaint, postural_assessment, diagnosis, treatment_plan, notes, payload_json, pain_scale, physiotherapist_name
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.body.patient_id,
    req.body.date,
    req.body.queixa_principal_paciente,
    req.body.semiologia || '',
    req.body.diagnostico_fisioterapeutico,
    req.body.plano_tratamento,
    req.body.observacoes_gerais || '',
    JSON.stringify(payload),
    Number(req.body.escala_eva || 0),
    req.body.fisioterapeuta || 'Maya Yamamoto - RPG',
  );

  const created = db.prepare(`
    SELECT records.*, patients.name AS patientName
    FROM records
    JOIN patients ON patients.id = records.patient_id
    WHERE records.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(parseRecordRow(created));
});

app.put('/api/records/:id', (req, res) => {
  const missing = validateRequiredFields(
    ['patient_id', 'date', 'nome', 'queixa_principal_paciente', 'diagnostico_fisioterapeutico', 'plano_tratamento'],
    req.body,
  );
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.body.patient_id);
  if (!patient) {
    return res.status(404).json({ message: 'Paciente não encontrado.' });
  }

  const payload = buildRecordPayload(req.body, patient);

  db.prepare(`
    UPDATE records
    SET patient_id = ?, date = ?, main_complaint = ?, postural_assessment = ?, diagnosis = ?, treatment_plan = ?, notes = ?, payload_json = ?, pain_scale = ?, physiotherapist_name = ?
    WHERE id = ?
  `).run(
    req.body.patient_id,
    req.body.date,
    req.body.queixa_principal_paciente,
    req.body.semiologia || '',
    req.body.diagnostico_fisioterapeutico,
    req.body.plano_tratamento,
    req.body.observacoes_gerais || '',
    JSON.stringify(payload),
    Number(req.body.escala_eva || 0),
    req.body.fisioterapeuta || 'Maya Yamamoto - RPG',
    req.params.id,
  );

  const updated = db.prepare(`
    SELECT records.*, patients.name AS patientName
    FROM records
    JOIN patients ON patients.id = records.patient_id
    WHERE records.id = ?
  `).get(req.params.id);

  res.json(parseRecordRow(updated));
});

app.delete('/api/records/:id', (req, res) => {
  db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.get('/api/appointments', (req, res) => {
  const { date } = req.query;
  const query = `
    SELECT appointments.*, patients.name AS patientName
    FROM appointments
    JOIN patients ON patients.id = appointments.patient_id
    ${date ? 'WHERE appointments.date = ?' : ''}
    ORDER BY appointments.date ASC, appointments.time ASC
  `;

  const rows = date ? db.prepare(query).all(date) : db.prepare(query).all();
  res.json(rows);
});

app.post('/api/appointments', (req, res) => {
  const missing = validateRequiredFields(['patient_id', 'date', 'time'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  const result = db.prepare(`
    INSERT INTO appointments (patient_id, date, time, notes, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.body.patient_id,
    req.body.date,
    req.body.time,
    req.body.notes || '',
    req.body.status || 'scheduled',
  );

  res.status(201).json(
    db.prepare(`
      SELECT appointments.*, patients.name AS patientName
      FROM appointments
      JOIN patients ON patients.id = appointments.patient_id
      WHERE appointments.id = ?
    `).get(result.lastInsertRowid),
  );
});

app.put('/api/appointments/:id', (req, res) => {
  const missing = validateRequiredFields(['patient_id', 'date', 'time'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  db.prepare(`
    UPDATE appointments
    SET patient_id = ?, date = ?, time = ?, notes = ?, status = ?
    WHERE id = ?
  `).run(
    req.body.patient_id,
    req.body.date,
    req.body.time,
    req.body.notes || '',
    req.body.status || 'scheduled',
    req.params.id,
  );

  res.json(
    db.prepare(`
      SELECT appointments.*, patients.name AS patientName
      FROM appointments
      JOIN patients ON patients.id = appointments.patient_id
      WHERE appointments.id = ?
    `).get(req.params.id),
  );
});

app.delete('/api/appointments/:id', (req, res) => {
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.get('/api/exercises', (_req, res) => {
  res.json(db.prepare('SELECT * FROM exercises ORDER BY created_at DESC').all());
});

app.post('/api/exercises', (req, res) => {
  const missing = validateRequiredFields(['name', 'description', 'instructions'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  const result = db.prepare(`
    INSERT INTO exercises (name, description, instructions)
    VALUES (?, ?, ?)
  `).run(req.body.name, req.body.description, req.body.instructions);

  res.status(201).json(db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/exercises/:id', (req, res) => {
  const missing = validateRequiredFields(['name', 'description', 'instructions'], req.body);
  if (missing.length) {
    return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });
  }

  db.prepare(`
    UPDATE exercises
    SET name = ?, description = ?, instructions = ?
    WHERE id = ?
  `).run(req.body.name, req.body.description, req.body.instructions, req.params.id);

  res.json(db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id));
});

app.delete('/api/exercises/:id', (req, res) => {
  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.get('/api/documents', (_req, res) => {
  res.json(
    db.prepare(`
      SELECT documents.*, patients.name AS patientName
      FROM documents
      JOIN patients ON patients.id = documents.patient_id
      ORDER BY uploaded_at DESC
    `).all(),
  );
});

app.post('/api/documents', upload.single('file'), (req, res) => {
  if (!req.file || !req.body.patient_id || !req.body.title) {
    return res.status(400).json({ message: 'Paciente, título e arquivo são obrigatórios.' });
  }

  const result = db.prepare(`
    INSERT INTO documents (patient_id, title, file_name, file_path, file_url, mime_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.body.patient_id,
    req.body.title,
    req.file.originalname,
    req.file.path,
    `/uploads/${req.file.filename}`,
    req.file.mimetype,
    req.body.notes || '',
  );

  res.status(201).json(
    db.prepare(`
      SELECT documents.*, patients.name AS patientName
      FROM documents
      JOIN patients ON patients.id = documents.patient_id
      WHERE documents.id = ?
    `).get(result.lastInsertRowid),
  );
});

app.delete('/api/documents/:id', (req, res) => {
  const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (document?.file_path && fs.existsSync(document.file_path)) {
    fs.unlinkSync(document.file_path);
  }
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.get('/api/settings', (req, res) => {
  res.json(
    db.prepare(`
      SELECT admins.id, admins.name, admins.username, admins.profession, admins.email, admins.phone,
             preferences.notifications_enabled, preferences.calendar_view, preferences.accent_color
      FROM admins
      JOIN preferences ON preferences.admin_id = admins.id
      WHERE admins.id = ?
    `).get(req.admin.id),
  );
});

app.put('/api/settings', (req, res) => {
  db.prepare(`
    UPDATE admins
    SET name = ?, profession = ?, email = ?, phone = ?
    WHERE id = ?
  `).run(req.body.name, req.body.profession, req.body.email, req.body.phone, req.admin.id);

  db.prepare(`
    UPDATE preferences
    SET notifications_enabled = ?, calendar_view = ?, accent_color = ?
    WHERE admin_id = ?
  `).run(req.body.notifications_enabled ? 1 : 0, req.body.calendar_view, req.body.accent_color, req.admin.id);

  res.json(
    db.prepare(`
      SELECT admins.id, admins.name, admins.username, admins.profession, admins.email, admins.phone,
             preferences.notifications_enabled, preferences.calendar_view, preferences.accent_color
      FROM admins
      JOIN preferences ON preferences.admin_id = admins.id
      WHERE admins.id = ?
    `).get(req.admin.id),
  );
});

app.listen(PORT, () => {
  console.log(`Maya Yamamoto API running on http://localhost:${PORT}`);
});
