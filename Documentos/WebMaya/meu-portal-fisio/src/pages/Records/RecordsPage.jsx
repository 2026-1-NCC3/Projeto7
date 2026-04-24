import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiRequest } from '../../lib/api';
import { exportRecordPdf } from './recordPdf';

const apresentacaoOptions = [
  { value: 'deambulando', label: 'Deambulando' },
  { value: 'internado', label: 'Internado' },
  { value: 'deambulando com apoio', label: 'Deambulando com apoio' },
  { value: 'orientado', label: 'Orientado' },
  { value: 'cadeira de rodas', label: 'Cadeira de rodas' },
];

const inspecaoOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'edema', label: 'Edema' },
  { value: 'cicatrizacao incompleta', label: 'Cicatrização incompleta' },
  { value: 'eritemas', label: 'Eritemas' },
  { value: 'outros', label: 'Outros' },
];

const emptyForm = {
  patient_id: '',
  date: new Date().toISOString().slice(0, 10),
  fisioterapeuta: 'Maya Yamamoto - RPG',
  nome: '',
  data_nascimento: '',
  telefone: '',
  sexo: '',
  cidade: '',
  bairro: '',
  profissao: '',
  endereco_residencial: '',
  endereco_comercial: '',
  naturalidade: '',
  estado_civil: '',
  diagnostico_clinico: '',
  diagnostico_fisioterapeutico: '',
  historia_clinica: '',
  queixa_principal_paciente: '',
  habitos_de_vida: '',
  hma: '',
  hmp: '',
  antecedentes_pessoais: '',
  antecedentes_familiares: '',
  tratamentos_realizados: '',
  apresentacao_paciente: [],
  exames_complementares_possui: false,
  exames_complementares_descricao: '',
  uso_medicamentos_possui: false,
  uso_medicamentos_descricao: '',
  cirurgia_possui: false,
  cirurgia_descricao: '',
  inspecao_palpacao: [],
  semiologia: '',
  testes_especificos: '',
  escala_eva: 0,
  objetivos_tratamento: '',
  recursos_terapeuticos: '',
  plano_tratamento: '',
  evolucao: [{ data: new Date().toISOString().slice(0, 10), descricao: '' }],
  observacoes_gerais: '',
};

function arrayToggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function mapRecordToForm(record) {
  return {
    patient_id: String(record.patient_id),
    date: record.data_avaliacao || '',
    fisioterapeuta: record.fisioterapeuta || 'Maya Yamamoto - RPG',
    nome: record.identificacao?.nome || '',
    data_nascimento: record.identificacao?.dataNascimento || '',
    telefone: record.identificacao?.telefone || '',
    sexo: record.identificacao?.sexo || '',
    cidade: record.identificacao?.cidade || '',
    bairro: record.identificacao?.bairro || '',
    profissao: record.identificacao?.profissao || '',
    endereco_residencial: record.identificacao?.enderecoResidencial || '',
    endereco_comercial: record.identificacao?.enderecoComercial || '',
    naturalidade: record.identificacao?.naturalidade || '',
    estado_civil: record.identificacao?.estadoCivil || '',
    diagnostico_clinico: record.identificacao?.diagnosticoClinico || '',
    diagnostico_fisioterapeutico: record.identificacao?.diagnosticoFisioterapeutico || '',
    historia_clinica: record.avaliacao?.historiaClinica || '',
    queixa_principal_paciente: record.avaliacao?.queixaPrincipalPaciente || '',
    habitos_de_vida: record.avaliacao?.habitosDeVida || '',
    hma: record.avaliacao?.hma || '',
    hmp: record.avaliacao?.hmp || '',
    antecedentes_pessoais: record.avaliacao?.antecedentesPessoais || '',
    antecedentes_familiares: record.avaliacao?.antecedentesFamiliares || '',
    tratamentos_realizados: record.avaliacao?.tratamentosRealizados || '',
    apresentacao_paciente: record.exameClinico?.apresentacaoPaciente || [],
    exames_complementares_possui: Boolean(record.exameClinico?.examesComplementares?.possui),
    exames_complementares_descricao: record.exameClinico?.examesComplementares?.descricao || '',
    uso_medicamentos_possui: Boolean(record.exameClinico?.usoMedicamentos?.possui),
    uso_medicamentos_descricao: record.exameClinico?.usoMedicamentos?.descricao || '',
    cirurgia_possui: Boolean(record.exameClinico?.cirurgia?.possui),
    cirurgia_descricao: record.exameClinico?.cirurgia?.descricao || '',
    inspecao_palpacao: record.exameClinico?.inspecaoPalpacao || [],
    semiologia: record.exameClinico?.semiologia || '',
    testes_especificos: record.exameClinico?.testesEspecificos || '',
    escala_eva: record.exameClinico?.escalaEva ?? 0,
    objetivos_tratamento: record.planoTerapeutico?.objetivosTratamento || '',
    recursos_terapeuticos: record.planoTerapeutico?.recursosTerapeuticos || '',
    plano_tratamento: record.planoTerapeutico?.planoTratamento || '',
    evolucao: record.planoTerapeutico?.evolucao?.length ? record.planoTerapeutico.evolucao : [{ data: '', descricao: '' }],
    observacoes_gerais: record.observacoesGerais || '',
  };
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="record-section">
      <div className="record-section-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="subtle">{subtitle}</p>}
        </div>
      </div>
      <div className="field-grid">{children}</div>
    </section>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  async function loadData(patientId = selectedPatient) {
    const [recordsData, patientsData] = await Promise.all([
      apiRequest(`/records${patientId ? `?patientId=${patientId}` : ''}`),
      apiRequest('/patients'),
    ]);
    setRecords(recordsData);
    setPatients(patientsData);
    if (selectedRecord) {
      const refreshed = recordsData.find((item) => item.id === selectedRecord.id);
      setSelectedRecord(refreshed || null);
    }
  }

  useEffect(() => {
    loadData('');
  }, []);

  useEffect(() => {
    loadData(selectedPatient);
  }, [selectedPatient]);

  const patientMap = useMemo(
    () => Object.fromEntries(patients.map((patient) => [String(patient.id), patient])),
    [patients],
  );

  function buildPreviewRecord() {
    return {
      id: editingId || 'preview',
      patient_id: form.patient_id,
      patientName: patientMap[form.patient_id]?.name || form.nome,
      data_avaliacao: form.date,
      fisioterapeuta: form.fisioterapeuta,
      identificacao: {
        nome: form.nome,
        dataNascimento: form.data_nascimento,
        telefone: form.telefone,
        sexo: form.sexo,
        cidade: form.cidade,
        bairro: form.bairro,
        profissao: form.profissao,
        enderecoResidencial: form.endereco_residencial,
        enderecoComercial: form.endereco_comercial,
        naturalidade: form.naturalidade,
        estadoCivil: form.estado_civil,
        diagnosticoClinico: form.diagnostico_clinico,
        diagnosticoFisioterapeutico: form.diagnostico_fisioterapeutico,
      },
      avaliacao: {
        historiaClinica: form.historia_clinica,
        queixaPrincipalPaciente: form.queixa_principal_paciente,
        habitosDeVida: form.habitos_de_vida,
        hma: form.hma,
        hmp: form.hmp,
        antecedentesPessoais: form.antecedentes_pessoais,
        antecedentesFamiliares: form.antecedentes_familiares,
        tratamentosRealizados: form.tratamentos_realizados,
      },
      exameClinico: {
        apresentacaoPaciente: form.apresentacao_paciente,
        examesComplementares: {
          possui: form.exames_complementares_possui,
          descricao: form.exames_complementares_descricao,
        },
        usoMedicamentos: {
          possui: form.uso_medicamentos_possui,
          descricao: form.uso_medicamentos_descricao,
        },
        cirurgia: {
          possui: form.cirurgia_possui,
          descricao: form.cirurgia_descricao,
        },
        inspecaoPalpacao: form.inspecao_palpacao,
        semiologia: form.semiologia,
        testesEspecificos: form.testes_especificos,
        escalaEva: form.escala_eva,
      },
      planoTerapeutico: {
        objetivosTratamento: form.objetivos_tratamento,
        recursosTerapeuticos: form.recursos_terapeuticos,
        planoTratamento: form.plano_tratamento,
        evolucao: form.evolucao,
      },
      observacoesGerais: form.observacoes_gerais,
    };
  }

  function prefillFromPatient(patientId) {
    const patient = patientMap[patientId];
    if (!patient) return;

    setForm((current) => ({
      ...current,
      patient_id: patientId,
      nome: patient.name,
      data_nascimento: patient.birth_date,
      telefone: patient.phone || '',
      diagnostico_clinico: current.diagnostico_clinico || patient.main_condition || '',
      observacoes_gerais: current.observacoes_gerais || patient.notes || '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const body = JSON.stringify(form);
      const response = editingId
        ? await apiRequest(`/records/${editingId}`, { method: 'PUT', body })
        : await apiRequest('/records', { method: 'POST', body });

      setSelectedRecord(response);
      setEditingId(response.id);
      setForm(mapRecordToForm(response));
      setFeedback({ type: 'success', text: editingId ? 'Prontuário atualizado com sucesso.' : 'Prontuário criado com sucesso.' });
      await loadData();
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este prontuário?')) return;
    await apiRequest(`/records/${id}`, { method: 'DELETE' });
    if (selectedRecord?.id === id) setSelectedRecord(null);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setFeedback({ type: 'success', text: 'Prontuário excluído.' });
    loadData();
  }

  return (
    <div className="app-page">
      <section className="card">
        <div className="section-head">
          <div>
            <h2>Prontuários</h2>
            <div className="subtle">Modelo baseado na ficha real de avaliação fisioterapêutica.</div>
          </div>
          <div className="field filter-field">
            <label>Filtrar por paciente</label>
            <select value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)}>
              <option value="">Todos os pacientes</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="record-list">
          {records.length === 0 ? (
            <div className="empty-state">Nenhum prontuário encontrado.</div>
          ) : records.map((record) => (
            <article
              key={record.id}
              className={`record-summary ${selectedRecord?.id === record.id ? 'is-active' : ''}`}
            >
              <button className="record-summary-main" onClick={() => setSelectedRecord(record)}>
                <div>
                  <div className="list-title">{record.identificacao?.nome || record.patientName}</div>
                  <div className="subtle">{record.data_avaliacao}</div>
                </div>
                <div className="tag-row">
                  <span className="tag">EVA {record.escala_eva}</span>
                  <span className="tag">{record.diagnostico_resumo || 'Sem diagnóstico'}</span>
                </div>
              </button>
              <div className="record-summary-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedRecord(record);
                    setEditingId(record.id);
                    setForm(mapRecordToForm(record));
                  }}
                >
                  Editar
                </button>
                <button className="btn-secondary" onClick={() => exportRecordPdf(record)}>
                  <FiDownload style={{ marginRight: 8 }} />
                  Exportar como PDF
                </button>
                <button className="btn-danger" onClick={() => handleDelete(record.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedRecord && (
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Visualização rápida</h2>
              <div className="subtle">Resumo clínico do prontuário selecionado.</div>
            </div>
            <button className="btn-secondary" onClick={() => exportRecordPdf(selectedRecord)}>
              <FiDownload style={{ marginRight: 8 }} />
              Exportar como PDF
            </button>
          </div>

          <div className="field-grid two">
            <div className="list-item">
              <div className="list-title">Identificação</div>
              <div className="subtle">{selectedRecord.identificacao?.nome}</div>
              <div className="subtle">{selectedRecord.identificacao?.diagnosticoClinico || 'Sem diagnóstico clínico'}</div>
            </div>
            <div className="list-item">
              <div className="list-title">Avaliação</div>
              <div className="subtle">{selectedRecord.avaliacao?.queixaPrincipalPaciente || 'Sem queixa registrada'}</div>
            </div>
            <div className="list-item">
              <div className="list-title">Exame clínico</div>
              <div className="subtle">{selectedRecord.exameClinico?.semiologia || 'Sem semiologia registrada'}</div>
            </div>
            <div className="list-item">
              <div className="list-title">Plano terapêutico</div>
              <div className="subtle">{selectedRecord.planoTerapeutico?.planoTratamento || 'Sem plano registrado'}</div>
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-head">
          <div>
            <h2>{editingId ? 'Editar prontuário' : 'Criar prontuário'}</h2>
            <div className="subtle">Estrutura fiel ao modelo do PDF enviado.</div>
          </div>
          <div className="button-row">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setSelectedRecord(null);
                setForm(emptyForm);
                setFeedback({ type: '', text: '' });
              }}
            >
              Novo prontuário
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={() => exportRecordPdf(buildPreviewRecord())}>
                <FiFileText style={{ marginRight: 8 }} />
                Pré-visualizar exportação
              </button>
            )}
          </div>
        </div>

        {feedback.text && (
          <div className={`feedback-box ${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        <form className="record-form" onSubmit={handleSubmit}>
          <SectionCard title="1. Identificação" subtitle="Dados básicos do paciente e diagnóstico inicial.">
            <div className="field">
              <label>Paciente</label>
              <select
                value={form.patient_id}
                onChange={(event) => {
                  const patientId = event.target.value;
                  prefillFromPatient(patientId);
                }}
                required
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Data da avaliação</label>
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </div>
            <div className="field-grid three">
              <div className="field">
                <label>Nome</label>
                <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required />
              </div>
              <div className="field">
                <label>Data de nascimento</label>
                <input type="date" value={form.data_nascimento} onChange={(event) => setForm({ ...form, data_nascimento: event.target.value })} />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} />
              </div>
            </div>
            <div className="field-grid three">
              <div className="field">
                <label>Sexo</label>
                <input value={form.sexo} onChange={(event) => setForm({ ...form, sexo: event.target.value })} />
              </div>
              <div className="field">
                <label>Cidade</label>
                <input value={form.cidade} onChange={(event) => setForm({ ...form, cidade: event.target.value })} />
              </div>
              <div className="field">
                <label>Bairro</label>
                <input value={form.bairro} onChange={(event) => setForm({ ...form, bairro: event.target.value })} />
              </div>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label>Profissão</label>
                <input value={form.profissao} onChange={(event) => setForm({ ...form, profissao: event.target.value })} />
              </div>
              <div className="field">
                <label>Estado civil</label>
                <input value={form.estado_civil} onChange={(event) => setForm({ ...form, estado_civil: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Endereço residencial</label>
              <input value={form.endereco_residencial} onChange={(event) => setForm({ ...form, endereco_residencial: event.target.value })} />
            </div>
            <div className="field">
              <label>Endereço comercial</label>
              <input value={form.endereco_comercial} onChange={(event) => setForm({ ...form, endereco_comercial: event.target.value })} />
            </div>
            <div className="field">
              <label>Naturalidade</label>
              <input value={form.naturalidade} onChange={(event) => setForm({ ...form, naturalidade: event.target.value })} />
            </div>
            <div className="field">
              <label>Diagnóstico clínico</label>
              <textarea value={form.diagnostico_clinico} onChange={(event) => setForm({ ...form, diagnostico_clinico: event.target.value })} />
            </div>
            <div className="field">
              <label>Diagnóstico fisioterapêutico</label>
              <textarea value={form.diagnostico_fisioterapeutico} onChange={(event) => setForm({ ...form, diagnostico_fisioterapeutico: event.target.value })} required />
            </div>
          </SectionCard>

          <SectionCard title="2. Avaliação" subtitle="Histórico, queixa principal e antecedentes.">
            <div className="field">
              <label>História clínica</label>
              <textarea value={form.historia_clinica} onChange={(event) => setForm({ ...form, historia_clinica: event.target.value })} />
            </div>
            <div className="field">
              <label>Queixa principal do paciente</label>
              <textarea value={form.queixa_principal_paciente} onChange={(event) => setForm({ ...form, queixa_principal_paciente: event.target.value })} required />
            </div>
            <div className="field">
              <label>Hábitos de vida</label>
              <textarea value={form.habitos_de_vida} onChange={(event) => setForm({ ...form, habitos_de_vida: event.target.value })} />
            </div>
            <div className="field-grid two">
              <div className="field">
                <label>HMA</label>
                <textarea value={form.hma} onChange={(event) => setForm({ ...form, hma: event.target.value })} />
              </div>
              <div className="field">
                <label>HMP</label>
                <textarea value={form.hmp} onChange={(event) => setForm({ ...form, hmp: event.target.value })} />
              </div>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label>Antecedentes pessoais</label>
                <textarea value={form.antecedentes_pessoais} onChange={(event) => setForm({ ...form, antecedentes_pessoais: event.target.value })} />
              </div>
              <div className="field">
                <label>Antecedentes familiares</label>
                <textarea value={form.antecedentes_familiares} onChange={(event) => setForm({ ...form, antecedentes_familiares: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Tratamentos realizados</label>
              <textarea value={form.tratamentos_realizados} onChange={(event) => setForm({ ...form, tratamentos_realizados: event.target.value })} />
            </div>
          </SectionCard>

          <SectionCard title="3. Exame clínico / físico" subtitle="Registro detalhado conforme a ficha original.">
            <div className="field">
              <label>3.1 Apresentação do paciente</label>
              <div className="checkbox-grid">
                {apresentacaoOptions.map((option) => (
                  <label key={option.value} className="check-chip">
                    <input
                      type="checkbox"
                      checked={form.apresentacao_paciente.includes(option.value)}
                      onChange={() => setForm({ ...form, apresentacao_paciente: arrayToggle(form.apresentacao_paciente, option.value) })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field-grid two">
              <div className="binary-card">
                <div className="binary-card-head">
                  <strong>3.2 Exames complementares</strong>
                </div>
                <div className="button-row">
                  <button type="button" className={form.exames_complementares_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, exames_complementares_possui: true })}>Sim</button>
                  <button type="button" className={!form.exames_complementares_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, exames_complementares_possui: false, exames_complementares_descricao: '' })}>Não</button>
                </div>
                {form.exames_complementares_possui && (
                  <div className="field">
                    <label>Se sim, quais?</label>
                    <textarea value={form.exames_complementares_descricao} onChange={(event) => setForm({ ...form, exames_complementares_descricao: event.target.value })} />
                  </div>
                )}
              </div>

              <div className="binary-card">
                <div className="binary-card-head">
                  <strong>3.3 Uso de medicamentos</strong>
                </div>
                <div className="button-row">
                  <button type="button" className={form.uso_medicamentos_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, uso_medicamentos_possui: true })}>Sim</button>
                  <button type="button" className={!form.uso_medicamentos_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, uso_medicamentos_possui: false, uso_medicamentos_descricao: '' })}>Não</button>
                </div>
                {form.uso_medicamentos_possui && (
                  <div className="field">
                    <label>Se sim, quais?</label>
                    <textarea value={form.uso_medicamentos_descricao} onChange={(event) => setForm({ ...form, uso_medicamentos_descricao: event.target.value })} />
                  </div>
                )}
              </div>
            </div>

            <div className="binary-card">
              <div className="binary-card-head">
                <strong>3.4 Cirurgia</strong>
              </div>
              <div className="button-row">
                <button type="button" className={form.cirurgia_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, cirurgia_possui: true })}>Sim</button>
                <button type="button" className={!form.cirurgia_possui ? 'btn' : 'btn-secondary'} onClick={() => setForm({ ...form, cirurgia_possui: false, cirurgia_descricao: '' })}>Não</button>
              </div>
              {form.cirurgia_possui && (
                <div className="field">
                  <label>Se sim, quais?</label>
                  <textarea value={form.cirurgia_descricao} onChange={(event) => setForm({ ...form, cirurgia_descricao: event.target.value })} />
                </div>
              )}
            </div>

            <div className="field">
              <label>3.5 Inspeção / Palpação</label>
              <div className="checkbox-grid">
                {inspecaoOptions.map((option) => (
                  <label key={option.value} className="check-chip">
                    <input
                      type="checkbox"
                      checked={form.inspecao_palpacao.includes(option.value)}
                      onChange={() => setForm({ ...form, inspecao_palpacao: arrayToggle(form.inspecao_palpacao, option.value) })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>3.6 Semiologia</label>
              <textarea value={form.semiologia} onChange={(event) => setForm({ ...form, semiologia: event.target.value })} />
            </div>
            <div className="field">
              <label>3.7 Testes específicos</label>
              <textarea value={form.testes_especificos} onChange={(event) => setForm({ ...form, testes_especificos: event.target.value })} />
            </div>
            <div className="field pain-field">
              <label>3.8 Avaliação da dor - Escala EVA: {form.escala_eva}</label>
              <input
                type="range"
                min="0"
                max="10"
                value={form.escala_eva}
                onChange={(event) => setForm({ ...form, escala_eva: Number(event.target.value) })}
              />
              <div className="slider-scale">
                {Array.from({ length: 11 }, (_, index) => <span key={index}>{index}</span>)}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="4. Plano terapêutico" subtitle="Objetivos, recursos, plano e evolução clínica.">
            <div className="field">
              <label>4.1 Objetivos do tratamento</label>
              <textarea value={form.objetivos_tratamento} onChange={(event) => setForm({ ...form, objetivos_tratamento: event.target.value })} />
            </div>
            <div className="field">
              <label>4.2 Recursos terapêuticos</label>
              <textarea value={form.recursos_terapeuticos} onChange={(event) => setForm({ ...form, recursos_terapeuticos: event.target.value })} />
            </div>
            <div className="field">
              <label>4.3 Plano de tratamento</label>
              <textarea value={form.plano_tratamento} onChange={(event) => setForm({ ...form, plano_tratamento: event.target.value })} required />
            </div>
            <div className="field">
              <label>4.4 Evolução</label>
              <div className="evolution-list">
                {form.evolucao.map((item, index) => (
                  <div className="evolution-item" key={`${item.data}-${index}`}>
                    <div className="field">
                      <label>Data</label>
                      <input
                        type="date"
                        value={item.data}
                        onChange={(event) => {
                          const evolucao = [...form.evolucao];
                          evolucao[index] = { ...evolucao[index], data: event.target.value };
                          setForm({ ...form, evolucao });
                        }}
                      />
                    </div>
                    <div className="field">
                      <label>Descrição</label>
                      <textarea
                        value={item.descricao}
                        onChange={(event) => {
                          const evolucao = [...form.evolucao];
                          evolucao[index] = { ...evolucao[index], descricao: event.target.value };
                          setForm({ ...form, evolucao });
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Remover evolução"
                      onClick={() => {
                        const next = form.evolucao.filter((_, itemIndex) => itemIndex !== index);
                        setForm({ ...form, evolucao: next.length ? next : [{ data: '', descricao: '' }] });
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setForm({ ...form, evolucao: [...form.evolucao, { data: '', descricao: '' }] })}
              >
                <FiPlus style={{ marginRight: 8 }} />
                Adicionar evolução
              </button>
            </div>
            <div className="field">
              <label>Observações gerais</label>
              <textarea value={form.observacoes_gerais} onChange={(event) => setForm({ ...form, observacoes_gerais: event.target.value })} />
            </div>
          </SectionCard>

          <div className="record-form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar prontuário'}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => exportRecordPdf(buildPreviewRecord())}
            >
              <FiDownload style={{ marginRight: 8 }} />
              Exportar como PDF
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
