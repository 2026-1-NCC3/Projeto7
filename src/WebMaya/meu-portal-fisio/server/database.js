const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const dbPath = path.join(dataDir, 'maya-yamamoto.db');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function addColumnIfMissing(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    profession TEXT,
    email TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL UNIQUE,
    notifications_enabled INTEGER DEFAULT 1,
    calendar_view TEXT DEFAULT 'week',
    accent_color TEXT DEFAULT '#71d9d1',
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    main_condition TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    main_complaint TEXT NOT NULL DEFAULT '',
    postural_assessment TEXT NOT NULL DEFAULT '',
    diagnosis TEXT NOT NULL DEFAULT '',
    treatment_plan TEXT NOT NULL DEFAULT '',
    notes TEXT,
    payload_json TEXT,
    pain_scale INTEGER DEFAULT 0,
    physiotherapist_name TEXT DEFAULT 'Maya Yamamoto - RPG',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type TEXT,
    notes TEXT,
    uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );
`);

addColumnIfMissing('records', 'payload_json', 'TEXT');
addColumnIfMissing('records', 'pain_scale', 'INTEGER DEFAULT 0');
addColumnIfMissing('records', 'physiotherapist_name', "TEXT DEFAULT 'Maya Yamamoto - RPG'");

const adminCount = db.prepare('SELECT COUNT(*) AS total FROM admins').get().total;

if (adminCount === 0) {
  const passwordHash = bcrypt.hashSync('maya123', 10);
  const result = db.prepare(`
    INSERT INTO admins (name, username, password_hash, profession, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Maya Yamamoto',
    'maya',
    passwordHash,
    'Fisioterapeuta especialista em RPG',
    'maya@yamamoto.com',
    '(11) 99999-1000',
  );

  db.prepare(`
    INSERT INTO preferences (admin_id, notifications_enabled, calendar_view, accent_color)
    VALUES (?, 1, 'week', '#71d9d1')
  `).run(result.lastInsertRowid);
}

function createRecordPayload(patient, details) {
  return {
    identificacao: {
      nome: patient.name,
      dataNascimento: patient.birth_date,
      telefone: patient.phone || '',
      sexo: details.sexo || '',
      cidade: details.cidade || 'São Paulo',
      bairro: details.bairro || '',
      profissao: details.profissao || '',
      enderecoResidencial: details.enderecoResidencial || '',
      enderecoComercial: details.enderecoComercial || '',
      naturalidade: details.naturalidade || '',
      estadoCivil: details.estadoCivil || '',
      diagnosticoClinico: details.diagnosticoClinico || patient.main_condition || '',
      diagnosticoFisioterapeutico: details.diagnosticoFisioterapeutico || details.diagnosis || '',
    },
    avaliacao: {
      historiaClinica: details.historiaClinica || '',
      queixaPrincipalPaciente: details.main_complaint || '',
      habitosDeVida: details.habitosDeVida || '',
      hma: details.hma || '',
      hmp: details.hmp || '',
      antecedentesPessoais: details.antecedentesPessoais || '',
      antecedentesFamiliares: details.antecedentesFamiliares || '',
      tratamentosRealizados: details.tratamentosRealizados || '',
    },
    exameClinico: {
      apresentacaoPaciente: details.apresentacaoPaciente || ['deambulando'],
      examesComplementares: {
        possui: Boolean(details.examesComplementaresPossui),
        descricao: details.examesComplementaresDescricao || '',
      },
      usoMedicamentos: {
        possui: Boolean(details.usoMedicamentosPossui),
        descricao: details.usoMedicamentosDescricao || '',
      },
      cirurgia: {
        possui: Boolean(details.cirurgiaPossui),
        descricao: details.cirurgiaDescricao || '',
      },
      inspecaoPalpacao: details.inspecaoPalpacao || ['normal'],
      semiologia: details.postural_assessment || '',
      testesEspecificos: details.testesEspecificos || '',
      escalaEva: Number(details.pain_scale || 0),
    },
    planoTerapeutico: {
      objetivosTratamento: details.objetivosTratamento || '',
      recursosTerapeuticos: details.recursosTerapeuticos || '',
      planoTratamento: details.treatment_plan || '',
      evolucao: details.evolucao || [],
    },
    observacoesGerais: details.notes || '',
  };
}

