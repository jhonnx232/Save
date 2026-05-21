-- ##########################################################################
-- ENTREGA 3.1: CRIAÇÃO DO BANCO DE DADOS E TABELAS
-- ##########################################################################

-- 1. Criação do Banco de Dados
-- (Comando opcional, dependendo do ambiente, mas recomendado)
CREATE DATABASE IF NOT EXISTS saep_db;
USE saep_db;


-- 2. Tabela USUARIO (Para Autenticação e Responsabilidade)
CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    -- Senha armazenada como hash para segurança (RF01)
    cargo VARCHAR(50) 
);

-- 3. Tabela PRODUTO (Para Cadastro, Estoque Atual e Mínimo)
CREATE TABLE PRODUTO (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao_detalhada TEXT,
    unidade_medida VARCHAR(10) NOT NULL,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    -- Campos extras para as características complexas
    material_cabeca VARCHAR(50),
    tipo_ponta VARCHAR(50)
);

-- 4. Tabela MOVIMENTACAO (Para Histórico e Rastreabilidade)
CREATE TABLE MOVIMENTACAO (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_movimentacao ENUM('ENTRADA', 'SAIDA') NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao DATETIME NOT NULL,
    observacao VARCHAR(255),
    
    -- Chaves Estrangeiras (RF09)
    FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE
);

-- ##########################################################################
-- ENTREGA 3.2: POPULAÇÃO DE DADOS (Pelo menos três registros em cada tabela)
-- ##########################################################################

-- 1. População de USUARIO
INSERT INTO USUARIO (nome, login, senha, cargo) VALUES
('João Almoxarife', 'joao.almox', 'senha_hash_1', 'Almoxarife'),
('Maria Supervisora', 'maria.sup', 'senha_hash_2', 'Supervisora'),
('Admin Master', 'admin', 'senha123', 'Gerente');

-- 2. População de PRODUTO
-- Produto A: Estoque Atual 15, Mínimo 10
INSERT INTO PRODUTO (nome, descricao_detalhada, unidade_medida, estoque_atual, estoque_minimo, material_cabeca, tipo_ponta) VALUES
('Martelo de Borracha 500g', 'Cabo em fibra de vidro, cabeça de borracha para não danificar superfícies.', 'un', 15, 10, 'Borracha', NULL),
('Chave de Fenda Philips 5mm', 'Ponta imantada com revestimento isolante 1000V.', 'un', 45, 20, NULL, 'Philips (Imantada)'),
('Alicate Universal 8"', 'Aço carbono, cabo emborrachado azul.', 'un', 80, 50, NULL, NULL);

-- 3. População de MOVIMENTACAO
-- Nota: As FKs (1, 2, 3) referenciam os IDs criados nas inserções acima.
INSERT INTO MOVIMENTACAO (id_produto, id_usuario, tipo_movimentacao, quantidade, data_movimentacao, observacao) VALUES
-- Entrada inicial do Martelo
(1, 2, 'ENTRADA', 20, '2025-11-01 09:30:00', 'Compra inicial do lote BZ-001'),
-- Saída do Martelo para uso na produção (reduz estoque para 15)
(1, 1, 'SAIDA', 5, '2025-11-05 14:00:00', 'Retirada para linha de montagem'),
-- Entrada de um novo lote de Chaves de Fenda
(2, 3, 'ENTRADA', 45, '2025-11-10 10:15:00', 'Recebimento do lote de importação');
select * from produto;