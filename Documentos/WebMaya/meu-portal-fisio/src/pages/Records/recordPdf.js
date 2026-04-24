import { jsPDF } from 'jspdf';

function addWrappedText(doc, label, value, x, y, maxWidth) {
  doc.setFont('helvetica', 'bold');
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(value || '-', maxWidth);
  doc.text(lines, x, y + 5);
  return y + 5 + (lines.length * 5);
}

function normalizeItems(items) {
  return items?.length ? items.join(', ') : '-';
}

export function exportRecordPdf(record) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 16;
  const width = 178;
  let y = 16;

  const ensureSpace = (required = 18) => {
    if (y + required > 280) {
      doc.addPage();
      y = 16;
    }
  };

  doc.setDrawColor(113, 217, 209);
  doc.setFillColor(245, 251, 251);
  doc.roundedRect(12, 10, 186, 277, 4, 4, 'S');
  doc.roundedRect(margin, 14, width, 18, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FICHA DE AVALIACAO DE FISIOTERAPIA', margin + 4, 22);
  doc.setFontSize(11);
  doc.text('Maya Yamamoto - RPG', margin + 4, 28);
  doc.text(`Data da avaliacao: ${record.data_avaliacao || '-'}`, 140, 28, { align: 'right' });
  y = 40;

  const sections = [
    {
      title: '1. IDENTIFICACAO',
      fields: [
        ['Nome', record.identificacao?.nome],
        ['Data de nascimento', record.identificacao?.dataNascimento],
        ['Telefone', record.identificacao?.telefone],
        ['Sexo', record.identificacao?.sexo],
        ['Cidade', record.identificacao?.cidade],
        ['Bairro', record.identificacao?.bairro],
        ['Profissao', record.identificacao?.profissao],
        ['Endereco residencial', record.identificacao?.enderecoResidencial],
        ['Endereco comercial', record.identificacao?.enderecoComercial],
        ['Naturalidade', record.identificacao?.naturalidade],
        ['Estado civil', record.identificacao?.estadoCivil],
        ['Diagnostico clinico', record.identificacao?.diagnosticoClinico],
        ['Diagnostico fisioterapeutico', record.identificacao?.diagnosticoFisioterapeutico],
      ],
    },
    {
      title: '2. AVALIACAO',
      fields: [
        ['Historia clinica', record.avaliacao?.historiaClinica],
        ['Queixa principal do paciente', record.avaliacao?.queixaPrincipalPaciente],
        ['Habitos de vida', record.avaliacao?.habitosDeVida],
        ['HMA', record.avaliacao?.hma],
        ['HMP', record.avaliacao?.hmp],
        ['Antecedentes pessoais', record.avaliacao?.antecedentesPessoais],
        ['Antecedentes familiares', record.avaliacao?.antecedentesFamiliares],
        ['Tratamentos realizados', record.avaliacao?.tratamentosRealizados],
      ],
    },
    {
      title: '3. EXAME CLINICO / FISICO',
      fields: [
        ['Apresentacao do paciente', normalizeItems(record.exameClinico?.apresentacaoPaciente)],
        ['Exames complementares', record.exameClinico?.examesComplementares?.possui ? `Sim. ${record.exameClinico?.examesComplementares?.descricao || ''}` : 'Nao'],
        ['Uso de medicamentos', record.exameClinico?.usoMedicamentos?.possui ? `Sim. ${record.exameClinico?.usoMedicamentos?.descricao || ''}` : 'Nao'],
        ['Cirurgia', record.exameClinico?.cirurgia?.possui ? `Sim. ${record.exameClinico?.cirurgia?.descricao || ''}` : 'Nao'],
        ['Inspecao / palpacao', normalizeItems(record.exameClinico?.inspecaoPalpacao)],
        ['Semiologia', record.exameClinico?.semiologia],
        ['Testes especificos', record.exameClinico?.testesEspecificos],
        ['Escala EVA', String(record.exameClinico?.escalaEva ?? 0)],
      ],
    },
    {
      title: '4. PLANO TERAPEUTICO',
      fields: [
        ['Objetivos do tratamento', record.planoTerapeutico?.objetivosTratamento],
        ['Recursos terapeuticos', record.planoTerapeutico?.recursosTerapeuticos],
        ['Plano de tratamento', record.planoTerapeutico?.planoTratamento],
        ['Evolucao', (record.planoTerapeutico?.evolucao || []).map((item) => `${item.data}: ${item.descricao}`).join('\n') || '-'],
      ],
    },
  ];

  sections.forEach((section) => {
    ensureSpace(22);
    doc.setFillColor(237, 248, 247);
    doc.roundedRect(margin, y - 4, width, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, margin + 2, y + 1);
    y += 10;

    section.fields.forEach(([label, value]) => {
      ensureSpace(16);
      doc.setFontSize(10);
      y = addWrappedText(doc, label, value, margin + 2, y, width - 8);
      y += 3;
    });
  });

  ensureSpace(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Fisioterapeuta: ${record.fisioterapeuta || 'Maya Yamamoto - RPG'}`, margin + 2, y + 6);
  doc.save(`prontuario-${(record.identificacao?.nome || 'paciente').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