const patientCount = db.prepare('SELECT COUNT(*) AS total FROM patients').get().total;

if (patientCount === 0) {
  const insertPatient = db.prepare(`
    INSERT INTO patients (name, birth_date, phone, email, main_condition, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertRecord = db.prepare(`
    INSERT INTO records (
      patient_id, date, main_complaint, postural_assessment, diagnosis, treatment_plan, notes, payload_json, pain_scale
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (patient_id, date, time, notes, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().slice(0, 10);

  const patients = [
    {
      name: 'Marina Costa',
      birthDate: '1987-06-14',
      phone: '(11) 98888-1001',
      email: 'marina@example.com',
      condition: 'Lombalgia crônica',
      notes: 'Relata dor pior ao fim do dia.',
      record: {
        sexo: 'Feminino',
        cidade: 'São Paulo',
        bairro: 'Moema',
        profissao: 'Arquiteta',
        enderecoResidencial: 'Rua das Acácias, 120',
        enderecoComercial: 'Av. Paulista, 900',
        naturalidade: 'São Paulo - SP',
        estadoCivil: 'Casada',
        diagnosticoClinico: 'Lombalgia crônica',
        diagnosticoFisioterapeutico: 'Sobrecarga de cadeia posterior com restrição respiratória',
        historiaClinica: 'Paciente refere dor lombar recorrente há 2 anos.',
        main_complaint: 'Dor lombar e rigidez ao acordar.',
        habitosDeVida: 'Rotina sedentária e longas horas sentada.',
        hma: 'Piora ao fim do dia e após esforço prolongado.',
        hmp: 'Episódios prévios de crise lombar.',
        antecedentesPessoais: 'Sem comorbidades relevantes.',
        antecedentesFamiliares: 'Mãe com histórico de artrose.',
        tratamentosRealizados: 'Pilates e analgesia medicamentosa.',
        apresentacaoPaciente: ['deambulando', 'orientado'],
        examesComplementaresPossui: true,
        examesComplementaresDescricao: 'Ressonância lombar de 2025.',
        usoMedicamentosPossui: true,
        usoMedicamentosDescricao: 'Analgésico sob demanda.',
        cirurgiaPossui: false,
        inspecaoPalpacao: ['edema'],
        postural_assessment: 'Anteriorização de cabeça e retificação lombar.',
        testesEspecificos: 'Teste de Schober reduzido.',
        pain_scale: 6,
        objetivosTratamento: 'Reduzir dor, melhorar mobilidade e equilíbrio postural.',
        recursosTerapeuticos: 'RPG, alongamentos e reeducação respiratória.',
        treatment_plan: 'Sessões semanais de RPG com foco em cadeia posterior e respiração.',
        evolucao: [
          { data: today, descricao: 'Avaliação inicial realizada com boa aceitação.' },
        ],
        notes: 'Boa adesão ao tratamento.',
      },
      appointment: { date: today, time: '09:00', notes: 'Revisão quinzenal.', status: 'scheduled' },
    },
    {
      name: 'Carlos Ferreira',
      birthDate: '1994-03-22',
      phone: '(11) 97777-2200',
      email: 'carlos@example.com',
      condition: 'Cervicalgia',
      notes: 'Trabalha muitas horas em frente ao computador.',
      record: {
        sexo: 'Masculino',
        cidade: 'São Paulo',
        bairro: 'Vila Mariana',
        profissao: 'Analista de sistemas',
        naturalidade: 'Santos - SP',
        estadoCivil: 'Solteiro',
        diagnosticoClinico: 'Cervicalgia',
        diagnosticoFisioterapeutico: 'Disfunção postural cervicoescapular',
        historiaClinica: 'Dor cervical progressiva associada ao trabalho.',
        main_complaint: 'Tensão cervical e cefaleia tensional.',
        habitosDeVida: 'Baixa prática de atividade física.',
        hma: 'Sintomas iniciados há 8 meses.',
        hmp: 'Sem traumas recentes.',
        antecedentesPessoais: 'Rinite alérgica.',
        antecedentesFamiliares: 'Pai com hipertensão.',
        tratamentosRealizados: 'Massoterapia eventual.',
        apresentacaoPaciente: ['deambulando', 'orientado'],
        examesComplementaresPossui: false,
        usoMedicamentosPossui: false,
        cirurgiaPossui: false,
        inspecaoPalpacao: ['normal'],
        postural_assessment: 'Elevação de ombros e limitação de rotação cervical.',
        testesEspecificos: 'Spurling negativo. Limitação funcional em rotação.',
        pain_scale: 5,
        objetivosTratamento: 'Melhorar amplitude cervical e reduzir tensão miofascial.',
        recursosTerapeuticos: 'RPG, mobilização e consciência postural.',
        treatment_plan: 'RPG com ênfase em cintura escapular e higiene postural.',
        evolucao: [
          { data: today, descricao: 'Paciente orientado sobre pausas ativas e ergonomia.' },
        ],
        notes: 'Orientado sobre pausas ativas.',
      },
      appointment: { date: today, time: '11:30', notes: 'Avaliação inicial.', status: 'confirmed' },
    },
  ];

  patients.forEach((patient) => {
    const patientResult = insertPatient.run(
      patient.name,
      patient.birthDate,
      patient.phone,
      patient.email,
      patient.condition,
      patient.notes,
    );

    const patientId = patientResult.lastInsertRowid;
    const payload = createRecordPayload(
      { name: patient.name, birth_date: patient.birthDate, phone: patient.phone, main_condition: patient.condition },
      patient.record,
    );

    insertRecord.run(
      patientId,
      today,
      patient.record.main_complaint,
      patient.record.postural_assessment,
      patient.record.diagnosticoFisioterapeutico,
      patient.record.treatment_plan,
      patient.record.notes,
      JSON.stringify(payload),
      patient.record.pain_scale,
    );

    insertAppointment.run(
      patientId,
      patient.appointment.date,
      patient.appointment.time,
      patient.appointment.notes,
      patient.appointment.status,
    );
  });

  const insertExercise = db.prepare(`
    INSERT INTO exercises (name, description, instructions)
    VALUES (?, ?, ?)
  `);

  [
    ['Respiração costal', 'Exercício para expansão torácica.', 'Inspirar em 4 tempos, expirar em 6 tempos por 5 minutos.'],
    ['Alongamento axial', 'Descompressão suave da coluna.', 'Realizar 3 séries de 30 segundos, mantendo respiração fluida.'],
    ['Mobilidade cervical guiada', 'Mobilidade em amplitude confortável.', 'Executar rotações lentas e inclinações laterais sem dor.'],
  ].forEach(([name, description, instructions]) => {
    insertExercise.run(name, description, instructions);
  });
}

const legacyRecords = db.prepare(`
  SELECT records.*, patients.name AS patient_name, patients.birth_date, patients.phone AS patient_phone, patients.main_condition
  FROM records
  JOIN patients ON patients.id = records.patient_id
  WHERE records.payload_json IS NULL OR records.payload_json = ''
`).all();

const updateLegacyPayload = db.prepare(`
  UPDATE records
  SET payload_json = ?, pain_scale = COALESCE(pain_scale, 0), physiotherapist_name = COALESCE(physiotherapist_name, 'Maya Yamamoto - RPG')
  WHERE id = ?
`);

legacyRecords.forEach((record) => {
  const payload = createRecordPayload(
    {
      name: record.patient_name,
      birth_date: record.birth_date,
      phone: record.patient_phone,
      main_condition: record.main_condition,
    },
    {
      diagnosticoFisioterapeutico: record.diagnosis,
      main_complaint: record.main_complaint,
      postural_assessment: record.postural_assessment,
      treatment_plan: record.treatment_plan,
      notes: record.notes,
      pain_scale: record.pain_scale || 0,
    },
  );

  updateLegacyPayload.run(JSON.stringify(payload), record.id);
});

module.exports = {
  db,
  uploadsDir,
};
