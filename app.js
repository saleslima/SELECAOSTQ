import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, set, onValue, remove, update, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
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
const usuariosRef = ref(database, 'usuarios');

let currentUser = null;

const modal = document.getElementById('formModal');
const form = document.getElementById('cadastroForm');
const newBtn = document.getElementById('newBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const tableBody = document.getElementById('tableBody');
const formTitle = document.getElementById('formTitle');
const psicologoDataInput = document.getElementById('psicologoData');
const psicologoHoraInput = document.getElementById('psicologoHora');
const validadeInput = document.getElementById('validade');
const msgP2Input = document.getElementById('msgP2');
const msgP2TimestampEl = document.getElementById('msgP2Timestamp');
const tecnicoHoraInput = document.getElementById('tecnicoHora');
const resultadoInput = document.getElementById('resultado');
const whatsappInput = document.getElementById('whatsapp');
const foneFixoInput = document.getElementById('foneFixo');
const filtroSubtenSgt = document.getElementById('filtroSubtenSgt');
const filtroCbSd = document.getElementById('filtroCbSd');
const filtroSd2cl = document.getElementById('filtroSd2cl');
const resultLimit = document.getElementById('resultLimit');
const filtroEtapa = document.getElementById('filtroEtapa');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const todayBtn = document.getElementById('todayBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const lightModeBtn = document.getElementById('lightModeBtn');
const todayModal = document.getElementById('todayModal');
const closeTodayBtn = document.querySelector('.close-today');
const detalhesHojeBtn = document.getElementById('detalhesHojeBtn');
const detalhesHojeContent = document.getElementById('detalhesHojeContent');
const totalHojeEl = document.getElementById('totalHoje');
const totalManhaEl = document.getElementById('totalManha');
const totalTardeEl = document.getElementById('totalTarde');
const totalCountEl = document.getElementById('totalCount');
const totalBadge = document.getElementById('totalCadastros');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.querySelector('.close-stats');
const stageSections = document.getElementById('stageSections');
const checkConcluida = document.getElementById('checkConcluida');
const checkAgendada = document.getElementById('checkAgendada');
const checkReprovada = document.getElementById('checkReprovada');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const deleteFilteredBtn = document.getElementById('deleteFilteredBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const mainContainer = document.getElementById('mainContainer');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminBtn = document.querySelector('.close-admin');
const newUserBtn = document.getElementById('newUserBtn');
const userFormModal = document.getElementById('userFormModal');
const userForm = document.getElementById('userForm');
const closeUserFormBtn = document.querySelector('.close-user-form');
const cancelUserBtn = document.getElementById('cancelUserBtn');
const usersTableBody = document.getElementById('usersTableBody');
const encaminhadoCheck = document.getElementById('encaminhadoCheck');
const movimentadoCheck = document.getElementById('movimentadoCheck');
const encaminhadoTimestamp = document.getElementById('encaminhadoTimestamp');
const movimentadoTimestamp = document.getElementById('movimentadoTimestamp');
const filterPsicoReteste = document.getElementById('filterPsicoReteste');
const filterPsicoExpiring = document.getElementById('filterPsicoExpiring');
const searchRE = document.getElementById('searchRE');
const timelineModal = document.getElementById('timelineModal');
const closeTimelineBtn = document.querySelector('.close-timeline');
const timelineContent = document.getElementById('timelineContent');
const psicAgModal = document.getElementById('psicAgModal');
const closePsicAgBtn = document.querySelector('.close-psic-ag');
const savePsicAgBtn = document.getElementById('savePsicAgBtn');
const psicAgDiaSemana = document.getElementById('psicAgDiaSemana');
const psicAgVagasManha = document.getElementById('psicAgVagasManha');
const psicAgVagasTarde = document.getElementById('psicAgVagasTarde');
const psicAgInfoContent = document.getElementById('psicAgInfoContent');
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeCustomizeBtn = document.querySelector('.close-customize');
const customFontColor = document.getElementById('customFontColor');
const customFontSize = document.getElementById('customFontSize');
const customBgColor = document.getElementById('customBgColor');
const applyCustomBtn = document.getElementById('applyCustomBtn');
const resetCustomBtn = document.getElementById('resetCustomBtn');
const adminSettingsModal = document.getElementById('adminSettingsModal');
const closeAdminSettingsBtn = document.querySelector('.close-admin-settings');
const adminSettingsBtn = document.getElementById('adminSettingsBtn');
const saveAdminSettingsBtn = document.getElementById('saveAdminSettingsBtn');
const validadeAprovadoInput = document.getElementById('validadeAprovado');
const validadeReprovadoInput = document.getElementById('validadeReprovado');

let todosOsCadastros = [];
let psicoRetesteFilter = false;
let psicoExpiringFilter = false;
let psicAgVagas = {};

// Load psic_ag vacancies from localStorage
function loadPsicAgVagas() {
  const saved = localStorage.getItem('psic_ag_vagas');
  if (saved) {
    psicAgVagas = JSON.parse(saved);
  }
}

function savePsicAgVagas() {
  localStorage.setItem('psic_ag_vagas', JSON.stringify(psicAgVagas));
}

loadPsicAgVagas();

// Initialize default users if not exists
async function initializeDefaultUser() {
  const snapshot = await get(usuariosRef);
  if (!snapshot.exists()) {
    await push(usuariosRef, {
      nome: 'ADMINISTRADOR STQ',
      re: '000000',
      email: 'admin@stq.pm',
      login: 'stq',
      senha: 'daqta',
      perfil: 'stq'
    });
    await push(usuariosRef, {
      nome: 'ADMINISTRADOR',
      re: '000001',
      email: 'admin@admin.pm',
      login: 'admin',
      senha: 'daqta',
      perfil: 'stq'
    });
  }
}

initializeDefaultUser();

// Check for saved session
function checkSession() {
  const savedUser = localStorage.getItem('stq_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    setupAuthenticatedUI();
  }
}

function setupAuthenticatedUI() {
  loginModal.style.display = 'none';
  mainContainer.style.display = 'block';
  
  // Hide admin button if not STQ
  if (currentUser.perfil !== 'stq') {
    adminBtn.style.display = 'none';
  } else {
    adminBtn.style.display = 'inline-block';
  }
  
  // Hide new registration button for p2 and psicologico
  if (currentUser.perfil === 'p2' || currentUser.perfil === 'psicologico') {
    newBtn.style.display = 'none';
  } else {
    newBtn.style.display = 'inline-block';
  }
  
  // Load custom settings after UI is ready
  loadCustomSettings();
}

// Run session check on load
checkSession();

// Load custom settings on page load
function loadCustomSettings() {
  const fontColor = localStorage.getItem('customFontColor');
  const fontSize = localStorage.getItem('customFontSize');
  const bgColor = localStorage.getItem('customBgColor');
  
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  if (fontColor) {
    container.style.color = fontColor;
    customFontColor.value = fontColor;
  }
  
  if (fontSize) {
    container.style.fontSize = fontSize + 'px';
    customFontSize.value = fontSize;
  }
  
  if (bgColor) {
    container.style.backgroundColor = bgColor;
    customBgColor.value = bgColor;
  }
}

// Load admin settings
function loadAdminSettings() {
  const validadeAprovado = localStorage.getItem('validadeAprovado');
  const validadeReprovado = localStorage.getItem('validadeReprovado');
  
  if (validadeAprovado) {
    validadeAprovadoInput.value = validadeAprovado;
  } else {
    localStorage.setItem('validadeAprovado', '180');
  }
  
  if (validadeReprovado) {
    validadeReprovadoInput.value = validadeReprovado;
  } else {
    localStorage.setItem('validadeReprovado', '180');
  }
}

loadAdminSettings();

// Customize button
customizeBtn.addEventListener('click', () => {
  customizeModal.style.display = 'block';
});

closeCustomizeBtn.addEventListener('click', () => {
  customizeModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === customizeModal) {
    customizeModal.style.display = 'none';
  }
  if (e.target === adminSettingsModal) {
    adminSettingsModal.style.display = 'none';
  }
});

// Admin settings button
adminSettingsBtn.addEventListener('click', () => {
  loadAdminSettings();
  adminSettingsModal.style.display = 'block';
});

closeAdminSettingsBtn.addEventListener('click', () => {
  adminSettingsModal.style.display = 'none';
});

// Save admin settings
saveAdminSettingsBtn.addEventListener('click', () => {
  const validadeAprovado = validadeAprovadoInput.value;
  const validadeReprovado = validadeReprovadoInput.value;
  
  if (!validadeAprovado || validadeAprovado < 1) {
    alert('Validade para aprovado deve ser no mínimo 1 dia');
    return;
  }
  
  if (!validadeReprovado || validadeReprovado < 1) {
    alert('Validade para reprovado deve ser no mínimo 1 dia');
    return;
  }
  
  localStorage.setItem('validadeAprovado', validadeAprovado);
  localStorage.setItem('validadeReprovado', validadeReprovado);
  
  adminSettingsModal.style.display = 'none';
  alert('Configurações salvas com sucesso!');
});

// Apply custom settings
applyCustomBtn.addEventListener('click', () => {
  const fontColor = customFontColor.value;
  const fontSize = customFontSize.value;
  const bgColor = customBgColor.value;
  
  const container = document.getElementById('mainContainer');
  if (container) {
    container.style.color = fontColor;
    container.style.fontSize = fontSize + 'px';
    container.style.backgroundColor = bgColor;
  }
  
  localStorage.setItem('customFontColor', fontColor);
  localStorage.setItem('customFontSize', fontSize);
  localStorage.setItem('customBgColor', bgColor);
  
  customizeModal.style.display = 'none';
  alert('Personalização aplicada com sucesso!');
});

// Reset custom settings
resetCustomBtn.addEventListener('click', () => {
  localStorage.removeItem('customFontColor');
  localStorage.removeItem('customFontSize');
  localStorage.removeItem('customBgColor');
  
  const container = document.getElementById('mainContainer');
  if (container) {
    container.style.color = '';
    container.style.fontSize = '';
    container.style.backgroundColor = '';
  }
  
  customFontColor.value = '#1a1a1a';
  customFontSize.value = '13';
  customBgColor.value = '#ffffff';
  
  alert('Personalização resetada!');
  customizeModal.style.display = 'none';
});

// Login functionality
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const usuario = document.getElementById('loginUsuario').value;
  const senha = document.getElementById('loginSenha').value;
  
  const snapshot = await get(usuariosRef);
  
  if (snapshot.exists()) {
    let userFound = false;
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      if (user.login === usuario && user.senha === senha) {
        userFound = true;
        currentUser = {
          id: childSnapshot.key,
          ...user
        };
      }
    });
    
    if (userFound) {
      localStorage.setItem('stq_user', JSON.stringify(currentUser));
      setupAuthenticatedUI();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  } else {
    alert('Nenhum usuário cadastrado!');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('stq_user');
  mainContainer.style.display = 'none';
  loginModal.style.display = 'block';
  loginForm.reset();
});

