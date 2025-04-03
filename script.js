// Configuração do Firebase (substitua pelos seus valores)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let registros = [];

auth.onAuthStateChanged((user) => {
  if (!user) {
    // Se não houver usuário autenticado, redirecionar para login
    window.location.href = "login.html";
  } else {
    carregarRegistros();
  }
});

// Função para adicionar um registro
function adicionarRegistro() {
  const registro = criarRegistro();
  if (!registro) return;

  db.collection("registros")
    .add(registro)
    .then((docRef) => {
      console.log("Registro adicionado com ID: ", docRef.id);
      carregarRegistros();
      limparFormulario();
    })
    .catch((error) => {
      console.error("Erro ao adicionar registro: ", error);
      alert("Erro ao adicionar o registro. Verifique o console.");
    });
}

// Função para carregar os registros
function carregarRegistros() {
  db.collection("registros")
    .get()
    .then((querySnapshot) => {
      registros = [];
      querySnapshot.forEach((doc) => {
        registros.push({ id: doc.id, ...doc.data() });
      });
      console.log("Registros carregados:", registros);
      atualizarTabela(registros);
    })
    .catch((error) => {
      console.error("Erro ao carregar registros: ", error);
      alert("Erro ao carregar registros. Verifique o console.");
    });
}

// Função para atualizar a tabela
function atualizarTabela(registros) {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = "";

  registros.forEach((registro) => {
    const tr = document.createElement("tr");
    tr.dataset.id = registro.id;
    tr.innerHTML = `
      <td>${registro.id}</td>
      <td>${registro.solicitante}</td>
      <td>${registro.loja}</td>
      <td>${registro.servico}</td>
      <td>R$ ${registro.orcamento}</td>
      <td>${registro.infraspeak}</td>
      <td>${registro.mesServico}</td>
      <td>${registro.faturamento}</td>
      <td>${registro.situacao}</td>
      <td>${registro.projetoManutencao}</td>
      <td>
        <button class="delete-btn" onclick="excluirRegistro('${registro.id}')">Excluir</button>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });
}

function excluirRegistro(id) {
  if (!confirm("Tem certeza que deseja excluir este registro?")) return;

  db.collection("registros")
    .doc(id)
    .delete()
    .then(() => {
      console.log("Registro excluído com sucesso.");
      carregarRegistros();
    })
    .catch((error) => {
      console.error("Erro ao excluir registro: ", error);
      alert("Erro ao excluir o registro. Verifique o console.");
    });
}

// Função para criar um novo registro
function criarRegistro() {
  const solicitante = document.getElementById("solicitante").value.trim();
  const loja = document.getElementById("loja").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const orcamento = formatarOrcamento(
    document.getElementById("orcamento").value.trim()
  );
  const infraspeak = document.getElementById("InfraSpeak").value.trim();
  const mesServico = document.getElementById("mesServico").value;
  const faturamento = document.getElementById("faturamento").value;
  const situacao = document.getElementById("situacao").value;
  const projetoManutencao = document.getElementById("projetoManutencao").value;

  if (!solicitante || !loja || !servico || !orcamento || !infraspeak) {
    alert("Preencha todos os campos obrigatórios!");
    return null;
  }

  return {
    solicitante,
    loja,
    servico,
    orcamento,
    infraspeak,
    mesServico,
    faturamento,
    situacao,
    projetoManutencao,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };
}

// Função para formatar o orçamento
function formatarOrcamento(valor) {
  const num = parseFloat(valor);
  if (isNaN(num) || num < 0) {
    return "0,00";
  }
  return num.toFixed(2).replace(".", ",");
}

// Função para limpar o formulário
function limparFormulario() {
  document.getElementById("formServico").reset();
}

// Função para filtrar registros
function filtrarRegistros() {
  const filtroSolicitante = document
    .getElementById("filtroSolicitante")
    .value.trim()
    .toLowerCase();
  const filtroMes = document.getElementById("filtroMes").value;
  const filtroSituacao = document.getElementById("filtroSituacao").value;
  const filtroFaturamento = document.getElementById("filtroFaturamento").value;

  const filtered = registros.filter((registro) => {
    return (
      (!filtroSolicitante ||
        registro.solicitante.toLowerCase().includes(filtroSolicitante)) &&
      (!filtroMes || registro.mesServico === filtroMes) &&
      (!filtroSituacao || registro.situacao === filtroSituacao) &&
      (!filtroFaturamento || registro.faturamento === filtroFaturamento)
    );
  });
  atualizarTabela(filtered);
}

// Função para limpar filtros
function limparFiltros() {
  document.getElementById("filtroSolicitante").value = "";
  document.getElementById("filtroMes").value = "";
  document.getElementById("filtroSituacao").value = "";
  document.getElementById("filtroFaturamento").value = "";
  atualizarTabela(registros);
}

// Função para exportar para Excel
function exportarParaExcel() {
  if (registros.length === 0) {
    alert("Nenhum registro para exportar!");
    return;
  }

  let csv =
    "ID,Solicitante,Loja,Serviço,Orçamento,InfraSpeak,Mês,Faturamento,Situação,Projeto/Manutenção\n";
  registros.forEach((registro) => {
    csv += `${registro.id},"${registro.solicitante}","${registro.loja}","${registro.servico}",R$ ${registro.orcamento},"${registro.infraspeak}","${registro.mesServico}","${registro.faturamento}","${registro.situacao}","${registro.projetoManutencao}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "registros_servicos.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para imprimir
function imprimir() {
  window.print();
}
