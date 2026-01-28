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
const whatsappInput = document.getElementById('whatsapp');
const foneFixoInput = document.getElementById('foneFixo');
const filtroGraduacao = document.getElementById('filtroGraduacao');
const filtroEtapa = document.getElementById('filtroEtapa');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportEmailBtn = document.getElementById('exportEmailBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const totalCountEl = document.getElementById('totalCount');
const totalBadge = document.getElementById('totalCadastros');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.querySelector('.close-stats');
const stageSections = document.getElementById('stageSections');

let todosOsCadastros = [];


// Dark Mode Logic
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  darkModeBtn.textContent = '☀️';
} else {
  darkModeBtn.textContent = '🌙';
}

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  darkModeBtn.textContent = isDark ? '☀️' : '🌙';
});

// Validar whatsapp e fone fixo - apenas números
whatsappInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

foneFixoInput.addEventListener('input', (e) => {
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
  stageSections.style.display = 'none'; // Hide stages for new registration
  modal.style.display = 'block';
});

// Update field states based on sequential logic
function updateFieldStates() {
  const psicologoData = document.getElementById('psicologoData').value;
  const resultado = document.getElementById('resultado').value;
  const msgP2 = document.getElementById('msgP2').value;
  const resultadoP2 = document.getElementById('resultadoP2').value;
  const tecnicoData = document.getElementById('tecnicoData').value;
  const resultadoTecnico = document.getElementById('resultadoTecnico').value;
  const encMovimentacao = document.getElementById('encMovimentacao').value;

  // P/2 fields enabled only if psicólogo has data and resultado
  const p2Enabled = psicologoData && resultado && resultado !== 'aguardando';
  document.getElementById('msgP2').disabled = !p2Enabled;
  document.getElementById('resultadoP2').disabled = !p2Enabled;

  // Técnico fields enabled only if P/2 has msg and resultado
  const tecnicoEnabled = p2Enabled && msgP2 && resultadoP2 && resultadoP2 !== 'aguardando';
  document.getElementById('tecnicoData').disabled = !tecnicoEnabled;
  document.getElementById('resultadoTecnico').disabled = !tecnicoEnabled;

  // Encaminhado enabled only if técnico has data and resultado
  const encEnabled = tecnicoEnabled && tecnicoData && resultadoTecnico && resultadoTecnico !== 'aguardando';
  document.getElementById('encMovimentacao').disabled = !encEnabled;

  // Movimentação enabled only if encaminhado is filled
  const movEnabled = encEnabled && encMovimentacao;
  document.getElementById('movimentadoData').disabled = !movEnabled;
}

// Fechar modal
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

closeStatsBtn.addEventListener('click', () => {
  statsModal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
  if (e.target === statsModal) {
    statsModal.style.display = 'none';
  }
});

// Show stats on total badge click
totalBadge.addEventListener('click', () => {
  updateStats();
  statsModal.style.display = 'block';
});

