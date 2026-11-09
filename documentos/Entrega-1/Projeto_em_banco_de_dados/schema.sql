CREATE DATABASE trocaticket;

USE trocaticket;

CREATE TABLE
    usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(250) NOT NULL,
        email VARCHAR(250) UNIQUE NOT NULL,
        telefone VARCHAR(30) NOT NULL,
        senha_hash VARCHAR(250) NOT NULL,
        tipo VARCHAR(50) NOT NULL CHECK (
            tipo IN ('ORGANIZADOR', 'FORNECEDOR', 'ADMINISTRADOR')
        ),
        status VARCHAR(50) NOT NULL CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO'))
    );

CREATE TABLE
    organizadores (
        id_usuario INT PRIMARY KEY,
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id),
        tipo_pessoa VARCHAR(50) NOT NULL CHECK (tipo_pessoa IN ('PJ', 'PF')),
        documento VARCHAR(20) UNIQUE NOT NULL,
        data_nascimento DATE DEFAULT NULL
    );

CREATE TABLE
    fornecedores (
        id_usuario INT PRIMARY KEY,
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id),
        CNPJ VARCHAR(40) NOT NULL UNIQUE,
        categoria_atuacao VARCHAR(255) NOT NULL
    );

CREATE TABLE
    eventos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_organizador INT NOT NULL,
        FOREIGN KEY (id_organizador) REFERENCES organizadores (id_usuario),
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        local VARCHAR(200) NOT NULL,
        data_evento DATE NOT NULL,
        horario TIME NOT NULL,
        publico_min INT NOT NULL,
        publico_max INT NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (
            status IN ('PLANEJAMENTO', 'CONFIRMADO', 'CANCELADO')
        ),
        CHECK (publico_max > publico_min)
    );

CREATE TABLE
    servicos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_fornecedor INT NOT NULL,
        FOREIGN KEY (id_fornecedor) REFERENCES fornecedores (id_usuario),
        nome VARCHAR(200) NOT NULL,
        descricao TEXT NOT NULL,
        categoria VARCHAR(100) NOT NULL
    );

CREATE TABLE
    precos_servicos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_servico INT NOT NULL,
        FOREIGN KEY (id_servico) REFERENCES servicos (id),
        publico_max INT NOT NULL,
        publico_min INT NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        CHECK (publico_max > publico_min)
    );

CREATE TABLE
    eventos_servicos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_evento INT NOT NULL,
        FOREIGN KEY (id_evento) REFERENCES eventos (id),
        id_servico INT NOT NULL,
        FOREIGN KEY (id_servico) REFERENCES servicos (id),
        preco_aplicado DECIMAL(10, 2) NOT NULL,
        UNIQUE (id_evento, id_servico)
    );