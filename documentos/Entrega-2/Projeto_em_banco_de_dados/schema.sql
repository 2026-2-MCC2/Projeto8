
-- ============================================================
-- TicketLab / TrocaTicket
-- Entrega 2 - Implementacao Inicial do Banco de Dados
-- SGBD: MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS trocaticket
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE trocaticket;

-- ============================================================
-- 1. Tabela: usuarios
-- ============================================================

CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    senha_hash VARCHAR(250) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cidade VARCHAR(100) DEFAULT NULL,
    estado CHAR(2) DEFAULT NULL,
    analisado_por INT DEFAULT NULL,
    data_analise DATETIME DEFAULT NULL,
    motivo_rejeicao VARCHAR(500) DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY email (email),
    KEY fk_usuarios_analisado_por (analisado_por),

    CONSTRAINT fk_usuarios_analisado_por
        FOREIGN KEY (analisado_por) REFERENCES usuarios (id),

    CONSTRAINT usuarios_chk_1
        CHECK (tipo IN ('ORGANIZADOR', 'FORNECEDOR', 'ADMINISTRADOR')),

    CONSTRAINT usuarios_chk_2
        CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 2. Tabela: organizadores
-- ============================================================

CREATE TABLE organizadores (
    id_usuario INT NOT NULL,
    tipo_pessoa VARCHAR(50) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    data_nascimento DATE DEFAULT NULL,

    PRIMARY KEY (id_usuario),
    UNIQUE KEY documento (documento),

    CONSTRAINT organizadores_ibfk_1
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id),

    CONSTRAINT organizadores_chk_1
        CHECK (tipo_pessoa IN ('PJ', 'PF'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 3. Tabela: fornecedores
-- ============================================================

CREATE TABLE fornecedores (
    id_usuario INT NOT NULL,
    CNPJ VARCHAR(40) NOT NULL,
    categoria_atuacao VARCHAR(255) NOT NULL,
    razao_social VARCHAR(200) DEFAULT NULL,
    regiao_atendimento VARCHAR(200) DEFAULT NULL,
    descricao TEXT,
    site VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (id_usuario),
    UNIQUE KEY CNPJ (CNPJ),

    CONSTRAINT fornecedores_ibfk_1
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 4. Tabela: eventos
-- ============================================================

CREATE TABLE eventos (
    id INT NOT NULL AUTO_INCREMENT,
    id_organizador INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    local VARCHAR(200) NOT NULL,
    data_evento DATE NOT NULL,
    horario TIME NOT NULL,
    publico_min INT NOT NULL,
    publico_max INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    orcamento_previsto DECIMAL(12,2) DEFAULT NULL,

    PRIMARY KEY (id),
    KEY id_organizador (id_organizador),

    CONSTRAINT eventos_ibfk_1
        FOREIGN KEY (id_organizador) REFERENCES organizadores (id_usuario),

    CONSTRAINT chk_eventos_orcamento
        CHECK (orcamento_previsto IS NULL OR orcamento_previsto >= 0),

    CONSTRAINT eventos_chk_1
        CHECK (status IN ('PLANEJAMENTO', 'CONFIRMADO', 'CANCELADO')),

    CONSTRAINT eventos_chk_2
        CHECK (publico_max > publico_min)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 5. Tabela: servicos
-- ============================================================

CREATE TABLE servicos (
    id INT NOT NULL AUTO_INCREMENT,
    id_fornecedor INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    PRIMARY KEY (id),
    KEY id_fornecedor (id_fornecedor),

    CONSTRAINT servicos_ibfk_1
        FOREIGN KEY (id_fornecedor) REFERENCES fornecedores (id_usuario),

    CONSTRAINT chk_servicos_status
        CHECK (status IN ('ATIVO', 'RASCUNHO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 6. Tabela: precos_servicos
-- ============================================================

CREATE TABLE precos_servicos (
    id INT NOT NULL AUTO_INCREMENT,
    id_servico INT NOT NULL,
    publico_max INT NOT NULL,
    publico_min INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id),
    KEY id_servico (id_servico),

    CONSTRAINT precos_servicos_ibfk_1
        FOREIGN KEY (id_servico) REFERENCES servicos (id),

    CONSTRAINT precos_servicos_chk_1
        CHECK (publico_max > publico_min)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 7. Tabela: eventos_servicos
-- ============================================================

CREATE TABLE eventos_servicos (
    id INT NOT NULL AUTO_INCREMENT,
    id_evento INT NOT NULL,
    id_servico INT NOT NULL,
    preco_aplicado DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY id_evento (id_evento, id_servico),
    KEY id_servico (id_servico),

    CONSTRAINT eventos_servicos_ibfk_1
        FOREIGN KEY (id_evento) REFERENCES eventos (id),

    CONSTRAINT eventos_servicos_ibfk_2
        FOREIGN KEY (id_servico) REFERENCES servicos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 8. Tabela: propostas
-- ============================================================

CREATE TABLE propostas (
    id INT NOT NULL AUTO_INCREMENT,
    id_evento INT NOT NULL,
    id_servico INT NOT NULL,
    id_fornecedor INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    prazo_dias INT NOT NULL,
    observacao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ENVIADA',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_proposta_evento_servico (id_evento, id_servico),
    KEY id_servico (id_servico),
    KEY idx_propostas_fornecedor (id_fornecedor, status),
    KEY idx_propostas_evento (id_evento),

    CONSTRAINT propostas_ibfk_1
        FOREIGN KEY (id_evento) REFERENCES eventos (id),

    CONSTRAINT propostas_ibfk_2
        FOREIGN KEY (id_servico) REFERENCES servicos (id),

    CONSTRAINT propostas_ibfk_3
        FOREIGN KEY (id_fornecedor) REFERENCES fornecedores (id_usuario),

    CONSTRAINT chk_propostas_prazo
        CHECK (prazo_dias > 0),

    CONSTRAINT chk_propostas_status
        CHECK (status IN ('ENVIADA', 'EM_ANALISE', 'SELECIONADA', 'RECUSADA')),

    CONSTRAINT chk_propostas_valor
        CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
