import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, set, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import jsPDF from 'https://esm.sh/jspdf@2.5.1';
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.2';

const firebaseConfig = {
  apiKey: "AIzaSyB9Oflyz3dnccjwwK_mzSxVHpwURLUtvHw",
  authDomain: "recrutamentostq.firebaseapp.com",
  databaseURL: "https://recrutamentostq-default-rtdb.firebaseio.com",
  projectId: "recrutamentostq",
  storageBucket: "recrutamentostq.firebasestorage.app",
  messagingSenderId: "690287936269",
  appId: "1:690287936269:web:8cc8ea07c03644d0372644"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const cadastrosRef = ref(database, 'cadastros');

const modal = document.getElementById('formModal');
const form = document.getElementById('cadastroForm');
const newBtn = document.getElementById('newBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const tableBody = document.getElementById('tableBody');
const formTitle = document.getElementById('formTitle');
const psicologoDataInput = document.getElementById('psicologoData');
const validadeInput = document.getElementById('validade');
const telefoneInput = document.getElementById('telefone');
const filtroGraduacao = document.getElementById('filtroGraduacao');
const filtroEtapa = document.getElementById('filtroEtapa');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportEmailBtn = document.getElementById('exportEmailBtn');

let todosOsCadastros = [];

// Validar telefone - apenas números
telefoneInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// Calcular validade automaticamente
psicologoDataInput.addEventListener('change', (e) => {
  if (e.target.value) {
    const data = new Date(e.target.value + 'T00:00:00');
    data.setMonth(data.getMonth() + 6);
    validadeInput.value = data.toLocaleDateString('pt-BR');
  } else {
    validadeInput.value = '';
  }
});

// Abrir modal
newBtn.addEventListener('click', () => {
  formTitle.textContent = 'Novo Cadastro';
  form.reset();
  document.getElementById('editId').value = '';
  modal.style.display = 'block';
});

// Fechar modal
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Submeter formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const telefone = document.getElementById('telefone').value;
  if (telefone.length !== 11) {
    alert('O telefone deve ter exatamente 11 dígitos');
    return;
  }

  const data = {
    graduacao: document.getElementById('graduacao').value,
    re: document.getElementById('re').value,
    digito: document.getElementById('digito').value,
    nome: document.getElementById('nome').value,
    telefone: telefone,
    unidade: document.getElementById('unidade').value,
    psicologoData: document.getElementById('psicologoData').value,
    resultado: document.getElementById('resultado').value || 'aguardando',
    validade: validadeInput.value,
    msgP2: document.getElementById('msgP2').value,
    resultadoP2: document.getElementById('resultadoP2').value || 'aguardando',
    tecnicoData: document.getElementById('tecnicoData').value,
    resultadoTecnico: document.getElementById('resultadoTecnico').value || 'aguardando',
    encMovimentacao: document.getElementById('encMovimentacao').value,
    movimentadoData: document.getElementById('movimentadoData').value,
    criadoEm: new Date().toISOString()
  };

  const editId = document.getElementById('editId').value;

  try {
    if (editId) {
      await update(ref(database, `cadastros/${editId}`), data);
    } else {
      await push(cadastrosRef, data);
    }
    modal.style.display = 'none';
    form.reset();
  } catch (error) {
    alert('Erro ao salvar: ' + error.message);
  }
});

// Verificar se validade expirou
function validadeExpirada(validadeStr) {
  if (!validadeStr) return false;
  const partes = validadeStr.split('/');
  if (partes.length !== 3) return false;
  const validade = new Date(partes[2], partes[1] - 1, partes[0]);
  return validade < new Date();
}