// Update stats
function updateStats() {
  const total = todosOsCadastros.length;
  
  const semEtapas = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === null && !temReprovacao(c)).length;
  const reprovados = todosOsCadastros.filter(c => temReprovacao(c)).length;
  const psicologoConcluido = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === 'psicologo').length;
  const p2Concluido = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === 'p2').length;
  const tecnicoConcluido = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === 'tecnico').length;
  const encaminhadoConcluido = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === 'encaminhado').length;
  const movimentadoConcluido = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === 'movimentado').length;

  document.getElementById('statSemEtapas').style.width = total > 0 ? `${(semEtapas / total) * 100}%` : '0%';
  document.getElementById('statSemEtapasValue').textContent = `${semEtapas} de ${total}`;
  
  document.getElementById('statReprovados').style.width = total > 0 ? `${(reprovados / total) * 100}%` : '0%';
  document.getElementById('statReprovadosValue').textContent = `${reprovados} de ${total}`;

  document.getElementById('statPsicologo').style.width = total > 0 ? `${(psicologoConcluido / total) * 100}%` : '0%';
  document.getElementById('statPsicologoValue').textContent = `${psicologoConcluido} de ${total}`;
  
  document.getElementById('statP2').style.width = total > 0 ? `${(p2Concluido / total) * 100}%` : '0%';
  document.getElementById('statP2Value').textContent = `${p2Concluido} de ${total}`;
  
  document.getElementById('statTecnico').style.width = total > 0 ? `${(tecnicoConcluido / total) * 100}%` : '0%';
  document.getElementById('statTecnicoValue').textContent = `${tecnicoConcluido} de ${total}`;
  
  document.getElementById('statEncaminhado').style.width = total > 0 ? `${(encaminhadoConcluido / total) * 100}%` : '0%';
  document.getElementById('statEncaminhadoValue').textContent = `${encaminhadoConcluido} de ${total}`;
  
  document.getElementById('statMovimentado').style.width = total > 0 ? `${(movimentadoConcluido / total) * 100}%` : '0%';
  document.getElementById('statMovimentadoValue').textContent = `${movimentadoConcluido} de ${total}`;
}

// Helper function to check if record has any rejection
function temReprovacao(cadastro) {
  return etapaReprovada(cadastro, 'psicologo') || 
         etapaReprovada(cadastro, 'p2') || 
         etapaReprovada(cadastro, 'tecnico');
}

// Add listeners to form fields for sequential enabling
document.getElementById('psicologoData').addEventListener('change', updateFieldStates);
document.getElementById('resultado').addEventListener('change', updateFieldStates);
document.getElementById('msgP2').addEventListener('input', updateFieldStates);
document.getElementById('resultadoP2').addEventListener('change', updateFieldStates);
document.getElementById('tecnicoData').addEventListener('change', updateFieldStates);
document.getElementById('resultadoTecnico').addEventListener('change', updateFieldStates);
document.getElementById('encMovimentacao').addEventListener('input', updateFieldStates);

// Submeter formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const whatsapp = document.getElementById('whatsapp').value;
  if (whatsapp.length !== 11) {
    alert('O WhatsApp deve ter exatamente 11 dígitos');
    return;
  }

  const foneFixo = document.getElementById('foneFixo').value;
  if (foneFixo && foneFixo.length !== 10) {
    alert('O Fone Fixo deve ter exatamente 10 dígitos');
    return;
  }

  const data = {
    graduacao: document.getElementById('graduacao').value,
    re: document.getElementById('re').value.toUpperCase(),
    digito: document.getElementById('digito').value.toUpperCase(),
    nome: document.getElementById('nome').value.toUpperCase(),
    email: document.getElementById('email').value.toLowerCase(),
    whatsapp: whatsapp,
    foneFixo: foneFixo,
    unidade: document.getElementById('unidade').value.toUpperCase(),
    psicologoData: document.getElementById('psicologoData').value,
    resultado: document.getElementById('resultado').value || 'aguardando',
    validade: validadeInput.value,
    msgP2: document.getElementById('msgP2').value.toUpperCase(),
    resultadoP2: document.getElementById('resultadoP2').value || 'aguardando',
    tecnicoData: document.getElementById('tecnicoData').value,
    resultadoTecnico: document.getElementById('resultadoTecnico').value || 'aguardando',
    encMovimentacao: document.getElementById('encMovimentacao').value.toUpperCase(),
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

// Criar ícone de Encaminhado
function criarEtapaEncaminhado(cadastro) {
  const temEnc = !!cadastro.encMovimentacao;
  const classe = temEnc ? 'stage completed' : 'stage';
  const simbolo = temEnc ? '✓' : '○';
  return `<span class="${classe}">${simbolo}</span>`;
}

// Criar ícone de movimentação
function criarEtapaMovimentacao(cadastro) {
  const temData = !!cadastro.movimentadoData;
  const classe = temData ? 'stage completed' : 'stage';
  const simbolo = temData ? '✓' : '○';
  return `<span class="${classe}">${simbolo}</span>`;
}

// Check if no stages are filled
function semEtapasPreenchidas(cadastro) {
  return !cadastro.psicologoData && 
         !cadastro.msgP2 && 
         !cadastro.tecnicoData && 
         !cadastro.encMovimentacao && 
         !cadastro.movimentadoData;
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
  } else if (etapa === 'encaminhado') {
    return !!cadastro.encMovimentacao;
  } else if (etapa === 'movimentado') {
    return !!cadastro.movimentadoData;
  }
  return false;
}

