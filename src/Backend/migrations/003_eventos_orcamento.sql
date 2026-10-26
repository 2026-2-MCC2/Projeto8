-- ============================================================
-- Migração 003 - Orçamento previsto do evento (opcional)
-- Rodar UMA vez, depois da 001 e da 002.
--
-- A tela de Eventos do administrador mostra o orçamento previsto
-- quando ele existe. A coluna é opcional (NULL = não informado),
-- então nada que já funciona é afetado.
-- ============================================================
USE trocaticket;

ALTER TABLE eventos
  ADD COLUMN orcamento_previsto DECIMAL(12, 2) NULL,
  ADD CONSTRAINT chk_eventos_orcamento
    CHECK (orcamento_previsto IS NULL OR orcamento_previsto >= 0);