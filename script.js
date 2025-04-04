import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD-2sAZHl_5LPYzmUKFfsz2sKpngXIlVSE",
  authDomain: "gerenciador-servicos.firebaseapp.com",
  projectId: "gerenciador-servicos",
  storageBucket: "gerenciador-servicos.firebasestorage.app",
  messagingSenderId: "557824843547",
  appId: "1:557824843547:web:eacd2121ecfd3c2653bdbe",
  measurementId: "G-ZMQ6MM17KK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firebaseConfig = {
  apiKey: "AIzaSyD-2sAZHl_5LPYzmUKFfsz2sKpngXIlVSE",
  authDomain: "gerenciador-servicos.firebaseapp.com",
  projectId: "gerenciador-servicos",
  storageBucket: "gerenciador-servicos.appspot.com", // Corrigido para .appspot.com
  messagingSenderId: "557824843547",
  appId: "1:557824843547:web:eacd2121ecfd3c2653bdbe",
  measurementId: "G-ZMQ6MM17KK",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

function adicionarRegistro() {
  const arquivoInput = document.getElementById("arquivo").files[0];
  const dados = {
    solicitante: document.getElementById("solicitante").value,
    loja: document.getElementById("loja").value,
    servico: document.getElementById("servico").value,
    orcamento: parseFloat(document.getElementById("orcamento").value),
    infraspeak: document.getElementById("InfraSpeak").value,
    mes: document.getElementById("mesServico").value,
    faturamento: document.getElementById("faturamento").value,
    situacao: document.getElementById("situacao").value,
    tipo: document.getElementById("projetoManutencao").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (arquivoInput) {
    const storageRef = storage.ref(`orcamentos/${arquivoInput.name}`);
    storageRef
      .put(arquivoInput)
      .then((snapshot) => {
        return storageRef.getDownloadURL();
      })
      .then((url) => {
        dados.arquivoUrl = url;
        return db.collection("registros").add(dados);
      })
      .then((docRef) => {
        console.log("Registro adicionado com ID: ", docRef.id);
        listarRegistros();
        document.getElementById("formServico").reset();
      })
      .catch((error) => {
        console.error("Erro ao adicionar registro: ", error);
      });
  } else {
    db.collection("registros")
      .add(dados)
      .then((docRef) => {
        console.log("Registro adicionado com ID: ", docRef.id);
        listarRegistros();
        document.getElementById("formServico").reset();
      })
      .catch((error) => {
        console.error("Erro ao adicionar registro: ", error);
      });
  }
}

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
            <td>R$ ${data.orcamento.toFixed(2)}</td>
            <td>${data.infraspeak}</td>
            <td>${data.mes}</td>
            <td>${data.faturamento}</td>
            <td>${data.situacao}</td>
            <td>${data.tipo}</td>
            <td>${
              data.arquivoUrl
                ? `<a href="${data.arquivoUrl}" target="_blank">Download</a>`
                : "Nenhum"
            }</td>
            <td><button onclick="deletarRegistro('${
              doc.id
            }')">Deletar</button></td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    });
}

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
    });
}

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

  query.get().then((querySnapshot) => {
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
          <td>R$ ${data.orcamento.toFixed(2)}</td>
          <td>${data.infraspeak}</td>
          <td>${data.mes}</td>
          <td>${data.faturamento}</td>
          <td>${data.situacao}</td>
          <td>${data.tipo}</td>
          <td>${
            data.arquivoUrl
              ? `<a href="${data.arquivoUrl}" target="_blank">Download</a>`
              : "Nenhum"
          }</td>
          <td><button onclick="deletarRegistro('${
            doc.id
          }')">Deletar</button></td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  });
}

function limparFiltros() {
  document.getElementById("filtroSolicitante").value = "";
  document.getElementById("filtroMes").value = "";
  document.getElementById("filtroSituacao").value = "";
  document.getElementById("filtroFaturamento").value = "";
  listarRegistros();
}

function exportarParaExcel() {
  const tbody = document.getElementById("corpoTabela");
  const rows = tbody.getElementsByTagName("tr");
  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = [
    "ID,Solicitante,Loja,Serviço,Orçamento,InfraSpeak,Mês,Faturamento,Situação,Tipo,Arquivo",
  ];
  csvContent += headers.join(",") + "\n";

  for (let row of rows) {
    const cells = row.getElementsByTagName("td");
    const rowData = [
      cells[0].innerText,
      cells[1].innerText,
      cells[2].innerText,
      cells[3].innerText,
      cells[4].innerText,
      cells[5].innerText,
      cells[6].innerText,
      cells[7].innerText,
      cells[8].innerText,
      cells[9].innerText,
      cells[10].innerText === "Download"
        ? cells[10].querySelector("a").href
        : "Nenhum",
    ];
    csvContent += rowData.join(",") + "\n";
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "registros_servicos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function imprimir() {
  window.print();
}

listarRegistros();
