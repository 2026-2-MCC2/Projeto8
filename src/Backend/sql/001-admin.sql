-- ============================================================
-- Migração 001 - Área do administrador (cadastros)
-- Rodar UMA vez, depois do schema.sql.
-- ============================================================
USE trocaticket;

-- Dados que a tela de Aprovações e a de Usuários precisam.
ALTER TABLE usuarios
  ADD COLUMN criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN cidade VARCHAR(100) NULL,
  ADD COLUMN estado CHAR(2) NULL,
  ADD COLUMN analisado_por INT NULL,
  ADD COLUMN data_analise DATETIME NULL,
  ADD COLUMN motivo_rejeicao VARCHAR(500) NULL,
  ADD CONSTRAINT fk_usuarios_analisado_por
    FOREIGN KEY (analisado_por) REFERENCES usuarios (id);

-- Campos opcionais do perfil do fornecedor.
ALTER TABLE fornecedores
  ADD COLUMN razao_social VARCHAR(200) NULL,
  ADD COLUMN regiao_atendimento VARCHAR(200) NULL,
  ADD COLUMN descricao TEXT NULL,
  ADD COLUMN site VARCHAR(255) NULL;