// Admin button
adminBtn.addEventListener('click', () => {
  if (currentUser && currentUser.perfil === 'stq') {
    const senha = prompt('Digite a senha de administrador:');
    if (senha === 'daqta') {
      loadUsers();
      adminModal.style.display = 'block';
    } else {
      alert('Senha incorreta!');
    }
  }
});

closeAdminBtn.addEventListener('click', () => {
  adminModal.style.display = 'none';
});

// New user button
newUserBtn.addEventListener('click', () => {
  document.getElementById('userFormTitle').textContent = 'Novo Usuário';
  userForm.reset();
  document.getElementById('editUserId').value = '';
  userFormModal.style.display = 'block';
});

closeUserFormBtn.addEventListener('click', () => {
  userFormModal.style.display = 'none';
});

cancelUserBtn.addEventListener('click', () => {
  userFormModal.style.display = 'none';
});

// User form submit
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    nome: document.getElementById('userName').value.toUpperCase(),
    re: document.getElementById('userRE').value,
    email: document.getElementById('userEmail').value.toLowerCase(),
    login: document.getElementById('userLogin').value.toLowerCase(),
    senha: document.getElementById('userPassword').value,
    perfil: document.getElementById('userPerfil').value
  };
  
  const editId = document.getElementById('editUserId').value;
  
  try {
    if (editId) {
      await update(ref(database, `usuarios/${editId}`), userData);
    } else {
      await push(usuariosRef, userData);
    }
    userFormModal.style.display = 'none';
    loadUsers();
  } catch (error) {
    alert('Erro ao salvar usuário: ' + error.message);
  }
});

// Load users
function loadUsers() {
  onValue(usuariosRef, (snapshot) => {
    usersTableBody.innerHTML = '';
    
    if (!snapshot.exists()) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhum usuário encontrado</td></tr>';
      return;
    }
    
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.nome}</td>
        <td>${user.re}</td>
        <td>${user.email}</td>
        <td>${user.perfil.toUpperCase()}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editUser('${childSnapshot.key}')">Editar</button>
          <button class="btn-delete" onclick="deleteUser('${childSnapshot.key}')">Excluir</button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });
  }, { onlyOnce: true });
}

// Edit user
window.editUser = async (id) => {
  const snapshot = await get(ref(database, `usuarios/${id}`));
  const user = snapshot.val();
  
  if (user) {
    document.getElementById('userFormTitle').textContent = 'Editar Usuário';
    document.getElementById('editUserId').value = id;
    document.getElementById('userName').value = user.nome;
    document.getElementById('userRE').value = user.re;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userLogin').value = user.login;
    document.getElementById('userPassword').value = user.senha;
    document.getElementById('userPerfil').value = user.perfil;
    userFormModal.style.display = 'block';
  }
};

// Delete user
window.deleteUser = (id) => {
  if (confirm('Deseja realmente excluir este usuário?')) {
    remove(ref(database, `usuarios/${id}`));
    loadUsers();
  }
};

// Encaminhado checkbox
encaminhadoCheck.addEventListener('change', (e) => {
  if (e.target.checked) {
    const now = new Date().toISOString();
    encaminhadoTimestamp.textContent = `Encaminhado em: ${new Date(now).toLocaleString('pt-BR')}`;
  } else {
    encaminhadoTimestamp.textContent = '';
  }
  updateSequentialPhases();
});

// Movimentado checkbox
movimentadoCheck.addEventListener('change', (e) => {
  if (e.target.checked) {
    const now = new Date().toISOString();
    movimentadoTimestamp.textContent = `Movimentado em: ${new Date(now).toLocaleString('pt-BR')}`;
  } else {
    movimentadoTimestamp.textContent = '';
  }
});


// Dark Mode Logic
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  darkModeBtn.textContent = '☀️';
} else {
  darkModeBtn.textContent = '🌙';
}

