-- ============================================================
-- Dados de DEMONSTRAÇÃO: eventos, serviços e propostas.
-- Serve só para as telas do administrador terem o que mostrar.
--
-- Pré-requisito: existir pelo menos 1 organizador e 1 fornecedor
-- com cadastro APROVADO (o script usa o primeiro de cada tipo).
-- Pode ser rodado várias vezes: apaga o que ele mesmo criou antes.
-- Tudo que ele cria tem "[DEMO]" na descrição.
-- ============================================================
USE trocaticket;
SET NAMES utf8mb4; -- garante que os acentos sejam gravados corretamente

-- 1) Limpa dados de demonstração anteriores (ordem: filhos antes dos pais)
DELETE FROM propostas
 WHERE id_evento IN (SELECT id FROM eventos WHERE descricao = '[DEMO]');
DELETE FROM eventos_servicos
 WHERE id_evento IN (SELECT id FROM eventos WHERE descricao = '[DEMO]');
DELETE FROM eventos WHERE descricao = '[DEMO]';
DELETE FROM precos_servicos
 WHERE id_servico IN (SELECT id FROM servicos WHERE descricao = '[DEMO]');
DELETE FROM servicos WHERE descricao = '[DEMO]';

-- 2) Quem será o organizador e o fornecedor dos dados de exemplo
SET @organizador = (
  SELECT id FROM usuarios
   WHERE tipo = 'ORGANIZADOR' AND status = 'APROVADO' ORDER BY id LIMIT 1
);
SET @fornecedor = (
  SELECT id FROM usuarios
   WHERE tipo = 'FORNECEDOR' AND status = 'APROVADO' ORDER BY id LIMIT 1
);

-- 3) Serviços do fornecedor
INSERT INTO servicos (id_fornecedor, nome, descricao, categoria) VALUES
  (@fornecedor, 'Buffet completo',   '[DEMO]', 'ALIMENTACAO'),
  (@fornecedor, 'Decoração premium', '[DEMO]', 'DECORACAO'),
  (@fornecedor, 'Banda ao vivo',     '[DEMO]', 'ENTRETENIMENTO');

SET @buffet    = (SELECT id FROM servicos WHERE nome = 'Buffet completo'   AND descricao = '[DEMO]');
SET @decoracao = (SELECT id FROM servicos WHERE nome = 'Decoração premium' AND descricao = '[DEMO]');
SET @banda     = (SELECT id FROM servicos WHERE nome = 'Banda ao vivo'     AND descricao = '[DEMO]');

-- 4) Eventos (o orçamento previsto só existe em alguns, de propósito)
INSERT INTO eventos
  (id_organizador, nome, descricao, local, data_evento, horario,
   publico_min, publico_max, status, orcamento_previsto) VALUES
  (@organizador, 'Casamento Ana & Pedro',   '[DEMO]', 'Espaço Jardim, São Paulo',   '2026-12-05', '18:00:00',  80, 150, 'PLANEJAMENTO', 25000),
  (@organizador, 'Congresso Tech SP 2026',  '[DEMO]', 'Centro de Convenções, SP',   '2026-11-20', '09:00:00', 300, 600, 'CONFIRMADO',   60000),
  (@organizador, 'Formatura Turma 2026',    '[DEMO]', 'Clube Atlético, Campinas',   '2026-10-03', '20:00:00', 100, 220, 'CONFIRMADO',   18000),
  (@organizador, 'Feira de Startups',       '[DEMO]', 'Pavilhão Norte, São Paulo',  '2026-11-08', '10:00:00', 200, 500, 'CANCELADO',    NULL),
  (@organizador, 'Festa de Aniversário',    '[DEMO]', 'Salão de Festas, Santos',    '2027-01-15', '19:00:00',  30,  60, 'PLANEJAMENTO', NULL);

SET @casamento = (SELECT id FROM eventos WHERE nome = 'Casamento Ana & Pedro'  AND descricao = '[DEMO]');
SET @congresso = (SELECT id FROM eventos WHERE nome = 'Congresso Tech SP 2026' AND descricao = '[DEMO]');
SET @formatura = (SELECT id FROM eventos WHERE nome = 'Formatura Turma 2026'   AND descricao = '[DEMO]');
SET @feira     = (SELECT id FROM eventos WHERE nome = 'Feira de Startups'      AND descricao = '[DEMO]');

-- 5) Propostas (status: ENVIADA, EM_ANALISE, SELECIONADA, RECUSADA)
INSERT INTO propostas
  (id_evento, id_servico, id_fornecedor, valor, prazo_dias, status) VALUES
  (@casamento, @buffet,    @fornecedor,  9500, 10, 'SELECIONADA'),
  (@casamento, @decoracao, @fornecedor,  3800,  7, 'ENVIADA'),
  (@casamento, @banda,     @fornecedor,  4200,  5, 'EM_ANALISE'),
  (@congresso, @buffet,    @fornecedor, 14200, 15, 'SELECIONADA'),
  (@congresso, @decoracao, @fornecedor,  8000, 10, 'SELECIONADA'),
  (@formatura, @buffet,    @fornecedor,  7000,  8, 'SELECIONADA'),
  (@formatura, @banda,     @fornecedor,  5500,  6, 'RECUSADA'),
  (@feira,     @decoracao, @fornecedor,  6000,  9, 'ENVIADA');