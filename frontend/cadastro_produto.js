const API_URL = 'http://localhost:3030';
const produtosTableBody = document.getElementById('produtosTableBody');
const form = document.getElementById('produtoForm');
const idProdutoEdit = document.getElementById('id_produto_edit');
const formFeedback = document.getElementById('formFeedback');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');


async function loadProdutos(termo = '') {
    try {
        const url = termo ? `${API_URL}/produtos?termo=${encodeURIComponent(termo)}` : `${API_URL}/produtos`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Falha ao carregar produtos.');
        
        const produtos = await response.json();
        renderProdutos(produtos);

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showFeedback('Não foi possível carregar a lista de produtos.', 'erro');
    }
}

function renderProdutos(produtos) {
    produtosTableBody.innerHTML = ''; 
    if (produtos.length === 0) {
        produtosTableBody.innerHTML = '<tr><td colspan="7">Nenhum produto encontrado.</td></tr>';
        return;
    }

    produtos.forEach(produto => {
        const row = produtosTableBody.insertRow();
        row.insertCell().textContent = produto.id_produto;
        row.insertCell().textContent = produto.nome;
        row.insertCell().textContent = produto.unidade_medida;
        row.insertCell().textContent = produto.estoque_atual;
        row.insertCell().textContent = produto.estoque_minimo;
        row.insertCell().textContent = `${produto.descricao_detalhada || ''} ${produto.material_cabeca ? `(Cab: ${produto.material_cabeca})` : ''} ${produto.tipo_ponta ? `(Ponta: ${produto.tipo_ponta})` : ''}`;
        
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="btn-action edit" data-id="${produto.id_produto}" data-produto='${JSON.stringify(produto)}'>Editar</button>
            <button class="btn-action delete" data-id="${produto.id_produto}">Excluir</button>
        `;
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const isEditing = idProdutoEdit.value !== '';
    const endpoint = isEditing ? `${API_URL}/produtos/${idProdutoEdit.value}` : `${API_URL}/produtos`;
    const method = isEditing ? 'PUT' : 'POST';

    const produtoData = {
        nome: document.getElementById('nome').value.trim(),
        unidade_medida: document.getElementById('unidade_medida').value,
        estoque_minimo: parseInt(document.getElementById('estoque_minimo').value) || 0,
        estoque_atual: parseInt(document.getElementById('estoque_atual').value) || 0,
        descricao_detalhada: document.getElementById('descricao_detalhada').value,
        material_cabeca: document.getElementById('material_cabeca').value,
        tipo_ponta: document.getElementById('tipo_ponta').value,
    };

    // R6.1.6: Validação de campos obrigatórios
    if (!produtoData.nome || !produtoData.unidade_medida || produtoData.estoque_minimo === undefined) {
        showFeedback('Nome, Unidade e Estoque Mínimo são obrigatórios.', 'erro');
        return;
    }
    
    // Na edição (PUT), não enviamos o estoque_atual (que deve ser alterado apenas via Movimentação)
    if (isEditing) {
        delete produtoData.estoque_atual; 
    }
    
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoData)
        });

        const data = await response.json();

        if (!response.ok) {
            showFeedback(data.message || `Erro ao ${isEditing ? 'editar' : 'cadastrar'} produto.`, 'erro');
            return;
        }

        showFeedback(data.message || `Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`, 'sucesso');
        resetFormAndMode();
        loadProdutos(); 

    } catch (error) {
        console.error('Erro na requisição:', error);
        showFeedback('Erro de conexão com a API.', 'erro');
    }
}

async function handleDelete(id) {
    if (!confirm(`Tem certeza que deseja excluir o produto ID ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            showFeedback(`Produto ID ${id} excluído com sucesso.`, 'sucesso');
            loadProdutos();
        } else {
            const data = await response.json();
            showFeedback(data.message || 'Erro ao excluir produto.', 'erro');
        }
    } catch (error) {
        console.error('Erro na exclusão:', error);
        showFeedback('Erro de conexão ao tentar excluir.', 'erro');
    }
}

function handleEdit(produtoData) {
    // Preenche o formulário
    idProdutoEdit.value = produtoData.id_produto;
    document.getElementById('nome').value = produtoData.nome;
    document.getElementById('unidade_medida').value = produtoData.unidade_medida;
    document.getElementById('estoque_minimo').value = produtoData.estoque_minimo;
    document.getElementById('descricao_detalhada').value = produtoData.descricao_detalhada || '';
    document.getElementById('material_cabeca').value = produtoData.material_cabeca || '';
    document.getElementById('tipo_ponta').value = produtoData.tipo_ponta || '';
    
    // Estoque atual não pode ser editado nesta tela
    document.getElementById('estoque_atual').value = produtoData.estoque_atual;
    document.getElementById('estoque_atual').disabled = true; 

    btnSalvar.textContent = 'Atualizar Produto';
    btnCancelar.style.display = 'inline-block';
    showFeedback('Modo Edição ativado.', 'aviso');
    window.scrollTo(0, 0); 
}


function showFeedback(message, type) {
    formFeedback.textContent = message;
    formFeedback.className = `mensagem ${type}`;
    formFeedback.style.display = 'block';
}

function resetFormAndMode() {
    form.reset();
    idProdutoEdit.value = '';
    btnSalvar.textContent = 'Salvar Produto';
    btnCancelar.style.display = 'none';
    document.getElementById('estoque_atual').disabled = false;
    formFeedback.style.display = 'none';
}


form.addEventListener('submit', handleFormSubmit);
btnCancelar.addEventListener('click', resetFormAndMode);

produtosTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        handleDelete(e.target.dataset.id);
    } else if (e.target.classList.contains('edit')) {
        const produtoData = JSON.parse(e.target.dataset.produto);
        handleEdit(produtoData);
    }
});

document.getElementById('btnBuscar').addEventListener('click', () => {
    loadProdutos(document.getElementById('buscaTermo').value);
});

document.getElementById('btnLimparBusca').addEventListener('click', () => {
    document.getElementById('buscaTermo').value = '';
    loadProdutos();
});

document.addEventListener('DOMContentLoaded', () => {
    // Verificação de sessão
    if (!sessionStorage.getItem('usuarioId')) {
        window.location.href = 'login.html'; 
        return;
    }
    loadProdutos();
});