darkModeBtn.addEventListener('click', () => {
  // Clear custom settings
  localStorage.removeItem('customFontColor');
  localStorage.removeItem('customFontSize');
  localStorage.removeItem('customBgColor');
  const container = document.getElementById('mainContainer');
  if (container) {
    container.style.color = '';
    container.style.fontSize = '';
    container.style.backgroundColor = '';
  }
  
  document.body.classList.toggle('dark-mode');
  document.body.classList.remove('light-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  localStorage.setItem('lightMode', 'false');
  darkModeBtn.textContent = isDark ? '☀️' : '🌙';
  
  loadCustomSettings();
});

// Light Mode Logic
const isLightMode = localStorage.getItem('lightMode') === 'true';
if (isLightMode) {
  document.body.classList.add('light-mode');
}

lightModeBtn.addEventListener('click', () => {
  // Clear custom settings
  localStorage.removeItem('customFontColor');
  localStorage.removeItem('customFontSize');
  localStorage.removeItem('customBgColor');
  const container = document.getElementById('mainContainer');
  if (container) {
    container.style.color = '';
    container.style.fontSize = '';
    container.style.backgroundColor = '';
  }
  
  document.body.classList.toggle('light-mode');
  document.body.classList.remove('dark-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('lightMode', isLight);
  localStorage.setItem('darkMode', 'false');
  if (isLight) {
    darkModeBtn.textContent = '🌙';
  }
  
  loadCustomSettings();
});

// Validar whatsapp e fone fixo - apenas números
whatsappInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

foneFixoInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// Calcular validade automaticamente quando resultado é preenchido
resultadoInput.addEventListener('change', (e) => {
  if (e.target.value === 'favoravel') {
    const validadeAprovado = localStorage.getItem('validadeAprovado') || '180';
    validadeInput.value = validadeAprovado;
  } else if (e.target.value === 'desfavoravel') {
    const validadeReprovado = localStorage.getItem('validadeReprovado') || '180';
    validadeInput.value = validadeReprovado;
  } else {
    validadeInput.value = '';
  }
});

// Auto-timestamp when P/2 message is filled
let msgP2Timestamp = null;
msgP2Input.addEventListener('input', (e) => {
  if (e.target.value && !msgP2Timestamp) {
    msgP2Timestamp = new Date().toISOString();
    msgP2TimestampEl.textContent = `Enviado em: ${new Date(msgP2Timestamp).toLocaleString('pt-BR')}`;
  } else if (!e.target.value) {
    msgP2Timestamp = null;
    msgP2TimestampEl.textContent = '';
  }
});

// --- P/2 message modal, preview, copy and admin-editable template (persisted in localStorage) ---
const openMsgBtn = document.getElementById('openMsgBtn');
const msgModal = document.getElementById('msgModal');
const msgTextarea = document.getElementById('msgTextarea');
const msgPreview = document.getElementById('msgPreview');
const copyMsgBtn = document.getElementById('copyMsgBtn');
const saveMsgBtn = document.getElementById('saveMsgBtn');
const previewMsgBtn = document.getElementById('previewMsgBtn');
const closeMsgBtn = document.getElementById('closeMsgBtn');
const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyTemplateBtn = document.getElementById('copyTemplateBtn');

const MSG_TEMPLATE_KEY = 'stq_msg_p2_template';
// default template
const defaultTemplate = '{graduacao} {re} {nome} foi aprovado(a) em todas as etapas, ainda deseja trabalhar na nossa unidade COPOM SP?';

// load saved template
function loadMsgTemplate() {
  return localStorage.getItem(MSG_TEMPLATE_KEY) || defaultTemplate;
}

// open modal and populate textarea
openMsgBtn.addEventListener('click', () => {
  const template = loadMsgTemplate();
  msgTextarea.value = template;

  // control edit permission: only admins (stq) can save/edit; others see read-only textarea
  const canEdit = currentUser && currentUser.perfil === 'stq';
  msgTextarea.readOnly = !canEdit;
  saveMsgBtn.style.display = canEdit ? 'inline-block' : 'none';

  msgPreview.innerHTML = '';
  msgModal.style.display = 'block';
});

// close modal
closeMsgBtn.addEventListener('click', () => {
  msgModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === msgModal) msgModal.style.display = 'none';
});

// Build personalized message for a given cadastro object
function buildMsgFromTemplate(template, cadastro) {
  if (!cadastro) return template;
  return template
    .replace(/{graduacao}/gi, cadastro.graduacao || '')
    .replace(/{re}/gi, `${cadastro.re}-${cadastro.digito || ''}`.trim())
    .replace(/{nome}/gi, cadastro.nome || '');
}

/* preview message using current open cadastro (if editing a cadastro) or using fields in form
   also populate the email display next to the template and enable copying it */
previewMsgBtn.addEventListener('click', () => {
  const template = msgTextarea.value || defaultTemplate;
  const editId = document.getElementById('editId').value;
  let cadastro = null;
  if (editId) {
    cadastro = todosOsCadastros.find(c => c.id === editId) || null;
  } else {
    // fallback to current form fields
    cadastro = {
      graduacao: document.getElementById('graduacao').value || '',
      re: document.getElementById('re').value || '',
      digito: document.getElementById('digito').value || '',
      nome: document.getElementById('nome').value || '',
      email: document.getElementById('email').value || ''
    };
  }

  const built = buildMsgFromTemplate(template, cadastro);
  msgPreview.textContent = built;

  // populate email display next to template
  const emailDisplay = document.getElementById('msgEmailDisplay');
  if (emailDisplay) {
    emailDisplay.value = (cadastro && cadastro.email) ? cadastro.email : '';
  }
});

// copy preview (or built message) to clipboard
copyMsgBtn.addEventListener('click', async () => {
  const textToCopy = msgPreview.textContent || msgTextarea.value || loadMsgTemplate();
  try {
    await navigator.clipboard.writeText(textToCopy);
    alert('Mensagem copiada para a área de transferência');
  } catch (err) {
    // Fallback
    const tmp = document.createElement('textarea');
    tmp.value = textToCopy;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    alert('Mensagem copiada (fallback)');
  }
});

// save template (admins only)
saveMsgBtn.addEventListener('click', () => {
  if (!(currentUser && currentUser.perfil === 'stq')) {
    alert('Apenas administradores podem salvar o template.');
    return;
  }
  const tpl = msgTextarea.value.trim();
  if (!tpl) {
    alert('Template vazio não permitido.');
    return;
  }
  localStorage.setItem(MSG_TEMPLATE_KEY, tpl);
  alert('Template salvo.');
});

// Copy email button
copyEmailBtn.addEventListener('click', async () => {
  const emailValue = document.getElementById('email').value;
  if (!emailValue) {
    alert('Email não preenchido');
    return;
  }
  try {
    await navigator.clipboard.writeText(emailValue);
    alert('Email copiado para a área de transferência');
  } catch (err) {
    const tmp = document.createElement('textarea');
    tmp.value = emailValue;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    alert('Email copiado');
  }
});

/* Copy template button */
copyTemplateBtn.addEventListener('click', async () => {
  const templateText = msgTextarea.value || loadMsgTemplate();
  try {
    await navigator.clipboard.writeText(templateText);
    alert('Template copiado para a área de transferência');
  } catch (err) {
    const tmp = document.createElement('textarea');
    tmp.value = templateText;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    alert('Template copiado');
  }
});

/* Copy email shown in the message modal (next to template) */
const copyMsgEmailBtnEl = document.getElementById('copyMsgEmailBtn');
if (copyMsgEmailBtnEl) {
  copyMsgEmailBtnEl.addEventListener('click', async () => {
    const emailDisplay = document.getElementById('msgEmailDisplay');
    const emailToCopy = emailDisplay ? emailDisplay.value : '';
    if (!emailToCopy) {
      alert('Nenhum email disponível para copiar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(emailToCopy);
      alert('Email copiado para a área de transferência');
    } catch (err) {
      const tmp = document.createElement('textarea');
      tmp.value = emailToCopy;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      alert('Email copiado');
    }
  });
}

// Abrir modal
newBtn.addEventListener('click', () => {
  formTitle.textContent = 'Novo Cadastro';
  form.reset();
  document.getElementById('editId').value = '';
  stageSections.style.display = 'none'; // Hide stages for new registration
  modal.style.display = 'block';
});

// Update sequential phases visibility based on role and completion
function updateSequentialPhases() {
  const resultado = document.getElementById('resultado').value;
  const resultadoTecnico = document.getElementById('resultadoTecnico').value;
  const resultadoP2 = document.getElementById('resultadoP2').value;
  const encaminhado = encaminhadoCheck.checked;
  
  // Show sections based on user role and previous completion
  if (currentUser) {
    // Psicológico always visible for psicologico and stq
    const showPsico = currentUser.perfil === 'psicologico' || currentUser.perfil === 'stq';
    document.getElementById('psicologicoSection').style.display = showPsico ? 'block' : 'none';
    document.getElementById('psicologicoFields').style.display = showPsico ? 'block' : 'none';
    
    // Técnico visible ONLY if psico is favorável and user is stq
    const showTecnico = currentUser.perfil === 'stq' && resultado === 'favoravel';
    document.getElementById('tecnicoSection').style.display = showTecnico ? 'block' : 'none';
    document.getElementById('tecnicoFields').style.display = showTecnico ? 'block' : 'none';
    
    // P/2 visible ONLY if psico AND técnico are both favorável and user is p2 or stq
    const showP2 = (currentUser.perfil === 'p2' || currentUser.perfil === 'stq') && 
                   (resultado === 'favoravel' && resultadoTecnico === 'favoravel');
    document.getElementById('p2Section').style.display = showP2 ? 'block' : 'none';
    document.getElementById('p2Fields').style.display = showP2 ? 'block' : 'none';
    
    // Encaminhado visible ONLY if all previous are favorável/positivo and user is stq
    const showEnc = currentUser.perfil === 'stq' && 
                    resultado === 'favoravel' && 
                    resultadoTecnico === 'favoravel' && 
                    resultadoP2 === 'positivo';
    document.getElementById('encaminhadoSection').style.display = showEnc ? 'block' : 'none';
    document.getElementById('encaminhadoFields').style.display = showEnc ? 'block' : 'none';
    
    // Movimentação visible if encaminhado is checked and user is stq
    const showMov = currentUser.perfil === 'stq' && encaminhado;
    document.getElementById('movimentacaoSection').style.display = showMov ? 'block' : 'none';
    document.getElementById('movimentacaoFields').style.display = showMov ? 'block' : 'none';
  }
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

// Add listeners to form fields for sequential phase visibility
document.getElementById('resultado').addEventListener('change', updateSequentialPhases);
document.getElementById('resultadoTecnico').addEventListener('change', updateSequentialPhases);
document.getElementById('resultadoP2').addEventListener('change', updateSequentialPhases);

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

  // Check for duplicate RE
  const re = document.getElementById('re').value.toUpperCase();
  const editId = document.getElementById('editId').value;
  
  const duplicateRecord = todosOsCadastros.find(c => 
    c.re === re && c.id !== editId
  );
  
  if (duplicateRecord) {
    alert(`Já existe um cadastro com o RE ${re}!\n\nCandidato: ${duplicateRecord.nome}\nGraduação: ${duplicateRecord.graduacao}`);
    showTimeline(duplicateRecord.id);
    return;
  }

  const psicDataValue = document.getElementById('psicologoData').value;
  const psicHoraValue = document.getElementById('psicologoHora').value;
  const tecDataValue = document.getElementById('tecnicoData').value;
  const tecHoraValue = document.getElementById('tecnicoHora').value;

  // Decrease vacancy if psychologist is being scheduled
  if (psicDataValue && psicHoraValue && !editId) {
    const dataObj = new Date(psicDataValue);
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][dataObj.getDay()];
    const periodo = parseInt(psicHoraValue.split(':')[0]) < 12 ? 'manha' : 'tarde';
    
    const key = `${diaSemana}_${periodo}`;
    if (psicAgVagas[key] && psicAgVagas[key] > 0) {
      psicAgVagas[key]--;
      savePsicAgVagas();
    }
  }

  const existingRecord = editId ? todosOsCadastros.find(c => c.id === editId) : null;
  
  const data = {
    graduacao: document.getElementById('graduacao').value,
    re: document.getElementById('re').value.toUpperCase(),
    digito: document.getElementById('digito').value.toUpperCase(),
    nome: document.getElementById('nome').value.toUpperCase(),
    indicacao: document.getElementById('indicacao').value.toUpperCase(),
    email: document.getElementById('email').value.toLowerCase(),
    whatsapp: whatsapp,
    foneFixo: foneFixo,
    unidade: document.getElementById('unidade').value.toUpperCase(),
    psicologoData: psicDataValue,
    psicologoHora: psicHoraValue,
    psicologoAgendadoEm: psicDataValue && psicHoraValue ? (existingRecord?.psicologoAgendadoEm || new Date().toISOString()) : null,
    resultado: document.getElementById('resultado').value || '',
    validadeInicial: validadeInput.value,
    validadeDataInicio: validadeInput.value ? new Date().toISOString() : null,
    msgP2: document.getElementById('msgP2').value.toUpperCase(),
    msgP2Timestamp: msgP2Timestamp,
    resultadoP2: document.getElementById('resultadoP2').value || 'aguardando',
    tecnicoData: tecDataValue,
    tecnicoHora: tecHoraValue,
    tecnicoAgendadoEm: tecDataValue && tecHoraValue ? (existingRecord?.tecnicoAgendadoEm || new Date().toISOString()) : null,
    resultadoTecnico: document.getElementById('resultadoTecnico').value || 'aguardando',
    encaminhadoData: encaminhadoCheck.checked ? new Date().toISOString() : null,
    movimentadoData: movimentadoCheck.checked ? new Date().toISOString() : null,
    criadoEm: editId ? (existingRecord?.criadoEm || new Date().toISOString()) : new Date().toISOString()
  };

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

// Calculate remaining validity days
function calcularDiasRestantes(cadastro) {
  if (!cadastro.validadeInicial || !cadastro.validadeDataInicio) return null;
  
  const dataInicio = new Date(cadastro.validadeDataInicio);
  const hoje = new Date();
  const diasDecorridos = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
  const diasRestantes = parseInt(cadastro.validadeInicial) - diasDecorridos;
  
  return Math.max(0, diasRestantes);
}

// Get validity status
function getValidadeStatus(cadastro) {
  const diasRestantes = calcularDiasRestantes(cadastro);
  
  if (diasRestantes === null) return null;
  
  if (diasRestantes === 0) {
    if (cadastro.resultado === 'favoravel') return 'INVALIDO';
    if (cadastro.resultado === 'desfavoravel') return 'RETESTE';
  }
  
  return diasRestantes;
}

// Criar ícone de etapa do psicólogo
function criarEtapaPsicologo(cadastro) {
  const temData = !!cadastro.psicologoData;
  const resultado = cadastro.resultado || '';
  const diasRestantes = calcularDiasRestantes(cadastro);
  
  let classe = 'stage';
  let simbolo = '○';
  
  if (resultado === 'favoravel') {
    if (diasRestantes === 0) {
      // Expired favorável - yellow warning
      classe = 'stage warning';
      simbolo = '⚠';
    } else {
      classe = 'stage completed';
      simbolo = '✓';
    }
  } else if (resultado === 'desfavoravel' || resultado === 'faltou') {
    if (diasRestantes === 0) {
      // Expired desfavorável - blue
      classe = 'stage info';
      simbolo = '↻';
    } else {
      classe = 'stage rejected';
      simbolo = '✗';
    }
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
  
  if (resultado === 'positivo') {
    classe = 'stage completed';
    simbolo = '✓';
  } else if (resultado === 'nao_retornou') {
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
  } else if (resultado === 'desfavoravel' || resultado === 'nao_compareceu' || resultado === 'desistiu') {
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
  const temEnc = !!cadastro.encaminhadoData;
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
         !cadastro.encaminhadoData && 
         !cadastro.movimentadoData;
}

// Verificar se etapa está concluída (verde)
function etapaConcluida(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || '';
    const validadeStatus = getValidadeStatus(cadastro);
    return resultado === 'favoravel' && validadeStatus !== 'INVALIDO';
  } else if (etapa === 'tecnico') {
    return (cadastro.resultadoTecnico || 'aguardando') === 'favoravel';
  } else if (etapa === 'p2') {
    return (cadastro.resultadoP2 || 'aguardando') === 'positivo';
  } else if (etapa === 'encaminhado') {
    return !!cadastro.encaminhadoData;
  } else if (etapa === 'movimentado') {
    return !!cadastro.movimentadoData;
  }
  return false;
}

// Verificar se etapa está agendada/aguardando (amarelo)
function etapaAgendada(cadastro, etapa) {
  if (etapa === 'psicologo') {
    return cadastro.psicologoData && !cadastro.resultado;
  } else if (etapa === 'tecnico') {
    return cadastro.tecnicoData && (cadastro.resultadoTecnico === 'aguardando' || !cadastro.resultadoTecnico);
  } else if (etapa === 'p2') {
    return cadastro.msgP2 && (cadastro.resultadoP2 === 'aguardando' || !cadastro.resultadoP2);
  }
  return false;
}

// Verificar se etapa está reprovada
function etapaReprovada(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || '';
    return resultado === 'desfavoravel' || resultado === 'faltou';
  } else if (etapa === 'tecnico') {
    const resultado = cadastro.resultadoTecnico || 'aguardando';
    return resultado === 'desfavoravel' || resultado === 'nao_compareceu' || resultado === 'desistiu';
  } else if (etapa === 'p2') {
    return (cadastro.resultadoP2 || 'aguardando') === 'nao_retornou';
  }
  return false;
}

// Obter última etapa concluída do cadastro
// Order: PSICOLOGICO -> TECNICO -> P/2 -> ENCAMINHADO -> MOVIMENTAÇÃO
function ultimaEtapaConcluida(cadastro) {
  // Verificar se alguma etapa foi reprovada - se sim, não tem última etapa
  if (etapaReprovada(cadastro, 'psicologo') || 
      etapaReprovada(cadastro, 'tecnico') || 
      etapaReprovada(cadastro, 'p2')) {
    return null;
  }
  
  if (etapaConcluida(cadastro, 'movimentado')) return 'movimentado';
  if (etapaConcluida(cadastro, 'encaminhado')) return 'encaminhado';
  if (etapaConcluida(cadastro, 'p2')) return 'p2';
  if (etapaConcluida(cadastro, 'tecnico')) return 'tecnico';
  if (etapaConcluida(cadastro, 'psicologo')) return 'psicologo';
  return null;
}

// Check if record has any scheduled/pending stage
function temFaseAgendada(cadastro) {
  // Psicólogo: tem data mas sem resultado
  const psicologoPendente = cadastro.psicologoData && !cadastro.resultado;
  // Técnico: tem data mas resultado aguardando
  const tecnicoPendente = cadastro.tecnicoData && (cadastro.resultadoTecnico === 'aguardando' || !cadastro.resultadoTecnico);
  // P/2: tem msg mas resultado aguardando
  const p2Pendente = cadastro.msgP2 && (cadastro.resultadoP2 === 'aguardando' || !cadastro.resultadoP2);
  
  return psicologoPendente || tecnicoPendente || p2Pendente;
}

// Check if record has any completed stage (favorável)
function temFaseConcluida(cadastro) {
  return etapaConcluida(cadastro, 'psicologo') ||
         etapaConcluida(cadastro, 'p2') ||
         etapaConcluida(cadastro, 'tecnico') ||
         etapaConcluida(cadastro, 'encaminhado') ||
         etapaConcluida(cadastro, 'movimentado');
}

// Filtrar cadastros
function filtrarCadastros(cadastros) {
  const subtenSgtChecked = filtroSubtenSgt.checked;
  const cbSdChecked = filtroCbSd.checked;
  const sd2clChecked = filtroSd2cl.checked;
  const filtroEt = filtroEtapa.value;
  const concluidaChecked = checkConcluida.checked;
  const agendadaChecked = checkAgendada.checked;
  const reprovadaChecked = checkReprovada.checked;
  const inicio = dataInicio.value;
  const fim = dataFim.value;
  const reSearch = searchRE.value.trim().toUpperCase();
  const limit = resultLimit.value ? parseInt(resultLimit.value) : null;
  
  let filtered = cadastros.filter(cadastro => {
    // RE search filter
    if (reSearch && !cadastro.re.includes(reSearch)) {
      return false;
    }
    
    // Psico reteste filter (blue square)
    if (psicoRetesteFilter) {
      const diasRestantes = calcularDiasRestantes(cadastro);
      if (!(cadastro.resultado === 'desfavoravel' && diasRestantes === 0)) {
        return false;
      }
    }
    
    // Psico expiring filter (orange triangle)
    if (psicoExpiringFilter) {
      const diasRestantes = calcularDiasRestantes(cadastro);
      if (!(cadastro.resultado === 'favoravel' && diasRestantes === 0)) {
        return false;
      }
    }
    
    // Filtro de data
    if (inicio || fim) {
      const criadoEm = cadastro.criadoEm ? new Date(cadastro.criadoEm) : null;
      if (!criadoEm) return false;
      
      const dataCadastro = new Date(criadoEm.getFullYear(), criadoEm.getMonth(), criadoEm.getDate());
      
      if (inicio) {
        const dataInicioObj = new Date(inicio);
        if (dataCadastro < dataInicioObj) return false;
      }
      
      if (fim) {
        const dataFimObj = new Date(fim);
        if (dataCadastro > dataFimObj) return false;
      }
    }
    
    // Filter for p2 and psicologico users
    if (currentUser && (currentUser.perfil === 'p2' || currentUser.perfil === 'psicologico')) {
      if (currentUser.perfil === 'psicologico') {
        // Show only records awaiting psychological result or completed psico but tecnico not scheduled/started
        const psicoPendente = cadastro.psicologoData && !cadastro.resultado;
        const psicoCompletoSemProximaFase = cadastro.resultado && !cadastro.tecnicoData;
        if (!psicoPendente && !psicoCompletoSemProximaFase) return false;
      } else if (currentUser.perfil === 'p2') {
        // Must have reached P/2 phase (psico and tecnico must be favoravel)
        const chegouP2 = cadastro.resultado === 'favoravel' && cadastro.resultadoTecnico === 'favoravel';
        if (!chegouP2) return false;
        
        // Show only records awaiting P/2 result or completed P/2 but encaminhado not done
        const p2Pendente = cadastro.msgP2 && (cadastro.resultadoP2 === 'aguardando' || !cadastro.resultadoP2);
        const p2CompletoSemProximaFase = cadastro.resultadoP2 && cadastro.resultadoP2 !== 'aguardando' && !cadastro.encaminhadoData;
        if (!p2Pendente && !p2CompletoSemProximaFase) return false;
      }
    }
    
    // Filtro de graduação - multiple checkboxes
    if (subtenSgtChecked || cbSdChecked || sd2clChecked) {
      const grad = cadastro.graduacao.toUpperCase();
      let passaGrad = false;
      
      if (subtenSgtChecked && (grad.includes('SGT') || grad.includes('SUBTEN'))) {
        passaGrad = true;
      }
      
      if (cbSdChecked && (grad.includes('CB') || (grad.includes('SD') && !grad.includes('2')))) {
        passaGrad = true;
      }
      
      if (sd2clChecked && (grad.includes('2') && grad.includes('CL'))) {
        passaGrad = true;
      }
      
      if (!passaGrad) return false;
    }
    
    // Filtro combinado de etapa e status
    if (filtroEt) {
      if (filtroEt === 'sem_etapas') {
        if (!semEtapasPreenchidas(cadastro)) return false;
      } else if (filtroEt === 'reprovados') {
        if (!temReprovacao(cadastro)) return false;
      } else {
        // Para outras etapas, verificar com base nos checkboxes
        const algumCheckboxMarcado = concluidaChecked || agendadaChecked || reprovadaChecked;
        
        if (algumCheckboxMarcado) {
          let passaFiltroEtapa = false;
          
          if (concluidaChecked && etapaConcluida(cadastro, filtroEt)) {
            passaFiltroEtapa = true;
          }
          
          if (agendadaChecked && etapaAgendada(cadastro, filtroEt)) {
            passaFiltroEtapa = true;
          }
          
          if (reprovadaChecked && etapaReprovada(cadastro, filtroEt)) {
            passaFiltroEtapa = true;
          }
          
          if (!passaFiltroEtapa) return false;
        } else {
          // Se nenhum checkbox marcado, mostrar apenas concluídas
          if (!etapaConcluida(cadastro, filtroEt)) return false;
        }
      }
    } else {
      // Sem filtro de etapa, aplicar checkboxes globalmente
      if (concluidaChecked || agendadaChecked || reprovadaChecked) {
        let passaFiltroStatus = false;
        
        if (concluidaChecked && temFaseConcluida(cadastro)) {
          passaFiltroStatus = true;
        }
        
        if (agendadaChecked && temFaseAgendada(cadastro)) {
          passaFiltroStatus = true;
        }
        
        if (reprovadaChecked && temReprovacao(cadastro)) {
          passaFiltroStatus = true;
        }
        
        if (!passaFiltroStatus) return false;
      }
    }
    
    return true;
  });

  // Sort: indicação first, then oldest date
  filtered.sort((a, b) => {
    const aTemIndicacao = !!(a.indicacao && a.indicacao.trim());
    const bTemIndicacao = !!(b.indicacao && b.indicacao.trim());
    
    if (aTemIndicacao && !bTemIndicacao) return -1;
    if (!aTemIndicacao && bTemIndicacao) return 1;
    
    // Both have or both don't have indicação, sort by oldest date
    const aDate = new Date(a.criadoEm || 0);
    const bDate = new Date(b.criadoEm || 0);
    return aDate - bDate;
  });

  // Apply limit if set
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
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
      <td>${criarEtapaTecnico(cadastro)}</td>
      <td>${criarEtapaP2(cadastro)}</td>
      <td>${criarEtapaEncaminhado(cadastro)}</td>
      <td>${criarEtapaMovimentacao(cadastro)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editarCadastro('${cadastro.id}')">Editar</button>
        ${currentUser && currentUser.perfil === 'stq' ? `<button class="btn-delete" onclick="deletarCadastro('${cadastro.id}')">Excluir</button>` : ''}
        ${currentUser && currentUser.perfil === 'stq' ? `<button class="btn-psic-ag" onclick="abrirAgendaPsic()">Psic_Ag</button>` : ''}
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
      // Always white inner circle because chart background is always white
      ctx.fillStyle = 'white';
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
filtroSubtenSgt.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

filtroCbSd.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

filtroSd2cl.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

resultLimit.addEventListener('input', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

filtroEtapa.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Atualizar ao mudar checkboxes
checkConcluida.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

checkAgendada.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

checkReprovada.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Atualizar ao mudar data
dataInicio.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

dataFim.addEventListener('change', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Filter by psico reteste (blue square)
filterPsicoReteste.addEventListener('click', () => {
  psicoRetesteFilter = !psicoRetesteFilter;
  filterPsicoReteste.classList.toggle('active', psicoRetesteFilter);
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Filter by psico expiring (orange triangle)
filterPsicoExpiring.addEventListener('click', () => {
  psicoExpiringFilter = !psicoExpiringFilter;
  filterPsicoExpiring.classList.toggle('active', psicoExpiringFilter);
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
});

// Search by RE
searchRE.addEventListener('input', () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  renderizarTabela(cadastrosFiltrados);
  
  // If only one result and RE is complete, show timeline
  if (cadastrosFiltrados.length === 1 && searchRE.value.trim().length >= 5) {
    showTimeline(cadastrosFiltrados[0].id);
  }
});

// Close timeline modal
closeTimelineBtn.addEventListener('click', () => {
  timelineModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === timelineModal) {
    timelineModal.style.display = 'none';
  }
});

// Show timeline
function showTimeline(id) {
  const cadastro = todosOsCadastros.find(c => c.id === id);
  if (!cadastro) return;
  
  timelineContent.innerHTML = `
    <div style="margin-bottom: 24px; padding: 16px; background: #e2e8f0; border-radius: 8px;">
      <h3 style="margin-bottom: 8px;">${cadastro.graduacao} ${cadastro.nome}</h3>
      <p>RE: ${cadastro.re}-${cadastro.digito}</p>
      <p>Email: ${cadastro.email}</p>
      <p>WhatsApp: ${formatarTelefone(cadastro.whatsapp)}</p>
      <p>Unidade: ${cadastro.unidade}</p>
    </div>
  `;
  
  // Psicológico
  if (cadastro.psicologoData) {
    const diasRestantes = calcularDiasRestantes(cadastro);
    let status = '';
    let icon = '📋';
    
    if (cadastro.resultado === 'favoravel') {
      if (diasRestantes === 0) {
        status = 'Favorável (INVÁLIDO - Expirado)';
        icon = '⚠';
      } else {
        status = `Favorável (${diasRestantes} dias restantes)`;
        icon = '✓';
      }
    } else if (cadastro.resultado === 'desfavoravel') {
      if (diasRestantes === 0) {
        status = 'Desfavorável (RETESTE - Expirado)';
        icon = '↻';
      } else {
        status = `Desfavorável (${diasRestantes} dias restantes)`;
        icon = '✗';
      }
    } else if (cadastro.resultado === 'faltou') {
      status = 'Faltou';
      icon = '✗';
    } else {
      status = 'Agendado';
      icon = '○';
    }
    
    timelineContent.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">${icon}</div>
        <div class="timeline-details">
          <h3>Psicológico</h3>
          <p>Data: ${new Date(cadastro.psicologoData).toLocaleDateString('pt-BR')}</p>
          ${cadastro.psicologoHora ? `<p>Hora: ${cadastro.psicologoHora}</p>` : ''}
          <p>Status: ${status}</p>
        </div>
      </div>
    `;
  }
  
  // Técnico
  if (cadastro.tecnicoData) {
    let status = '';
    let icon = '📋';
    
    if (cadastro.resultadoTecnico === 'favoravel') {
      status = 'Favorável';
      icon = '✓';
    } else if (cadastro.resultadoTecnico === 'desfavoravel') {
      status = 'Desfavorável';
      icon = '✗';
    } else if (cadastro.resultadoTecnico === 'nao_compareceu') {
      status = 'Não Compareceu';
      icon = '✗';
    } else if (cadastro.resultadoTecnico === 'desistiu') {
      status = 'Desistiu';
      icon = '✗';
    } else {
      status = 'Aguardando';
      icon = '○';
    }
    
    timelineContent.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">${icon}</div>
        <div class="timeline-details">
          <h3>Técnico</h3>
          <p>Data: ${new Date(cadastro.tecnicoData).toLocaleDateString('pt-BR')}</p>
          ${cadastro.tecnicoHora ? `<p>Hora: ${cadastro.tecnicoHora}</p>` : ''}
          <p>Status: ${status}</p>
        </div>
      </div>
    `;
  }
  
  // P/2
  if (cadastro.msgP2) {
    let status = '';
    let icon = '📋';
    
    if (cadastro.resultadoP2 === 'positivo') {
      status = 'Positivo';
      icon = '✓';
    } else if (cadastro.resultadoP2 === 'nao_retornou') {
      status = 'Não Retornou';
      icon = '✗';
    } else {
      status = 'Aguardando';
      icon = '○';
    }
    
    timelineContent.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">${icon}</div>
        <div class="timeline-details">
          <h3>P/2</h3>
          <p>Mensagem: ${cadastro.msgP2}</p>
          ${cadastro.msgP2Timestamp ? `<p>Enviado em: ${new Date(cadastro.msgP2Timestamp).toLocaleString('pt-BR')}</p>` : ''}
          <p>Status: ${status}</p>
        </div>
      </div>
    `;
  }
  
  // Encaminhado
  if (cadastro.encaminhadoData) {
    timelineContent.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">✓</div>
        <div class="timeline-details">
          <h3>Encaminhado</h3>
          <p>Data: ${new Date(cadastro.encaminhadoData).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;
  }
  
  // Movimentado
  if (cadastro.movimentadoData) {
    timelineContent.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-icon">✓</div>
        <div class="timeline-details">
          <h3>Movimentação</h3>
          <p>Data: ${new Date(cadastro.movimentadoData).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;
  }
  
  timelineModal.style.display = 'block';
}

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
      document.getElementById('indicacao').value = cadastro.indicacao || '';
      document.getElementById('email').value = cadastro.email || '';
      document.getElementById('whatsapp').value = cadastro.whatsapp || cadastro.telefone || '';
      document.getElementById('foneFixo').value = cadastro.foneFixo || '';
      document.getElementById('unidade').value = cadastro.unidade;
      
      // Make registration fields readonly for p2 and psicologico users
      const isRestrictedUser = currentUser && (currentUser.perfil === 'p2' || currentUser.perfil === 'psicologico');
      document.getElementById('graduacao').disabled = isRestrictedUser;
      document.getElementById('re').readOnly = isRestrictedUser;
      document.getElementById('digito').readOnly = isRestrictedUser;
      document.getElementById('nome').readOnly = isRestrictedUser;
      document.getElementById('email').readOnly = isRestrictedUser;
      document.getElementById('whatsapp').readOnly = isRestrictedUser;
      document.getElementById('foneFixo').readOnly = isRestrictedUser;
      document.getElementById('unidade').readOnly = isRestrictedUser;
      document.getElementById('psicologoData').value = cadastro.psicologoData || '';
      document.getElementById('psicologoHora').value = cadastro.psicologoHora || '';
      document.getElementById('resultado').value = cadastro.resultado || '';
      
      // Calculate remaining days for validade
      const diasRestantes = calcularDiasRestantes(cadastro);
      if (diasRestantes !== null) {
        validadeInput.value = diasRestantes;
      } else {
        validadeInput.value = '';
      }
      
      document.getElementById('tecnicoData').value = cadastro.tecnicoData || '';
      document.getElementById('tecnicoHora').value = cadastro.tecnicoHora || '';
      document.getElementById('resultadoTecnico').value = cadastro.resultadoTecnico || '';
      document.getElementById('msgP2').value = cadastro.msgP2 || '';
      
      if (cadastro.msgP2Timestamp) {
        msgP2Timestamp = cadastro.msgP2Timestamp;
        msgP2TimestampEl.textContent = `Enviado em: ${new Date(msgP2Timestamp).toLocaleString('pt-BR')}`;
      } else {
        msgP2Timestamp = null;
        msgP2TimestampEl.textContent = '';
      }
      
      document.getElementById('resultadoP2').value = cadastro.resultadoP2 || '';
      
      // Set encaminhado checkbox
      encaminhadoCheck.checked = !!cadastro.encaminhadoData;
      if (cadastro.encaminhadoData) {
        encaminhadoTimestamp.textContent = `Encaminhado em: ${new Date(cadastro.encaminhadoData).toLocaleString('pt-BR')}`;
      } else {
        encaminhadoTimestamp.textContent = '';
      }
      
      // Set movimentado checkbox
      movimentadoCheck.checked = !!cadastro.movimentadoData;
      if (cadastro.movimentadoData) {
        movimentadoTimestamp.textContent = `Movimentado em: ${new Date(cadastro.movimentadoData).toLocaleString('pt-BR')}`;
      } else {
        movimentadoTimestamp.textContent = '';
      }
      
      stageSections.style.display = 'block'; // Show stages for editing
      updateSequentialPhases(); // Show/hide phases based on role and completion
      modal.style.display = 'block';
    }
  }, { onlyOnce: true });
};

// Deletar
window.deletarCadastro = (id) => {
  if (currentUser && currentUser.perfil !== 'stq') {
    alert('Apenas administradores podem excluir cadastros!');
    return;
  }
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

// Delete filtered records
deleteFilteredBtn.addEventListener('click', async () => {
  const cadastrosFiltrados = filtrarCadastros(todosOsCadastros);
  
  if (cadastrosFiltrados.length === 0) {
    alert('Nenhum cadastro para excluir');
    return;
  }

  // Ask for password
  const senha = prompt('Digite a senha para excluir os registros:');
  
  if (senha === null) {
    return; // User cancelled
  }
  
  if (senha !== 'stqall') {
    alert('Senha incorreta!');
    return;
  }
  
  // Show what will be deleted
  let mensagem = `Você está prestes a excluir ${cadastrosFiltrados.length} registro(s):\n\n`;
  
  cadastrosFiltrados.slice(0, 10).forEach(c => {
    mensagem += `- ${c.graduacao} ${c.nome} (RE: ${c.re}-${c.digito})\n`;
  });
  
  if (cadastrosFiltrados.length > 10) {
    mensagem += `\n... e mais ${cadastrosFiltrados.length - 10} registro(s).\n`;
  }
  
  mensagem += '\n\nTem certeza que deseja excluir estes registros?\nEsta ação não pode ser desfeita!';
  
  const confirmacao = confirm(mensagem);
  
  if (!confirmacao) {
    return;
  }
  
  // Delete all filtered records
  try {
    const deletePromises = cadastrosFiltrados.map(cadastro => 
      remove(ref(database, `cadastros/${cadastro.id}`))
    );
    
    await Promise.all(deletePromises);
    alert(`${cadastrosFiltrados.length} registro(s) excluído(s) com sucesso!`);
  } catch (error) {
    alert('Erro ao excluir registros: ' + error.message);
  }
});

// Today's appointments button
todayBtn.addEventListener('click', () => {
  calculateTodayStats();
  todayModal.style.display = 'block';
});

closeTodayBtn.addEventListener('click', () => {
  todayModal.style.display = 'none';
  detalhesHojeContent.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === todayModal) {
    todayModal.style.display = 'none';
    detalhesHojeContent.style.display = 'none';
  }
});

detalhesHojeBtn.addEventListener('click', () => {
  const isVisible = detalhesHojeContent.style.display === 'block';
  detalhesHojeContent.style.display = isVisible ? 'none' : 'block';
  detalhesHojeBtn.textContent = isVisible ? 'Ver Detalhes' : 'Ocultar Detalhes';
});

function calculateTodayStats() {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  
  let totalAgendamentos = 0;
  let totalManha = 0;
  let totalTarde = 0;
  let agendamentosPorEtapa = {
    psicologo: { manha: 0, tarde: 0 },
    tecnico: { manha: 0, tarde: 0 }
  };
  
  todosOsCadastros.forEach(c => {
    // Check psicologico appointments scheduled today
    if (c.psicologoAgendadoEm) {
      const agendadoEm = new Date(c.psicologoAgendadoEm);
      if (agendadoEm >= inicioHoje && agendadoEm <= fimHoje) {
        totalAgendamentos++;
        if (c.psicologoHora) {
          const hora = parseInt(c.psicologoHora.split(':')[0]);
          if (hora < 12) {
            totalManha++;
            agendamentosPorEtapa.psicologo.manha++;
          } else {
            totalTarde++;
            agendamentosPorEtapa.psicologo.tarde++;
          }
        }
      }
    }
    
    // Check tecnico appointments scheduled today
    if (c.tecnicoAgendadoEm) {
      const agendadoEm = new Date(c.tecnicoAgendadoEm);
      if (agendadoEm >= inicioHoje && agendadoEm <= fimHoje) {
        totalAgendamentos++;
        if (c.tecnicoHora) {
          const hora = parseInt(c.tecnicoHora.split(':')[0]);
          if (hora < 12) {
            totalManha++;
            agendamentosPorEtapa.tecnico.manha++;
          } else {
            totalTarde++;
            agendamentosPorEtapa.tecnico.tarde++;
          }
        }
      }
    }
  });
  
  totalHojeEl.textContent = totalAgendamentos;
  
  let detalhesHTML = '<div style="padding:16px;background:#f3f4f6;border-radius:8px;margin-bottom:12px;">';
  detalhesHTML += '<h4 style="margin-bottom:8px;">Período da Manhã (00:00 - 11:59)</h4>';
  detalhesHTML += `<div style="font-size:24px;font-weight:700;color:#4299e1;margin-bottom:8px;">${totalManha}</div>`;
  if (agendamentosPorEtapa.psicologo.manha > 0) {
    detalhesHTML += `<div style="font-size:14px;color:#555;">Psicológico: ${agendamentosPorEtapa.psicologo.manha}</div>`;
  }
  if (agendamentosPorEtapa.tecnico.manha > 0) {
    detalhesHTML += `<div style="font-size:14px;color:#555;">Técnico: ${agendamentosPorEtapa.tecnico.manha}</div>`;
  }
  detalhesHTML += '</div>';
  
  detalhesHTML += '<div style="padding:16px;background:#f3f4f6;border-radius:8px;">';
  detalhesHTML += '<h4 style="margin-bottom:8px;">Período da Tarde (12:00 - 23:59)</h4>';
  detalhesHTML += `<div style="font-size:24px;font-weight:700;color:#ed8936;margin-bottom:8px;">${totalTarde}</div>`;
  if (agendamentosPorEtapa.psicologo.tarde > 0) {
    detalhesHTML += `<div style="font-size:14px;color:#555;">Psicológico: ${agendamentosPorEtapa.psicologo.tarde}</div>`;
  }
  if (agendamentosPorEtapa.tecnico.tarde > 0) {
    detalhesHTML += `<div style="font-size:14px;color:#555;">Técnico: ${agendamentosPorEtapa.tecnico.tarde}</div>`;
  }
  detalhesHTML += '</div>';
  
  detalhesHojeContent.innerHTML = detalhesHTML;
}

// Psic_Ag modal
window.abrirAgendaPsic = () => {
  updatePsicAgInfo();
  psicAgModal.style.display = 'block';
};

closePsicAgBtn.addEventListener('click', () => {
  psicAgModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === psicAgModal) {
    psicAgModal.style.display = 'none';
  }
});

savePsicAgBtn.addEventListener('click', () => {
  const dia = psicAgDiaSemana.value;
  const manha = parseInt(psicAgVagasManha.value) || 0;
  const tarde = parseInt(psicAgVagasTarde.value) || 0;
  
  psicAgVagas[`${dia}_manha`] = manha;
  psicAgVagas[`${dia}_tarde`] = tarde;
  
  savePsicAgVagas();
  updatePsicAgInfo();
  alert('Vagas salvas com sucesso!');
});

function updatePsicAgInfo() {
  let html = '';
  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const diasNomes = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };
  
  dias.forEach(dia => {
    const manha = psicAgVagas[`${dia}_manha`] || 0;
    const tarde = psicAgVagas[`${dia}_tarde`] || 0;
    
    if (manha > 0 || tarde > 0) {
      html += `<div style="margin-bottom:8px;">
        <strong>${diasNomes[dia]}:</strong> Manhã: ${manha}, Tarde: ${tarde}
      </div>`;
    }
  });
  
  if (!html) {
    html = '<p style="color:#999;">Nenhuma vaga configurada</p>';
  }
  
  psicAgInfoContent.innerHTML = html;
}

// Obter texto de status
function getStatusText(cadastro, etapa) {
  if (etapa === 'psicologo') {
    const resultado = cadastro.resultado || '';
    const validadeStatus = getValidadeStatus(cadastro);
    if (resultado === 'favoravel') {
      if (validadeStatus === 'INVALIDO') return 'Favorável (Inválido)';
      if (typeof validadeStatus === 'number') return `Favorável (${validadeStatus} dias)`;
      return 'Favorável';
    }
    if (resultado === 'desfavoravel') {
      if (validadeStatus === 'RETESTE') return 'Desfavorável (Reteste)';
      if (typeof validadeStatus === 'number') return `Desfavorável (${validadeStatus} dias)`;
      return 'Desfavorável';
    }
    if (resultado === 'faltou') return 'Faltou';
    return 'Agendado';
  } else if (etapa === 'tecnico') {
    const resultado = cadastro.resultadoTecnico || 'aguardando';
    if (resultado === 'favoravel') return 'Favorável';
    if (resultado === 'desfavoravel') return 'Desfavorável';
    if (resultado === 'nao_compareceu') return 'Não Compareceu';
    if (resultado === 'desistiu') return 'Desistiu';
    return 'Aguardando';
  } else if (etapa === 'p2') {
    const resultado = cadastro.resultadoP2 || 'aguardando';
    return resultado === 'positivo' ? 'Positivo' : resultado === 'nao_retornou' ? 'Não Retornou' : 'Aguardando';
  }
  return '';
}