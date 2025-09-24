let contas = JSON.parse(localStorage.getItem("contas")) || []

let form = document.querySelector("#form-conta")
let lista = document.querySelector("#lista-contas")
let totalPagas = document.querySelector("#total-pagas")
let totalPendentes = document.querySelector("#total-pendentes")
let btnExportar = document.querySelector("#exportar")
let btnLimpar = document.querySelector("#limpar")
let inputValor = document.querySelector("#valor")

VMasker(inputValor).maskMoney({
    precision: 2,
    separator: ',',
    delimiter: '.',
    unit: 'R$ ',
})

function atualizarTotais() {
    let contasPagas = [];
    for (let conta of contas) {
        if (conta.status === "pago") {
            contasPagas.push(conta);
        }
    }

    let contasPendentes = [];
    for (let conta of contas) {
        if (conta.status === "pendente") {
            contasPendentes.push(conta);
        }
    }

    let totalPagasValor = 0;
    for (let c of contasPagas) {
        totalPagasValor += c.valor;
    }

    let totalPendentesValor = 0;
    for (let c of contasPendentes) {
        totalPendentesValor += c.valor;
    }

    let totalPagasValorFormatado = totalPagasValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let totalPendentesValorFormatado = totalPendentesValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    totalPagas.textContent = `✅ Contas Pagas: ${contasPagas.length} (${totalPagasValorFormatado})`
    totalPendentes.textContent = `⚠️ Contas Pendentes: ${contasPendentes.length} (${totalPendentesValorFormatado})`
}

function renderizarContas() {
    lista.innerHTML = ""

    for (let i = 0; i < contas.length; i++) {
        let conta = contas[i];
        let tr = document.createElement("tr");

        if (conta.status === "pago") {
            tr.className = "pago";
        }else {
            tr.className = "pendente"
        }

        tr.innerHTML = `
            <td>${conta.nome}</td>
            <td>${conta.descricao}</td>
            <td>${conta.vencimento}</td>
            <td>R$ ${conta.valor.toFixed(2)}</td>
            <td>${conta.status}</td>
            <td>${conta.categoria}</td>
            <td>
                <button onclick="editarConta(${i})">Editar</button>
                <button onclick="excluirConta(${i})">Excluir</button>
            </td>
        `;

        lista.appendChild(tr);
    }

    localStorage.setItem("contas", JSON.stringify(contas))
    atualizarTotais()
}

function salvarContas(event) {
    event.preventDefault()

    let nomeInput = document.querySelector("#nome")
    let descricaoInput = document.querySelector("#descricao")
    let vencimentoInput = document.querySelector("#vencimento")
    let valorInput = document.querySelector("#valor")
    let statusInput = document.querySelector("#status")
    let categoriaInput = document.querySelector("#categoria")

    //Possível validação dos campos
    // if (!nomeInput.value || !descricaoInput.value || !vencimentoInput.value || !valorInput.value || !statusInput.value || !categoriaInput.value) {
    //     alert("Por favor, preencha todos os campos.")
    //     return
    // }

    let valorFormatado = valorInput.value
        .replace("R$ ", "")
        .replace(".", "")
        .replace(",", ".")

    let conta = {
        nome: nomeInput.value,
        descricao: descricaoInput.value,
        vencimento: vencimentoInput.value,
        valor: Number(valorFormatado),
        status: statusInput.value,
        categoria: categoriaInput.value
    }

    contas.push(conta)

    form.reset()

    renderizarContas()
}

function excluirConta(index) {
    let usuarioQuerExcluirConta = confirm("Tem certeza que deseja excluir esta conta?")

    if (usuarioQuerExcluirConta === true) {
        contas.splice(index, 1)
        renderizarContas()
    }
}

function editarConta(index) {
    let conta = contas[index]
    document.querySelector("#nome").value = conta.nome
    document.querySelector("#descricao").value = conta.descricao
    document.querySelector("#vencimento").value = conta.vencimento
    document.querySelector("#valor").value = conta.valor
    document.querySelector("#status").value = conta.status
    document.querySelector("#categoria").value = conta.categoria
    contas.splice(index, 1) // remove a antiga para substituir depois
}

function limparCampos() {
    form.reset()
}

function exportarXLSX() {
    let worksheet = XLSX.utils.json_to_sheet(contas)
    let workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contas")
    XLSX.writeFile(workbook, "contas.xlsx")
}

form.addEventListener("submit", salvarContas)
btnLimpar.addEventListener("click", limparCampos)
btnExportar.addEventListener("click", exportarXLSX)

renderizarContas()
