let escalas = {
    '6x3': [ 
      {
        shifts : ['T1', 'T2', 'T3', 'F'],
        shiftCycle : ['T1', 'T1', 'T1', 'T1', 'T1', 'T1', 'F', 'F', 'F', 'T2', 'T2', 'T2', 'T2', 'T2', 'T2', 'F', 'F', 'F', 'T3', 'T3', 'T3', 'T3', 'T3', 'T3', 'F', 'F', 'F']
      },
    ],
    '5x2': [
      {
        shifts : ['T','F'],
        shiftCycle : ['T','T','T','T','T','F','F']
      }
    ],
    '6x2':[
      {
        shifts : ['T1', 'T3', 'F'],
        shiftCycle : ['T1', 'T1', 'T1', 'T1', 'T1', 'T1', 'F', 'F', 'T3', 'T3', 'T3', 'T3', 'T3', 'T3', 'F', 'F']
      }
    ],
   '6x1': [
      {
        shifts : ['T','F'],
        shiftCycle : ['T','T','T','T','T','T','F']
      }
    ],
    '15x15' : [
      {
        shifts : ['T','F'],
        shiftCycle : ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F']
      }
    ],
    '6x1/5x2' : [
      {
        shifts : ['T','F'],
        shiftCycle : [] // Será definido dinamicamente com base na letra
      }
    ]
  };
  let selectedDate = new Date();
  let user = {};
  // Inicializa os dados do JSON no localStorage (executar uma vez)
  const defaultData = {
      funcionarios: [
          { id: "0001", senha: "0001", nome: "Lorem Ipsum", nascimento: "01/01/0101", admissao: "01/01/0101" }
      ]
  };
    // Verifica se o localStorage já contém dados
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
  
      // Redireciona para login após 5 segundos
      setTimeout(() => {
          goTo('login');
      }, 5000);
  }
  function deletefuncionario() {
    let id = document.querySelector('#deleteUser').value.trim()
    
    let db = loadJson();
    
    let index = db.funcionarios.findIndex(user => user.id === id)
    if ( index !== -1) {
      db.funcionarios.splice(index,1);
      saveJson(db)
      showNotification('notificationRegister','ID deletado')
      
    } else {
      showNotification('notificationRegister', 'ID não encontrado')
    
    }
    setTimeout(()=>{
    document.querySelector('#deleteUser').value = ''
    },5000)
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
          generateCalendar()
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
  

  // Gera o calendário com base na letra e tipo de escala
// ... (mantém a parte do escalas como já está)
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
// Gera o calendário com base na letra e tipo de escala
function generateCalendar() {
    const today = new Date();
    const selectedLetter = document.getElementById('selectLetra').value || 'A';
    const selectedEscala = document.getElementById('selectEscala').value || '6x3';
    const letterOffset = selectedLetter.charCodeAt(0) - 65;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay(); // 0 = Domingo

    // Geração do ciclo dinâmico para 6x1/5x2 com alternância travada
    let cycle = escalas[selectedEscala][0].shiftCycle;

    if (selectedEscala === '6x1/5x2') {
        const ciclo6x1 = ['T','T','T','T','T','T','F']; // folga domingo
        const ciclo5x2 = ['T','T','T','T','T','F','F']; // folga sábado e domingo

        // Alternar de forma travada: A = 6x1/5x2, B = 5x2/6x1, C = 6x1/5x2, etc
        const isEven = letterOffset % 2 === 0;
        cycle = isEven 
            ? [...ciclo6x1, ...ciclo5x2]
            : [...ciclo5x2, ...ciclo6x1];
    }

    let days = [];

    // Nome do mês acima do calendário
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const headerMonth = `<div class="month-name" style="grid-column: span 7; text-align:center; font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">
        ${monthNames[currentMonth]} ${currentYear}
    </div>`;
    days.push(headerMonth);

    // Cabeçalho dos dias da semana
    const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    let weekdayRow = weekdays.map(d => `<div class="day" style="font-weight:bold; border:none;">${d}</div>`).join('');
    days.push(weekdayRow);

    // Dias em branco antes do primeiro dia do mês
    for (let i = 0; i < startDay; i++) {
        days.push(`<div class="day empty"></div>`);
    }

    // Preenche os dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth, i);
        let shiftIndex;

        if (selectedEscala === '6x1') {
            // Trabalha de segunda a sábado, folga no domingo
            cycle = ['F', 'T', 'T', 'T', 'T', 'T', 'T']; // 0=Dom, 1=Seg, ..., 6=Sáb
            const weekDay = date.getDay();
            shiftIndex = weekDay;
        } else if (selectedEscala === '5x2') {
            // Trabalha de segunda a sexta, folga no sábado e domingo
            cycle = ['F', 'T', 'T', 'T', 'T', 'T', 'F'];
            const weekDay = date.getDay();
            shiftIndex = weekDay;
        } else if (selectedEscala === '6x1/5x2') {
            const ciclo6x1 = ['T','T','T','T','T','T','F']; // folga domingo
            const ciclo5x2 = ['T','T','T','T','T','F','F']; // folga sábado e domingo
            const isEven = letterOffset % 2 === 0;
            cycle = isEven 
                ? [...ciclo6x1, ...ciclo5x2]
                : [...ciclo5x2, ...ciclo6x1];
        
            const baseDate = new Date(2024, 2, 25); // Segunda-feira
            const diff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
            shiftIndex = (diff + cycle.length) % cycle.length;
        } else if (selectedEscala === '6x1/5x2') {
            const baseDate = new Date(2024, 2, 25); // Segunda-feira (25/03/2024)
            const diff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
            shiftIndex = (diff + cycle.length) % cycle.length;
        } else {
            const baseDate = new Date(2024, 2, 28); // 28/03/2024: início do ciclo
            const diff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
            shiftIndex = (diff + letterOffset + cycle.length) % cycle.length;
        }

        const dayClass = cycle[shiftIndex];
        const isToday = (
            i === today.getDate() && 
            currentMonth === today.getMonth() && 
            currentYear === today.getFullYear()
        ) ? 'today' : '';

        days.push(`
            <div class="day ${isToday}">
                <span>${i}</span>
                <div class="shift ${dayClass}">${dayClass}</div>
            </div>
        `);
    }

    document.getElementById('calendar').innerHTML = days.join('');
    updateStatus(new Date(), selectedLetter, selectedEscala);
}
// Atualiza a notificação de status (mantém igual)
function updateStatus(today, letter, escala) {
    let cycle = escalas[escala][0].shiftCycle;
    const letterOffset = letter.charCodeAt(0) - 65;

    if (escala === '6x1/5x2') {
        const ciclo6x1 = ['T','T','T','T','T','T','F'];
        const ciclo5x2 = ['T','T','T','T','T','F','F'];

        const isEven = letterOffset % 2 === 0;
        cycle = isEven 
            ? [...ciclo6x1, ...ciclo5x2]
            : [...ciclo5x2, ...ciclo6x1];

        const baseDate = new Date(2024, 2, 25); // segunda-feira 25/03/2024
        const diff = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
        const dayOfCycle = (diff + cycle.length) % cycle.length;

        const currentShift = cycle[dayOfCycle];
        const nextShiftIndex = (dayOfCycle + 1) % cycle.length;
        const nextShift = cycle[nextShiftIndex];

        let nextShiftDate = new Date(today);
        nextShiftDate.setDate(today.getDate() + 1);

        const nextShiftTime = getShiftTime(nextShift);
        const nextShiftDay = nextShiftDate.toLocaleDateString('pt-BR');

        let statusText = `Hoje: ${currentShift}. `;
        if (currentShift === 'F') {
            statusText += `Você está de folga. Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
        } else {
            statusText += `Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
        }

        document.getElementById('status').innerHTML = statusText;
        showNotification('notificationMain', statusText);
        return;
    }

    // Lógica padrão para escalas não personalizadas
    const baseDate = new Date(2024, 2, 28);
    const diff = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
    const dayOfCycle = (diff + letterOffset + cycle.length) % cycle.length;

    const currentShift = cycle[dayOfCycle];
    const nextShiftIndex = (dayOfCycle + 1) % cycle.length;
    const nextShift = cycle[nextShiftIndex];

    let nextShiftDate = new Date(today);
    nextShiftDate.setDate(today.getDate() + 1);

    const nextShiftTime = getShiftTime(nextShift);
    const nextShiftDay = nextShiftDate.toLocaleDateString('pt-BR');

    let statusText = `Hoje: ${currentShift}. `;
    if (currentShift === 'F') {
        statusText += `Você está de folga. Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
    } else {
        statusText += `Próximo turno: ${nextShift} no dia ${nextShiftDay} às ${nextShiftTime}`;
    }

   
    showNotification('notificationMain', statusText);
}
// Horário de cada turno (sem alterações)
function getShiftTime(shift) {
    if (shift === 'T1') return '06:30';
    if (shift === 'T2') return '14:30';
    if (shift === 'T3') return '22:30';
    if (shift === 'T')  return '07:00';
    if (shift === 'F')  return '00:00';
    return '';
}
// Notificação visual (sem alterações)
function showNotification(elementId, message) {
    const box = document.getElementById(elementId);
    const text = box.querySelector('p');
    text.innerHTML = message;
    box.style.display = 'block';
    setTimeout(() => box.style.opacity = '1', 100);
    setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => box.style.display = 'none', 500);
    }, 5000);
}
// Botões de navegação de mês
document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
});
function goTo(screen) {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('register').classList.add('hidden');
    document.getElementById('main').classList.add('hidden');
    document.getElementById(screen).classList.remove('hidden');
}
// Funcao de retorno a tela de login
function reset (){
    document.querySelector('#idLogin').value = ''
    document.querySelector('#senhaLogin').value = ''
    goTo('login')
}
// Eventos dos selects
document.getElementById('selectLetra').addEventListener('change', generateCalendar);
document.getElementById('selectEscala').addEventListener('change', generateCalendar);
  // Escopo de eventos dos botões
  document.querySelector('#confirmarLogin').addEventListener('click', login);
  document.querySelector('#confirmarCadastro').addEventListener('click', register);
  document.getElementById('logoutButton').addEventListener('click',reset);
  document.getElementById('logoutButtonM').addEventListener('click',reset);
  document.querySelector('#buttonDelete').addEventListener('click',deletefuncionario);

  // Evento do botao de exibir notificacao
  document.querySelector('#showNotification').addEventListener('click',() => {
      alert('Essa e uma simulação de notificação')
  })

