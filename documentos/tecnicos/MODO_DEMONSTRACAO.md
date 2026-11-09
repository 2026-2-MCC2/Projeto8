\# Modo Demonstração



\## 1. Objetivo



O Modo Demonstração permite explorar o TicketLab com três perfis fictícios: Organizador, Fornecedor e Administrador.



As operações utilizam dados mantidos em memória, sem persistência no MySQL.



\## 2. Arquitetura



A implementação está em `src/Backend/demo/`:



\- `index.js`: autenticação, controle de acesso e montagem das rotas.

\- `sessoes.js`: criação, validação, expiração e encerramento das sessões.

\- `dados.js`: usuários e dados fictícios.

\- `rotasOrganizador.js`: operações do Organizador.

\- `rotasFornecedor.js`: operações do Fornecedor.

\- `rotasAdmin.js`: operações do Administrador.



Cada sessão recebe uma cópia independente dos dados fictícios. Os tokens demo utilizam um segredo aleatório, diferente do segredo JWT da autenticação real.



O módulo demo é montado no `server.js` antes das rotas reais de Organizador, Fornecedor e Administrador.



\### Observação sobre o catálogo



A rota `/catalogo` é montada antes do módulo demo e utiliza autenticação real e consultas ao MySQL. Tokens demo não são válidos nessa rota. Portanto, o catálogo não está disponível no Modo Demonstração.



\## 3. Acesso



\### Criar sessão



\*\*Método:\*\* POST  

\*\*Endpoint:\*\* `/demo-login`



O campo `tipo` aceita ORGANIZADOR, FORNECEDOR ou ADMINISTRADOR.



Exemplo de corpo da requisição:



&#x20;   {

&#x20;     "tipo": "ORGANIZADOR"

&#x20;   }



A resposta contém o token e os dados do usuário fictício.



Para autenticar as demais requisições, utilizar o cabeçalho Authorization com o formato Bearer TOKEN.



\### Encerrar sessão



\*\*Método:\*\* POST  

\*\*Endpoint:\*\* `/demo-logout`



Encerra a sessão associada ao token utilizado.



\## 4. Duração e limites



\- Duração de cada sessão: duas horas.

\- Máximo de 200 sessões simultâneas.

\- Ao atingir o limite, a sessão mais antiga é descartada.

\- Limite de 30 tentativas de criação de sessão por IP em uma janela de um minuto.

\- Reiniciar o backend invalida todas as sessões.

\- Os dados são descartados quando a sessão termina ou expira.



\## 5. Funcionalidades por perfil



\### 5.1 Organizador



| Método | Endpoint | Operação |

|---|---|---|

| GET | `/eventos` | Listar eventos da sessão |

| POST | `/eventos` | Criar evento |

| PATCH | `/usuarios/:id` | Atualizar nome, e-mail e telefone da própria conta |



A atualização de conta não permite alterar senha.



\### 5.2 Fornecedor



| Método | Endpoint | Operação |

|---|---|---|

| GET | `/fornecedor/perfil` | Consultar perfil |

| PATCH | `/fornecedor/perfil` | Atualizar perfil |

| GET | `/fornecedor/dashboard` | Consultar indicadores e oportunidades recentes |

| GET | `/fornecedor/servicos` | Listar serviços próprios |

| POST | `/fornecedor/servicos` | Cadastrar serviço |

| GET | `/fornecedor/servicos/:id` | Consultar serviço próprio |

| PUT | `/fornecedor/servicos/:id` | Atualizar serviço |

| DELETE | `/fornecedor/servicos/:id` | Excluir serviço, quando permitido |

| GET | `/fornecedor/oportunidades` | Consultar oportunidades |

| GET | `/fornecedor/oportunidades/:id` | Consultar oportunidade |

| GET | `/fornecedor/propostas` | Listar propostas próprias |

| POST | `/fornecedor/propostas` | Enviar proposta |

| GET | `/fornecedor/propostas/:id` | Consultar proposta própria |

| DELETE | `/fornecedor/propostas/:id` | Retirar proposta, quando permitido |



Serviços vinculados a propostas não podem ser excluídos. Propostas já analisadas não podem ser retiradas. A troca de senha não está disponível.



\### 5.3 Administrador



| Método | Endpoint | Operação |

|---|---|---|

| GET | `/admin/cadastros` | Listar cadastros |

| PATCH | `/admin/cadastros/:id/status` | Aprovar, rejeitar ou reabrir cadastro |

| GET | `/admin/dashboard` | Consultar indicadores e atividades |

| GET | `/admin/eventos` | Consultar eventos e propostas |

| GET | `/admin/relatorios` | Consultar relatórios |



A rejeição exige um motivo, limitado a 500 caracteres. As alterações afetam somente os dados fictícios.



\## 6. Dados fictícios



Os dados iniciais incluem usuários, organizadores, fornecedores, eventos, serviços e propostas em diferentes situações.



As datas são geradas relativamente à data atual. Cada sessão recebe sua própria cópia dos dados.



\## 7. Restrições



\- Não há persistência no MySQL.

\- Os dados são descartados ao encerrar ou expirar a sessão.

\- Reiniciar o backend invalida as sessões existentes.

\- O catálogo real não está disponível com token demo.

\- A troca de senha não está disponível.

\- Recursos não implementados nas rotas demo são bloqueados.

\- Cada perfil só pode acessar as operações autorizadas para seu tipo.



\## 8. Arquivos relacionados



\- `src/Backend/demo/`

\- `src/Backend/lib/validacao.js`

\- `src/Backend/server.js`



Este documento descreve o comportamento observado na implementação do backend.