// Criar ícone de etapa do psicólogo
function criarEtapaPsicologo(cadastro) {
  const temData = !!cadastro.psicologoData;
  const resultado = cadastro.resultado || 'aguardando';
  const expirada = validadeExpirada(cadastro.validade);
  
  let classe = 'stage';
  let simbolo = '○';
  
  if (resultado === 'favoravel' && expirada) {
    classe = 'stage warning';
    simbolo = '⚠';
  } else if (resultado === 'favoravel') {
    classe = 'stage completed';
    simbolo = '✓';
  } else if (resultado === 'desfavoravel' || resultado === 'nao_compareceu') {
    classe = 'stage rejected';
    simbolo = '✗';
  } else if (temData) {
    classe = 'stage pending';
    simbolo = '○';
  }
  
  return `<span class="${classe}">${simbolo}</span>`;
}

// Criar ícone de etapa P/2
function criarEtapaP2(cadastro) {
  const temMsg = !!cadastro.msgP2;
  const resultado = cadastro.resultadoP2 || 'aguardando';
  
  let classe = 'stage';
  let simbolo = '○';
  
  if (resultado === 'favoravel') {
    classe = 'stage completed';
    simbolo = '✓';
  } else if (resultado === 'desfavoravel') {
    classe = 'stage rejected';
    simbolo = '✗';
  } else if (temMsg) {
    classe = 'stage pending';
    simbolo = '○';
  }
  
  return `<span class="${classe}">${simbolo}</span>`;
}

// Criar ícone de etapa Técnico
function criarEtapaTecnico(cadastro) {
  const temData = !!cadastro.tecnicoData;
  const resultado = cadastro.resultadoTecnico || 'aguardando';
  
  let classe = 'stage';
  let simbolo = '○';
  
  if (resultado === 'favoravel') {
    classe = 'stage completed';
    simbolo = '✓';
  } else if (resultado === 'desfavoravel' || resultado === 'nao_compareceu') {
    classe = 'stage rejected';
    simbolo = '✗';
  } else if (temData) {
    classe = 'stage pending';
    simbolo = '○';
  }
  
  return `<span class="${classe}">${simbolo}</span>`;
}

// Criar ícone de movimentação
function criarEtapaMovimentacao(cadastro) {
  const temData = !!cadastro.movimentadoData;
  const classe = temData ? 'stage completed' : 'stage';
  const simbolo = temData ? '✓' : '○';
  return `<span class="${classe}">${simbolo}</span>`;
}

// Verificar se etapa está concluída (verde)
function etapaConcluida(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || 'aguardando';
    const expirada = validadeExpirada(cadastro.validade);
    return resultado === 'favoravel' && !expirada;
  } else if (etapa === 'p2') {
    return (cadastro.resultadoP2 || 'aguardando') === 'favoravel';
  } else if (etapa === 'tecnico') {
    return (cadastro.resultadoTecnico || 'aguardando') === 'favoravel';
  }
  return false;
}

// Filtrar cadastros
function filtrarCadastros(cadastros) {
  const filtroGrad = filtroGraduacao.value;
  const filtroEt = filtroEtapa.value;
  
  return cadastros.filter(cadastro => {
    // Filtro de graduação
    if (filtroGrad) {
      const grad = cadastro.graduacao.toUpperCase();
      if (filtroGrad === 'cb_sd') {
        if (!grad.includes('CB') && !grad.includes('SD') && !grad.includes('CL')) {
          return false;
        }
      } else if (filtroGrad === 'sgt_subten') {
        if (!grad.includes('SGT') && !grad.includes('SUBTEN')) {
          return false;
        }
      }
    }
    
    // Filtro de etapa
    if (filtroEt && !etapaConcluida(cadastro, filtroEt)) {
      return false;
    }
    
    return true;
  });
}

