const API_URL = 'http://localhost:3030';

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagemErro');

    mensagemErro.style.display = 'none';
    if (!login || !senha) {
        mensagemErro.textContent = 'Por favor, preencha todos os campos.';
        mensagemErro.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Sucesso: Armazena a sessão (RF03) e redireciona
            sessionStorage.setItem('usuarioId', data.id);
            sessionStorage.setItem('usuarioNome', data.nome);
            window.location.href = 'home.html'; 
        } else {
            // Falha (RF01)
            mensagemErro.textContent = data.message || 'Falha na autenticação. Verifique suas credenciais.';
            mensagemErro.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        mensagemErro.textContent = 'Não foi possível conectar ao servidor.';
        mensagemErro.style.display = 'block';
    }
});