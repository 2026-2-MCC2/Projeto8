CREATE DATABASE trocaticket;
USE trocaticket;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(250) NOT NULL ,
    telefone VARCHAR(30) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK(
        tipo IN('FONECEDOR', 'ORGANIZADOR', 'ADMINISTRADOR')
        ),
    status VARCHAR(20) NOT NULL CHECK (status IN ('APROVADO', 'PENDENTE', 'REJEITADO'))
);
CREATE TABLE organizadores (
    id_usuario INT PRIMARY KEY,
    tipo_pessoa VARCHAR(20) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
    documento VARCHAR(20) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
CREATE TABLE fornecedores (
    id_usuario INT PRIMARY KEY,
    CNPJ VARCHAR(40) NOT NULL UNIQUE,
    categoria_atuacao VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_organizador INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    horario TIME NOT NULL,
    data_evento DATE NOT NULL,
    publico_min INT NOT NULL,
    publico_max INT NOT NULL,
    local VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('CONFIRMADO', 'CANCELADO', 'PLANEJAMENTO')),
    FOREIGN KEY (id_organizador) REFERENCES organizadores(id_usuario),
    CHECK (publico_min < publico_max)
);
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_usuario)
);
CREATE TABLE precos_servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_servico INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    publico_min INT NOT NULL,
    publico_max INT NOT NULL,
    FOREIGN KEY (id_servico) REFERENCES servicos(id),
    CHECK (publico_min < publico_max)
);
CREATE TABLE eventos_servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_servico INT NOT NULL,
    id_evento INT NOT NULL,
    preco_aplicado DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES eventos(id),
    FOREIGN KEY (id_servico) REFERENCES servicos(id), 
    UNIQUE (id_evento, id_servico)
);