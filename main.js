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
    console.log(nascimento)
    console.log(admissao)
    let db = loadJson();

    if (id === '' || senha === '' || nome === '') {
        document.querySelector('#alertR').innerHTML = 'Existem campos vazios';
        return;
    }
    
    if (db.funcionarios.some(f => f.id === id)) {
        document.querySelector('#alertR').innerHTML = 'ID já cadastrado';
        return;
    }
    
    let novoFuncionario = { id, senha, nome, nascimento, admissao}
    db.funcionarios.push(novoFuncionario);
    saveJson(db);
    goTo('login');
    document.querySelector('#alertL').innerHTML ='';
}

// Login de usuário
function login() {
    let id = document.querySelector('#idLogin').value.trim();
    let senha = document.querySelector('#senhaLogin').value.trim();
    let db = loadJson();

    let usuario = db.funcionarios.find(f => f.id === id && f.senha === senha);

    if (usuario) {
        document.querySelector('#idUsuario').innerHTML = `ID: ${usuario.id}`;
        document.querySelector('#nomeUsuario').innerHTML = `Nome: ${usuario.nome}`;
        document.querySelector('#admissao').innerHTML = `Data de Admissao: ${usuario.admissao}`;
        document.querySelector('#nascimento').innerHTML = `Data de Nascimento: ${usuario.nascimento}`;
        goTo('main');
    } else {
        document.querySelector('#alertL').innerHTML = 'ID ou Senha incorretos, ou campos vazios';
    }
    if (id === '0000' && senha === '0000'){
          goTo('register')
    }
}

// Eventos dos botões
document.querySelector('#confirmarLogin').addEventListener('click', login);
document.querySelector('#confirmarCadastro').addEventListener('click', register);

// Função para gerar a escala aleatória de A-Z
function getRandomScaleLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Letra A-Z
}

// Função para gerar o calendário com base na letra e no mês
function generateCalendar(letter) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
    let days = [];
    let letterOffset = letter.charCodeAt(0) - 65; // Define o índice da letra

    for (let i = 1; i <= daysInMonth; i++) {
        let shiftIndex = (i + letterOffset - 1) % shiftCycle.length;
        let dayClass = shiftCycle[shiftIndex];
        let isToday = (i === today.getDate()) ? 'today' : ''; // Destaque do dia atual

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

// Função para verificar permissão e enviar notificação
function sendNotification(title, message) {
    // Verifica se o navegador suporta notificações
    if (!("Notification" in window)) {
        alert("Seu navegador não suporta notificações. " + message);
        return;
    }

    // Verifica a permissão do usuário
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        // Pede permissão ao usuário
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            } else {
                alert("Permissão negada! " + message);
            }
        });
    } else {
        // Caso o usuário já tenha negado antes
        alert("Você bloqueou as notificações. " + message);
    }
}


// Atualiza o status da escala e informa a próxima mudança
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

    // Enviar notificação sobre o próximo turno
}

// Retorna o horário de cada turno
function getShiftTime(shift) {
    if (shift === 'T1') return '06:30';
    if (shift === 'T2') return '14:30';
    if (shift === 'T3') return '22:30';
    if (shift === 'F') return '00:00'
    return '';
}

// Atualiza o calendário e status ao trocar de letra
function updateCalendar(letter) {
    generateCalendar(letter);
}

// Inicializa com a letra A
generateCalendar('A');

// document.querySelector('#main').classList.remove('hidden')

// Controla a navegação entre as telas
function goTo(screen) {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('register').classList.add('hidden');
    document.getElementById('main').classList.add('hidden');
    document.getElementById(screen).classList.remove('hidden');
}

function disparaNotificacao(screen) {
  if (screen === 'main') {
    sendNotification("Atualização da Escala", statusText);
  }
}
