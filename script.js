// Configuração do Firebase (usando seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyD-2sAZHl_5LPYzmUKFfsz2sKpngXIlVSE",
  authDomain: "gerenciador-servicos.firebaseapp.com",
  projectId: "gerenciador-servicos",
  storageBucket: "gerenciador-servicos.appspot.com",
  messagingSenderId: "557824843547",
  appId: "1:557824843547:web:eacd2121ecfd3c2653bdbe",
  measurementId: "G-ZMQ6MM17KK",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Máscara para o campo Orçamento
document.getElementById("orcamento").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
  value = (value / 100).toFixed(2); // Divide por 100 e fixa 2 casas decimais
  value = value.replace(".", ","); // Substitui ponto por vírgula
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos como separadores de milhar
  e.target.value = `R$ ${value}`;
});

// Função para adicionar registro
function adicionarRegistro() {
  let orcamentoValue = document.getElementById("orcamento").value;
  orcamentoValue = orcamentoValue
    .replace("R$ ", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const dados = {
    solicitante: document.getElementById("solicitante").value,
    loja: document.getElementById("loja").value,
    servico: document.getElementById("servico").value,
    orcamento: parseFloat(orcamentoValue),
    infraspeak: document.getElementById("InfraSpeak").value,
    mes: document.getElementById("mesServico").value,
    faturamento: document.getElementById("faturamento").value,
    situacao: document.getElementById("situacao").value,
    tipo: document.getElementById("projetoManutencao").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  db.collection("registros")
    .add(dados)
    .then((docRef) => {
      console.log("Registro adicionado com ID: ", docRef.id);
      listarRegistros();
      document.getElementById("formServico").reset();
      document.getElementById("orcamento").value = "R$ 0,00";
    })
    .catch((error) => {
      console.error("Erro ao adicionar registro: ", error);
      alert("Erro ao adicionar registro: " + error.message);
    });
}

// Função para listar registros
function listarRegistros() {
  const tbody = document.getElementById("corpoTabela");
  tbody.innerHTML = "";

  db.collection("registros")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
          <tr>
            <td>${doc.id}</td>
            <td>${data.solicitante}</td>
            <td>${data.loja}</td>
            <td>${data.servico}</td>
            <td>R$ ${data.orcamento.toFixed(2).replace(".", ",")}</td>
            <td>${data.infraspeak}</td>
            <td>${data.mes}</td>
            <td>${data.faturamento}</td>
            <td>${data.situacao}</td>
            <td>${data.tipo}</td>
            <td><button onclick="deletarRegistro('${
              doc.id
            }')">Deletar</button></td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Erro ao listar registros: ", error);
      alert("Erro ao listar registros: " + error.message);
    });
}

// Função para deletar registro
function deletarRegistro(id) {
  db.collection("registros")
    .doc(id)
    .delete()
    .then(() => {
      console.log("Registro deletado");
      listarRegistros();
    })
    .catch((error) => {
      console.error("Erro ao deletar: ", error);
      alert("Erro ao deletar registro: " + error.message);
    });
}

// Função para filtrar registros
function filtrarRegistros() {
  const filtroSolicitante = document
    .getElementById("filtroSolicitante")
    .value.toLowerCase();
  const filtroMes = document.getElementById("filtroMes").value;
  const filtroSituacao = document.getElementById("filtroSituacao").value;
  const filtroFaturamento = document.getElementById("filtroFaturamento").value;

  let query = db.collection("registros").orderBy("timestamp", "desc");

  if (filtroMes) query = query.where("mes", "==", filtroMes);
  if (filtroSituacao) query = query.where("situacao", "==", filtroSituacao);
  if (filtroFaturamento)
    query = query.where("faturamento", "==", filtroFaturamento);

  const tbody = document.getElementById("corpoTabela");
  tbody.innerHTML = "";

  query
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          filtroSolicitante &&
          !data.solicitante.toLowerCase().includes(filtroSolicitante)
        )
          return;
        const row = `
          <tr>
            <td>${doc.id}</td>
            <td>${data.solicitante}</td>
            <td>${data.loja}</td>
            <td>${data.servico}</td>
            <td>R$ ${data.orcamento.toFixed(2).replace(".", ",")}</td>
            <td>${data.infraspeak}</td>
            <td>${data.mes}</td>
            <td>${data.faturamento}</td>
            <td>${data.situacao}</td>
            <td>${data.tipo}</td>
            <td><button onclick="deletarRegistro('${
              doc.id
            }')">Deletar</button></td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Erro ao filtrar registros: ", error);
      alert("Erro ao filtrar registros: " + error.message);
    });
}

// Função para limpar filtros