// Verificar se etapa está reprovada
function etapaReprovada(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || 'aguardando';
    return resultado === 'desfavoravel' || resultado === 'nao_compareceu';
  } else if (etapa === 'p2') {
    return (cadastro.resultadoP2 || 'aguardando') === 'desfavoravel';
  } else if (etapa === 'tecnico') {
    const resultado = cadastro.resultadoTecnico || 'aguardando';
    return resultado === 'desfavoravel' || resultado === 'nao_compareceu';
  }
  return false;
}

// Obter última etapa concluída do cadastro
function ultimaEtapaConcluida(cadastro) {
  // Verificar se alguma etapa foi reprovada - se sim, não tem última etapa
  if (etapaReprovada(cadastro, 'psicologo') || 
      etapaReprovada(cadastro, 'p2') || 
      etapaReprovada(cadastro, 'tecnico')) {
    return null;
  }
  
  if (etapaConcluida(cadastro, 'movimentado')) return 'movimentado';
  if (etapaConcluida(cadastro, 'encaminhado')) return 'encaminhado';
  if (etapaConcluida(cadastro, 'tecnico')) return 'tecnico';
  if (etapaConcluida(cadastro, 'p2')) return 'p2';
  if (etapaConcluida(cadastro, 'psicologo')) return 'psicologo';
  return null;
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
    if (filtroEt === 'sem_etapas') {
      return semEtapasPreenchidas(cadastro);
    } else if (filtroEt === 'reprovados') {
      // Show all records that have any stage rejected
      return etapaReprovada(cadastro, 'psicologo') || 
             etapaReprovada(cadastro, 'p2') || 
             etapaReprovada(cadastro, 'tecnico');
    } else if (filtroEt && !etapaConcluida(cadastro, filtroEt)) {
      return false;
    }
    
    return true;
  });
}

