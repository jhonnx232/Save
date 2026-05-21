const API_URL = 'http://localhost:3030';
const produtoSelect = document.getElementById('produtoSelect');
const estoqueTableBody = document.getElementById('estoqueTableBody');
const movimentacaoForm = document.getElementById('movimentacaoForm');
const movimentacaoFeedback = document.getElementById('movimentacaoFeedback');


async function loadProdutosEstoque() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        if (!response.ok) throw new Error('Falha ao carregar produtos.');
        
        const produtos = await response.json();
        
        // RF11: Ordenação Alfabética
        produtos.sort((a, b) => a.nome.localeCompare(b.nome)); 
        
        populateProductSelect(produtos);
        renderEstoqueTable(produtos);

    } catch (error) {
        console.error('Erro ao carregar estoque:', error);
        showFeedback('Não foi possível carregar os dados de estoque.', 'erro');
    }
}

function populateProductSelect(produtos) {
    produtoSelect.innerHTML = '<option value="">Selecione um produto...</option>';
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id_produto;
        option.textContent = `${produto.nome} (Atual: ${produto.estoque_atual})`;
        produtoSelect.appendChild(option);
    });
}

function renderEstoqueTable(produtos) {
    estoqueTableBody.innerHTML = ''; 

    produtos.forEach(produto => {
        const row = estoqueTableBody.insertRow();
        
        // RF10: Lógica de Status (Visual)
        let statusText = 'OK';
        let statusClass = 'status-ok';

        if (produto.estoque_atual <= produto.estoque_minimo) {
            statusText = 'BAIXO';
            statusClass = 'status-baixo';
        }
        if (produto.estoque_atual === 0) {
            statusText = 'ESGOTADO';
            statusClass = 'status-esgotado';
        }

        row.insertCell().textContent = produto.id_produto;
        row.insertCell().textContent = produto.nome;
        row.insertCell().textContent = produto.estoque_atual;
        row.insertCell().textContent = produto.estoque_minimo;
        row.insertCell().innerHTML = `<span class="${statusClass}">${statusText}</span>`;
        row.insertCell().textContent = produto.unidade_medida;
    });
}


movimentacaoForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id_produto = produtoSelect.value;
    const tipo_movimentacao = document.getElementById('tipoMovimentacao').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const dataMovimentacao = document.getElementById('dataMovimentacao').value;
    const observacao = document.getElementById('observacao').value;
    
    // RF09: Capturar o ID do usuário logado
    const id_usuario = sessionStorage.getItem('usuarioId');

    if (!id_produto || !tipo_movimentacao || quantidade <= 0 || !dataMovimentacao || !id_usuario) {
        showFeedback('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    if (tipo_movimentacao === 'SAIDA') {
        try {
            const response = await fetch(`${API_URL}/produtos`);
            if (response.ok) {
                const produtos = await response.json();
                const produtoSelecionado = produtos.find(p => p.id_produto == id_produto);
                
                if (produtoSelecionado) {
                    if (produtoSelecionado.estoque_atual === 0) {
                        showFeedback('❌ Produto ESGOTADO! Não é possível realizar saída. Realize uma entrada primeiro.', 'erro');
                        return;
                    }
                    if (produtoSelecionado.estoque_atual < quantidade) {
                        showFeedback(`❌ Estoque insuficiente! Disponível: ${produtoSelecionado.estoque_atual}. Solicitado: ${quantidade}.`, 'erro');
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar estoque:', error);
        }
    }

    const movimentacaoData = {
        id_produto,
        id_usuario,
        tipo_movimentacao,
        quantidade,
        data_movimentacao: dataMovimentacao,
        observacao
    };

    try {
        const response = await fetch(`${API_URL}/movimentacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimentacaoData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao registrar movimentação.');
        }

        showFeedback(data.message, 'sucesso');
        movimentacaoForm.reset();
        document.getElementById('dataMovimentacao').valueAsDate = new Date(); 
        
        // RF10: Tratamento do Alerta
        if (data.alerta) {
            alert('⚠️ ALERTA DE ESTOQUE MÍNIMO: O nível de estoque deste produto está agora abaixo do mínimo configurado!');
        }

        loadProdutosEstoque(); 

    } catch (error) {
        console.error('Erro na movimentação:', error);
        showFeedback(error.message || 'Erro de conexão com a API ao registrar movimento.', 'erro');
    }
});


function showFeedback(message, type) {
    movimentacaoFeedback.textContent = message;
    movimentacaoFeedback.className = `mensagem ${type}`;
    movimentacaoFeedback.style.display = 'block';
    setTimeout(() => { movimentacaoFeedback.style.display = 'none'; }, 5000);
}


document.addEventListener('DOMContentLoaded', () => {
  
    document.getElementById('dataMovimentacao').valueAsDate = new Date();

    if (!sessionStorage.getItem('usuarioId')) {
        window.location.href = 'login.html'; 
        return;
    }
    loadProdutosEstoque();
});