// Renderizar tabela
function renderizarTabela(cadastros) {
  tableBody.innerHTML = '';
  
  if (cadastros.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="10" class="no-data">Nenhum cadastro encontrado com os filtros selecionados</td></tr>';
    return;
  }

  cadastros.forEach((cadastro) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cadastro.graduacao}</td>
      <td>${cadastro.re}-${cadastro.digito}</td>
      <td>${criarEtapaPsicologo(cadastro)}</td>
      <td>${criarEtapaP2(cadastro)}</td>
      <td>${criarEtapaTecnico(cadastro)}</td>
      <td>${criarEtapaMovimentacao(cadastro)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editarCadastro('${cadastro.id}')">Editar</button>
        <button class="btn-delete" onclick="deletarCadastro('${cadastro.id}')">Excluir</button>
      </td>
    `;
    
    tr.addEventListener('dblclick', (e) => {
      document.querySelectorAll('tr.active').forEach(row => row.classList.remove('active'));
      tr.classList.add('active');
    });
    
    tableBody.appendChild(tr);
  });
}

// Carregar dados
onValue(cadastrosRef, (snapshot) => {
  tableBody.innerHTML = '';
  
  if (!snapshot.exists()) {
    tableBody.innerHTML = '<tr><td colspan="10" class="no-data">Nenhum cadastro encontrado</td></tr>';
    todosOsCadastros = [];
    return;
  }

  todosOsCadastros = [];
  snapshot.forEach((childSnapshot) => {
    todosOsCadastros.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Atualizar ao mudar filtros
filtroGraduacao.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

filtroEtapa.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Formatar telefone
function formatarTelefone(telefone) {
  if (!telefone || telefone.length !== 11) return telefone;
  return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;
}

// Editar
window.editarCadastro = (id) => {
  const cadastroRef = ref(database, `cadastros/${id}`);
  onValue(cadastroRef, (snapshot) => {
    const cadastro = snapshot.val();
    if (cadastro) {
      formTitle.textContent = 'Editar Cadastro';
      document.getElementById('editId').value = id;
      document.getElementById('graduacao').value = cadastro.graduacao;
      document.getElementById('re').value = cadastro.re;
      document.getElementById('digito').value = cadastro.digito;
      document.getElementById('nome').value = cadastro.nome;
      document.getElementById('telefone').value = cadastro.telefone;
      document.getElementById('unidade').value = cadastro.unidade;
      document.getElementById('psicologoData').value = cadastro.psicologoData || '';
      document.getElementById('resultado').value = cadastro.resultado || '';
      validadeInput.value = cadastro.validade || '';
      document.getElementById('msgP2').value = cadastro.msgP2 || '';
      document.getElementById('resultadoP2').value = cadastro.resultadoP2 || '';
      document.getElementById('tecnicoData').value = cadastro.tecnicoData || '';
      document.getElementById('resultadoTecnico').value = cadastro.resultadoTecnico || '';
      document.getElementById('encMovimentacao').value = cadastro.encMovimentacao || '';
      document.getElementById('movimentadoData').value = cadastro.movimentadoData || '';
      modal.style.display = 'block';
    }
  }, { onlyOnce: true });
};

// Deletar
window.deletarCadastro = (id) => {
  if (confirm('Deseja realmente excluir este cadastro?')) {
    remove(ref(database, `cadastros/${id}`));
  }
};

// Clique fora remove ações
document.addEventListener('click', (e) => {
  if (!e.target.closest('tr') && !e.target.closest('.btn-edit') && !e.target.closest('.btn-delete')) {
    document.querySelectorAll('tr.active').forEach(row => row.classList.remove('active'));
  }
});

// Exportar para PDF
exportPdfBtn.addEventListener('click', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  
  if (cadastrosFiltrados.length === 0) {
    alert('Nenhum cadastro para exportar');
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Relatório de Recrutamento', 14, 15);
  
  doc.setFontSize(10);
  const filtroTexto = [];
  if (filtroGraduacao.value === 'cb_sd') filtroTexto.push('Graduação: CB PM e SD PM');
  if (filtroGraduacao.value === 'sgt_subten') filtroTexto.push('Graduação: SGT PM e SUBTEN PM');
  if (filtroEtapa.value === 'psicologo') filtroTexto.push('Etapa Concluída: Psicológico');
  if (filtroEtapa.value === 'p2') filtroTexto.push('Etapa Concluída: P/2');
  if (filtroEtapa.value === 'tecnico') filtroTexto.push('Etapa Concluída: Técnico');
  
  if (filtroTexto.length > 0) {
    doc.text('Filtros: ' + filtroTexto.join(', '), 14, 22);
  }
  
  const tableData = cadastrosFiltrados.map(c => [
    c.graduacao,
    `${c.re}-${c.digito}`,
    c.nome,
    c.unidade,
    getStatusText(c, 'psicologo'),
    getStatusText(c, 'p2'),
    getStatusText(c, 'tecnico'),
    c.movimentadoData ? 'Sim' : 'Não'
  ]);
  
  autoTable(doc, {
    head: [['Graduação', 'RE', 'Nome', 'Unidade', 'Psicológico', 'P/2', 'Técnico', 'Movimentado']],
    body: tableData,
    startY: filtroTexto.length > 0 ? 28 : 22,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 0, 0] }
  });
  
  doc.save('relatorio-recrutamento.pdf');
});

// Compartilhar via email
exportEmailBtn.addEventListener('click', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  
  if (cadastrosFiltrados.length === 0) {
    alert('Nenhum cadastro para compartilhar');
    return;
  }

  let corpo = 'Relatório de Recrutamento\n\n';
  
  const filtroTexto = [];
  if (filtroGraduacao.value === 'cb_sd') filtroTexto.push('CB PM e SD PM');
  if (filtroGraduacao.value === 'sgt_subten') filtroTexto.push('SGT PM e SUBTEN PM');
  if (filtroEtapa.value === 'psicologo') filtroTexto.push('Psicológico concluído');
  if (filtroEtapa.value === 'p2') filtroTexto.push('P/2 concluído');
  if (filtroEtapa.value === 'tecnico') filtroTexto.push('Técnico concluído');
  
  if (filtroTexto.length > 0) {
    corpo += 'Filtros aplicados: ' + filtroTexto.join(', ') + '\n\n';
  }
  
  corpo += `Total de registros: ${cadastrosFiltrados.length}\n\n`;
  corpo += '---\n\n';
  
  cadastrosFiltrados.forEach(c => {
    corpo += `Graduação: ${c.graduacao}\n`;
    corpo += `RE: ${c.re}-${c.digito}\n`;
    corpo += `Nome: ${c.nome}\n`;
    corpo += `Unidade: ${c.unidade}\n`;
    corpo += `Telefone: ${formatarTelefone(c.telefone)}\n`;
    corpo += `Psicológico: ${getStatusText(c, 'psicologo')}\n`;
    corpo += `P/2: ${getStatusText(c, 'p2')}\n`;
    corpo += `Técnico: ${getStatusText(c, 'tecnico')}\n`;
    corpo += `Movimentado: ${c.movimentadoData ? 'Sim' : 'Não'}\n`;
    corpo += '\n---\n\n';
  });
  
  const assunto = encodeURIComponent('Relatório de Recrutamento');
  const corpoEmail = encodeURIComponent(corpo);
  
  window.location.href = `mailto:?subject=${assunto}&body=${corpoEmail}`;
});

// Obter texto de status
function getStatusText(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || 'aguardando';
    const expirada = validadeExpirada(cadastro.validade);
    if (resultado === 'favoravel' && expirada) return 'Favorável (Expirado)';
    if (resultado === 'favoravel') return 'Favorável';
    if (resultado === 'desfavoravel') return 'Desfavorável';
    if (resultado === 'nao_compareceu') return 'Não Compareceu';
    return 'Aguardando';
  } else if (etapa === 'p2') {
    const resultado = cadastro.resultadoP2 || 'aguardando';
    return resultado === 'favoravel' ? 'Favorável' : resultado === 'desfavoravel' ? 'Desfavorável' : 'Aguardando';
  } else if (etapa === 'tecnico') {
    const resultado = cadastro.resultadoTecnico || 'aguardando';
    if (resultado === 'favoravel') return 'Favorável';
    if (resultado === 'desfavoravel') return 'Desfavorável';
    if (resultado === 'nao_compareceu') return 'Não Compareceu';
    return 'Aguardando';
  }
  return '';
}