// Renderizar tabela
function renderizarTabela(cadastros) {
  tableBody.innerHTML = '';
  
  if (cadastros.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="11" class="no-data">Nenhum cadastro encontrado com os filtros selecionados</td></tr>';
    return;
  }

  cadastros.forEach((cadastro) => {
    const whatsappLink = cadastro.whatsapp ? `https://wa.me/55${cadastro.whatsapp}` : '#';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cadastro.graduacao}</td>
      <td>${cadastro.re}-${cadastro.digito}</td>
      <td>${cadastro.nome}</td>
      <td><a href="${whatsappLink}" target="_blank" class="whatsapp-link"><img src="/whatassssss.png" alt="WhatsApp" style="width: 24px; height: 24px; vertical-align: middle;"></a></td>
      <td>${criarEtapaPsicologo(cadastro)}</td>
      <td>${criarEtapaP2(cadastro)}</td>
      <td>${criarEtapaTecnico(cadastro)}</td>
      <td>${criarEtapaEncaminhado(cadastro)}</td>
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


// Atualizar gráficos de estágio
function atualizarGraficos() {
  const total = todosOsCadastros.length;
  if (total === 0) return;
  
  const etapas = ['semEtapas', 'reprovados', 'psicologo', 'p2', 'tecnico', 'encaminhado', 'movimentado'];
  
  etapas.forEach(etapa => {
    let concluidos = 0;
    
    // Special handling for semEtapas and reprovados
    if (etapa === 'semEtapas') {
      concluidos = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === null && !temReprovacao(c)).length;
    } else if (etapa === 'reprovados') {
      concluidos = todosOsCadastros.filter(c => temReprovacao(c)).length;
    } else {
      // Contar apenas registros cuja última etapa concluída é esta etapa específica
      concluidos = todosOsCadastros.filter(c => ultimaEtapaConcluida(c) === etapa).length;
    }
    
    const porcentagem = Math.round((concluidos / total) * 100);
    
    // Atualizar líquido
    const liquidEl = document.getElementById(`liquid${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    const percentEl = document.getElementById(`percent${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    
    if (liquidEl) liquidEl.style.height = `${porcentagem}%`;
    if (percentEl) percentEl.textContent = `${porcentagem}%`;
    
    // Calcular breakdown por graduação
    let cbSd = 0;
    let sgtSubten = 0;
    
    if (etapa === 'semEtapas') {
      cbSd = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('CB') || grad.includes('SD') || grad.includes('CL')) && 
               ultimaEtapaConcluida(c) === null && !temReprovacao(c);
      }).length;
      
      sgtSubten = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('SGT') || grad.includes('SUBTEN')) && 
               ultimaEtapaConcluida(c) === null && !temReprovacao(c);
      }).length;
    } else if (etapa === 'reprovados') {
      cbSd = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('CB') || grad.includes('SD') || grad.includes('CL')) && temReprovacao(c);
      }).length;
      
      sgtSubten = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('SGT') || grad.includes('SUBTEN')) && temReprovacao(c);
      }).length;
    } else {
      cbSd = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('CB') || grad.includes('SD') || grad.includes('CL')) && ultimaEtapaConcluida(c) === etapa;
      }).length;
      
      sgtSubten = todosOsCadastros.filter(c => {
        const grad = c.graduacao.toUpperCase();
        return (grad.includes('SGT') || grad.includes('SUBTEN')) && ultimaEtapaConcluida(c) === etapa;
      }).length;
    }
    
    // Desenhar gráfico circular
    const canvas = document.getElementById(`chart${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const centerX = 60;
      const centerY = 60;
      const radius = 50;
      
      ctx.clearRect(0, 0, 120, 120);
      
      // Background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#e0e0e0';
      ctx.fill();
      
      if (concluidos > 0) {
        // CB/SD segment
        const cbSdAngle = (cbSd / concluidos) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + cbSdAngle);
        ctx.closePath();
        ctx.fillStyle = '#2196F3';
        ctx.fill();
        
        // SGT/SUBTEN segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2 + cbSdAngle, -Math.PI / 2 + 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#FF9800';
        ctx.fill();
      }
      
      // Inner circle for donut effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
      ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#1e1e1e' : 'white';
      ctx.fill();
      
      // Text
      ctx.fillStyle = '#333';
      ctx.font = 'bold 11px Noto Sans';
      ctx.textAlign = 'center';
      
      if (concluidos > 0) {
        const cbPercent = Math.round((cbSd / concluidos) * 100);
        const sgtPercent = Math.round((sgtSubten / concluidos) * 100);
        ctx.fillText(`CB/SD: ${cbPercent}%`, centerX, centerY - 5);
        ctx.fillText(`SGT: ${sgtPercent}%`, centerX, centerY + 10);
      } else {
        ctx.fillText('0%', centerX, centerY + 5);
      }
    }
  });
}

// Carregar dados
onValue(cadastrosRef, (snapshot) => {
  tableBody.innerHTML = '';
  
  if (!snapshot.exists()) {
    tableBody.innerHTML = '<tr><td colspan="10" class="no-data">Nenhum cadastro encontrado</td></tr>';
    todosOsCadastros = [];
    totalCountEl.textContent = '0';
    atualizarGraficos();
    return;
  }

  todosOsCadastros = [];
  snapshot.forEach((childSnapshot) => {
    todosOsCadastros.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  totalCountEl.textContent = todosOsCadastros.length;
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
  atualizarGraficos();
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
  if (!telefone) return telefone;
  if (telefone.length === 11) {
    return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;
  } else if (telefone.length === 10) {
    return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 6)}-${telefone.substring(6)}`;
  }
  return telefone;
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
      document.getElementById('email').value = cadastro.email || '';
      document.getElementById('whatsapp').value = cadastro.whatsapp || cadastro.telefone || '';
      document.getElementById('foneFixo').value = cadastro.foneFixo || '';
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
      
      stageSections.style.display = 'block'; // Show stages for editing
      updateFieldStates(); // Enable/disable fields based on sequential logic
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
  
  // Determinar nome do filtro para cabeçalho
  let filtroNome = 'TODOS OS REGISTROS';
  if (filtroGraduacao.value === 'cb_sd') {
    filtroNome = 'CB PM E SD PM';
  } else if (filtroGraduacao.value === 'sgt_subten') {
    filtroNome = 'SGT PM E SUBTEN PM';
  }
  
  if (filtroEtapa.value === 'sem_etapas') {
    filtroNome += ' - SEM ETAPAS PREENCHIDAS';
  } else if (filtroEtapa.value === 'reprovados') {
    filtroNome += ' - REPROVADOS';
  } else if (filtroEtapa.value === 'psicologo') {
    filtroNome += ' - PSICOLÓGICO CONCLUÍDO';
  } else if (filtroEtapa.value === 'p2') {
    filtroNome += ' - P/2 CONCLUÍDO';
  } else if (filtroEtapa.value === 'tecnico') {
    filtroNome += ' - TÉCNICO CONCLUÍDO';
  } else if (filtroEtapa.value === 'encaminhado') {
    filtroNome += ' - ENCAMINHADO';
  } else if (filtroEtapa.value === 'movimentado') {
    filtroNome += ' - MOVIMENTADO';
  }
  
  doc.setFontSize(14);
  doc.text(filtroNome, 14, 15);
  
  const tableData = cadastrosFiltrados.map(c => {
    const emailTruncado = c.email ? c.email.split('@')[0] : '';
    return [
      c.graduacao,
      c.nome,
      emailTruncado,
      formatarTelefone(c.whatsapp || c.telefone),
      c.unidade
    ];
  });
  
  autoTable(doc, {
    head: [['Graduação', 'Nome', 'Email', 'WhatsApp', 'Unidade']],
    body: tableData,
    startY: 22,
    styles: { fontSize: 9 },
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
  if (filtroEtapa.value === 'encaminhado') filtroTexto.push('Encaminhado concluído');
  if (filtroEtapa.value === 'movimentado') filtroTexto.push('Movimentado concluído');
  
  if (filtroTexto.length > 0) {
    corpo += 'Filtros aplicados: ' + filtroTexto.join(', ') + '\n\n';
  }
  
  corpo += `Total de registros: ${cadastrosFiltrados.length}\n\n`;
  corpo += '---\n\n';
  
  cadastrosFiltrados.forEach(c => {
    corpo += `Graduação: ${c.graduacao}\n`;
    corpo += `RE: ${c.re}-${c.digito}\n`;
    corpo += `Nome: ${c.nome}\n`;
    corpo += `Email: ${c.email}\n`;
    corpo += `WhatsApp: ${formatarTelefone(c.whatsapp || c.telefone)}\n`;
    if (c.foneFixo) corpo += `Fone Fixo: ${formatarTelefone(c.foneFixo)}\n`;
    corpo += `Unidade: ${c.unidade}\n`;
    corpo += `Psicológico: ${getStatusText(c, 'psicologo')}\n`;
    corpo += `P/2: ${getStatusText(c, 'p2')}\n`;
    corpo += `Técnico: ${getStatusText(c, 'tecnico')}\n`;
    corpo += `Encaminhado: ${c.encMovimentacao ? 'Sim' : 'Não'}\n`;
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