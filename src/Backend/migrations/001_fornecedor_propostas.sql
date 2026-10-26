-- ============================================================
-- Migration 001 - Módulo do fornecedor
-- Banco: trocaticket  (executar DEPOIS do schema.sql da Entrega 1)
--
-- 1. servicos.status      : permite rascunho x ativo (tela "Meus serviços")
-- 2. propostas            : proposta de um fornecedor para um evento
--
-- Não altera nem remove nenhuma coluna existente.
-- Aplicar:  mysql -u <usuario> -p trocaticket < migrations/001_fornecedor_propostas.sql
-- ============================================================

USE trocaticket;

ALTER TABLE servicos
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  ADD CONSTRAINT chk_servicos_status CHECK (status IN ('ATIVO', 'RASCUNHO'));

CREATE TABLE propostas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_evento INT NOT NULL,
  id_servico INT NOT NULL,
  id_fornecedor INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  prazo_dias INT NOT NULL,
  observacao TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ENVIADA',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_evento) REFERENCES eventos (id),
  FOREIGN KEY (id_servico) REFERENCES servicos (id),
  FOREIGN KEY (id_fornecedor) REFERENCES fornecedores (id_usuario),
  CONSTRAINT chk_propostas_valor CHECK (valor > 0),
  CONSTRAINT chk_propostas_prazo CHECK (prazo_dias > 0),
  CONSTRAINT chk_propostas_status CHECK (
    status IN ('ENVIADA', 'EM_ANALISE', 'SELECIONADA', 'RECUSADA')
  ),
  -- um serviço só pode ter uma proposta por evento
  UNIQUE KEY uq_proposta_evento_servico (id_evento, id_servico),
  INDEX idx_propostas_fornecedor (id_fornecedor, status),
  INDEX idx_propostas_evento (id_evento)
);

-- Rollback (se necessário):
--   DROP TABLE propostas;
--   ALTER TABLE servicos DROP CONSTRAINT chk_servicos_status, DROP COLUMN status;

show tables;

   USE trocaticket;
   SELECT id, nome, status, motivo_rejeicao, analisado_por, data_analise FROM usuarios;
   
	SELECT id, nome, status, analisado_por, data_analise, motivo_rejeicao FROM usuarios;
    
	SELECT tipo, status, COUNT(*) FROM usuarios GROUP BY tipo, status;
   SELECT status, COUNT(*) FROM eventos GROUP BY status;
