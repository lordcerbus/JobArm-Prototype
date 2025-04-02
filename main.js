const shifts = ['T1', 'T2', 'T3', 'F'];
const shiftCycle = ['T1', 'T1', 'T1', 'T1', 'T1', 'T1', 'F', 'F', 'F', 'T2', 'T2', 'T2', 'T2', 'T2', 'T2', 'F', 'F', 'F', 'T3', 'T3', 'T3', 'T3', 'T3', 'T3', 'F', 'F', 'F'];
let user = {};

// Inicializa os dados do JSON no localStorage (executar uma vez)
const defaultData = {
    funcionarios: [
        { id: "0001", senha: "0001", nome: "Lorem Ipsum", nascimento: "dd/mm/aaaa", admissao: "dd/mm/aaaa" }
    ]
};

if (!localStorage.getItem("database")) {
    localStorage.setItem("database", JSON.stringify(defaultData));
}

// Carregar JSON do localStorage
function loadJson() {
    return JSON.parse(localStorage.getItem("database")) || { funcionarios: [] };
}

// Salvar JSON no localStorage
function saveJson(data) {
    localStorage.setItem("database", JSON.stringify(data));
}

// Registro de usuário
function register() {
    let id = document.querySelector('#idCadastro').value.trim();
    let senha = document.querySelector('#senhaCadastro').value.trim();
    let nome = document.querySelector('#nomeCadastro').value.trim();
    let nascimento = document.querySelector('#nascimentoCadastro').value.trim();
    let admissao = document.querySelector('#admissaoCadastro').value.trim();

    let db = loadJson();

    if (id === '' || senha === '' || nome === '') {
        showNotification('notificationRegister', 'Existem campos vazios');
        return;
    }
    
    if (db.funcionarios.some(f => f.id === id)) {
        showNotification('notificationRegister', 'ID já cadastrado');
        return;
    }
    
    let novoFuncionario = { id, senha, nome, nascimento, admissao };
    db.funcionarios.push(novoFuncionario);
    saveJson(db);

    // Exibe a notificação na tela de registro
    showNotification('notificationRegister', 'CADASTRO REALIZADO COM SUCESSO');

    // Redireciona para login após 2 segundos
    setTimeout(() => {
        goTo('login');
    }, 2000);
}


// Login de usuário
function login() {
    let id = document.querySelector('#idLogin').value.trim();
    let senha = document.querySelector('#senhaLogin').value.trim();
    let db = loadJson();

    if (id === '0000' && senha === '0000') {
        goTo('register');
        return;
    }

    let usuario = db.funcionarios.find(f => f.id === id && f.senha === senha);

    if (usuario) {
        document.querySelector('#idUsuario').innerHTML = `ID: ${usuario.id}`;
        document.querySelector('#nomeUsuario').innerHTML = `Nome: ${usuario.nome}`;
        document.querySelector('#admissao').innerHTML = `Data de Admissão: ${usuario.admissao}`;
        document.querySelector('#nascimento').innerHTML = `Data de Nascimento: ${usuario.nascimento}`;
        goTo('main');
        updateCalendar(document.querySelector("select").value);
    } else {
        document.querySelector('#alertL').innerHTML = 'ID ou Senha incorretos, ou campos vazios';
    }
}

// Formatação automática de data
document.querySelectorAll('#nascimentoCadastro, #admissaoCadastro').forEach(input => {
    input.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '').slice(0, 8);
        if (value.length >= 4) value = value.replace(/^(\d{2})(\d{2})(\d{0,4})$/, "$1/$2/$3");
        else if (value.length >= 2) value = value.replace(/^(\d{2})(\d{0,2})$/, "$1/$2");
        this.value = value;
    });
});

// Função para gerar o calendário adaptado ao mês atual
function generateCalendar(letter) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
    let days = [];
    let letterOffset = letter.charCodeAt(0) - 65;

    for (let i = 1; i <= daysInMonth; i++) {
        let shiftIndex = (i + letterOffset - 1) % shiftCycle.length;
        let dayClass = shiftCycle[shiftIndex];
        let isToday = (i === today.getDate()) ? 'today' : '';

        days.push(`
            <div class="day ${isToday}">
                <span>${i}</span>
                <div class="shift ${dayClass}">${dayClass}</div>
            </div>
        `);
    }
    
    document.getElementById('calendar').innerHTML = days.join('');
    updateStatus(today, letter);
}

// Mostra o status da escala
function showNotification(elementId, message) {
    const notificationBox = document.getElementById(elementId);
    const notificationText = notificationBox.querySelector('p');

    notificationText.innerHTML = message;
    notificationBox.style.display = 'block';

    // Animação para aparecer
    setTimeout(() => {
        notificationBox.style.opacity = '1';
    }, 100);

    // Esconde a notificação após 5 segundos
    setTimeout(() => {
        notificationBox.style.opacity = '0';
        setTimeout(() => {
            notificationBox.style.display = 'none';
        }, 500);
    }, 5000);
}


// Modifique a função updateStatus para usar a notificação visual
function updateStatus(today, letter) {
    const currentDate = today.getDate();
    const dayOfCycle = (currentDate - 1 + (letter.charCodeAt(0) - 65)) % shiftCycle.length;
    const currentShift = shiftCycle[dayOfCycle];
    let nextShiftIndex = (dayOfCycle + 1) % shiftCycle.length;
    let nextShift = shiftCycle[nextShiftIndex];
    let nextShiftDate = new Date(today);
    nextShiftDate.setDate(today.getDate() + 1);

    let nextShiftTime = getShiftTime(nextShift);
    let nextShiftDay = nextShiftDate.toLocaleDateString('pt-BR');

    let statusText = `Hoje: ${currentShift}. `;
    if (currentShift === 'F') {
        statusText += `Você está de folga. Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
    } else {
        statusText += `Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
    }

    document.getElementById('status').innerHTML = statusText;
    
    // Chamar a função de notificação visual
    showNotification('notificationMain',statusText);
}

// Retorna o horário de cada turno
function getShiftTime(shift) {
    if (shift === 'T1') return '06:30';
    if (shift === 'T2') return '14:30';
    if (shift === 'T3') return '22:30';
    if (shift === 'F') return '00:00';
    return '';
}

// Atualiza o calendário ao trocar de letra
function updateCalendar(letter) {
    generateCalendar(letter);
}


// Controla a navegação entre as telas
function goTo(screen) {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('register').classList.add('hidden');
    document.getElementById('main').classList.add('hidden');
    document.getElementById(screen).classList.remove('hidden');

    if (screen === 'main') {
        updateCalendar(document.querySelector("select").value);
    }
}

// Funcao de retorno a tela de login
function reset (){
    document.querySelector('#idLogin').value = ''
    document.querySelector('#senhaLogin').value = ''
    goTo('login')
}


// Escopo de eventos dos botões
document.querySelector('#confirmarLogin').addEventListener('click', login);
document.querySelector('#confirmarCadastro').addEventListener('click', register);
document.getElementById('logoutButton').addEventListener('click',reset);
document.getElementById('logoutButtonM').addEventListener('click',reset);