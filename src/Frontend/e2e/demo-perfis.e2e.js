// Teste ponta a ponta (Playwright) do modo demonstração dos três perfis.
//
// Pré-requisitos (cada um em um terminal):
//   1. cd src/Backend  && npm start          (porta 3000; o demo não precisa de MySQL)
//   2. cd src/Frontend && npm run dev        (porta 5173)
//   3. Playwright instalado: npm i -g playwright && npx playwright install chromium
// Execução:
//   NODE_PATH=$(npm root -g) node e2e/demo-perfis.e2e.js ./e2e-resultados
// Os screenshots são gravados na pasta informada (subpasta "shots", criada se não existir).
const fs = require("node:fs");
const { chromium } = require("playwright");
const S = process.argv[2] || "./e2e-resultados";
fs.mkdirSync(`${S}/shots`, { recursive: true });
const BASE = "http://localhost:5173";
const resultados = [];
const problemas = [];

function ok(nome, cond, extra = "") {
  resultados.push({ nome, ok: !!cond, extra });
  console.log(`${cond ? "PASS" : "FAIL"}  ${nome}${extra ? "  -> " + extra : ""}`);
}

async function novoContexto(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 850 }, ...opts });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => problemas.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") problemas.push(`console: ${m.text()}`); });
  page.on("response", (r) => {
    if (r.url().includes(":3000") && r.status() >= 400) problemas.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`);
  });
  page.on("dialog", (d) => d.accept());
  return { ctx, page };
}

async function textoVisivel(page, regex, timeout = 6000) {
  try { await page.getByText(regex).first().waitFor({ state: "visible", timeout }); return true; } catch { return false; }
}

async function entrarDemo(page, rotulo) {
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: new RegExp(rotulo) }).click();
}

(async () => {
  const browser = await chromium.launch();

  // ---------------- ORGANIZADOR ----------------
  {
    const { ctx, page } = await novoContexto(browser);
    await entrarDemo(page, "Organizador");
    await page.waitForURL("**/dashboard");
    ok("ORG: redireciona ao dashboard", page.url().endsWith("/dashboard"));
    ok("ORG: selo de demonstração visível", await textoVisivel(page, /Modo demonstração/));
    ok("ORG: evento semeado no dashboard", await textoVisivel(page, /Festival Universitário de Outono/));
    await page.screenshot({ path: `${S}/shots/org-dashboard.png` });

    await page.goto(`${BASE}/meus-eventos`);
    ok("ORG: lista meus eventos", await textoVisivel(page, /Tech Summit 2026/));

    await page.goto(`${BASE}/criar-evento`);
    await page.fill("#nome", "Evento criado no E2E");
    await page.fill("#descricao", "Teste ponta a ponta");
    await page.fill("#data-evento", "2030-08-15");
    await page.fill("#horario", "18:30");
    await page.fill("#local", "Local do E2E");
    await page.fill("#publico-min", "50");
    await page.fill("#publico-max", "200");
    await page.getByRole("button", { name: /Criar|Salvar|Cadastrar/ }).click();
    await page.waitForTimeout(1200);
    await page.goto(`${BASE}/meus-eventos`);
    ok("ORG: evento criado aparece na listagem", await textoVisivel(page, /Evento criado no E2E/));
    await page.screenshot({ path: `${S}/shots/org-eventos.png` });

    for (const [rota, regex, nome] of [
      ["/buscar-servicos", /Pulse Eventos/, "buscar serviços"],
      ["/buscar-servicos/1", /Pulse Eventos/, "detalhe de serviço"],
      ["/cotacoes", /Pulse Eventos|Lumi Decor/, "cotações"],
      ["/cotacoes/comparar", /Lumi Decor|SoundWave/, "comparar propostas"],
      ["/resumo-custos", /R\$/, "resumo de custos"],
      ["/calculo-ticket", /ticket/i, "cálculo do ticket"],
      ["/minha-conta", /Configurações da conta/, "minha conta"],
    ]) {
      await page.goto(`${BASE}${rota}`);
      ok(`ORG: ${nome}`, await textoVisivel(page, regex));
    }
    await page.screenshot({ path: `${S}/shots/org-conta.png` });

    // acesso cruzado: organizador não entra nas áreas dos outros perfis
    await page.goto(`${BASE}/admin/dashboard`);
    await page.waitForURL("**/login");
    ok("ORG: bloqueado em /admin (volta ao login)", page.url().includes("/login"));
    await ctx.close();
  }

  // ---------------- FORNECEDOR ----------------
  {
    const { ctx, page } = await novoContexto(browser);
    await entrarDemo(page, "Fornecedor");
    await page.waitForURL("**/fornecedor/dashboard");
    ok("FORN: redireciona ao dashboard", true);
    ok("FORN: selo de demonstração visível", await textoVisivel(page, /Modo demonstração/));
    ok("FORN: dashboard carrega dados", await textoVisivel(page, /Feira Gastronômica de Verão|Show de Aniversário/));
    await page.screenshot({ path: `${S}/shots/forn-dashboard.png` });

    await page.goto(`${BASE}/fornecedor/servicos`);
    ok("FORN: lista meus serviços", await textoVisivel(page, /DJ \+ curadoria musical/));

    await page.goto(`${BASE}/fornecedor/servicos/novo`);
    await page.fill('input[name="nome"]', "Cabine fotográfica 360");
    await page.selectOption('select[name="categoria"]', "FOTOGRAFIA");
    await page.fill('textarea[name="descricao"]', "Cabine 360 graus com impressão");
    await page.fill('input[name="preco"]', "1500");
    await page.fill('input[name="publico_min"]', "20");
    await page.fill('input[name="publico_max"]', "400");
    await page.locator('form button[type="submit"]').click();
    ok("FORN: cadastra serviço", await textoVisivel(page, /Cabine fotográfica 360/));

    // editar
    await page.getByText("Cabine fotográfica 360").first().waitFor();
    const linkEditar = page.locator("a, button").filter({ hasText: /Editar/ }).first();
    await linkEditar.click();
    await page.waitForURL(/\/editar$/);
    await page.fill('input[name="preco"]', "1800");
    await page.locator('form button[type="submit"]').click();
    ok("FORN: edita serviço", await textoVisivel(page, /1\.800/));
    await page.screenshot({ path: `${S}/shots/forn-servicos.png` });

    // excluir (primeiro da lista = o mais novo, sem propostas)
    await page.locator("button").filter({ hasText: /Excluir/ }).first().click();
    await page.waitForTimeout(800);
    ok("FORN: exclui serviço", !(await page.getByText("Cabine fotográfica 360").count()));

    await page.goto(`${BASE}/fornecedor/oportunidades`);
    ok("FORN: lista oportunidades", await textoVisivel(page, /Feira Gastronômica de Verão/));
    await page.getByText("Festival Universitário de Outono").first().click().catch(() => {});
    await page.goto(`${BASE}/fornecedor/oportunidades/4`);
    ok("FORN: detalhe da oportunidade", await textoVisivel(page, /Enviar proposta/));
    // evento 4 já tem proposta do DJ; usa o evento 2 (Tech Summit)
    await page.goto(`${BASE}/fornecedor/oportunidades/2`);
    await page.waitForSelector('select[name="id_servico"]');
    const opcoes = await page.locator('select[name="id_servico"] option').allTextContents();
    await page.selectOption('select[name="id_servico"]', { index: opcoes.length > 1 ? 1 : 0 });
    await page.fill('input[name="valor"]', "2750");
    await page.fill('input[name="prazo_dias"]', "6");
    await page.fill('textarea[name="observacao"]', "Proposta E2E");
    await page.getByRole("button", { name: /Enviar proposta/ }).click();
    await page.goto(`${BASE}/fornecedor/propostas`);
    ok("FORN: proposta enviada aparece em Minhas propostas", await textoVisivel(page, /Tech Summit 2026/));
    await page.screenshot({ path: `${S}/shots/forn-propostas.png` });
    const antes = await page.getByText("Tech Summit 2026").count();
    await page.locator("button").filter({ hasText: /^Retirar$/ }).first().click();
    await page.waitForTimeout(800);
    ok("FORN: retira proposta", (await page.getByText("Tech Summit 2026").count()) < antes);

    await page.goto(`${BASE}/fornecedor/minha-conta`);
    ok("FORN: minha conta carrega perfil", await textoVisivel(page, /Pulse Eventos/));
    await page.screenshot({ path: `${S}/shots/forn-conta.png` });

    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL("**/login");
    ok("FORN: bloqueado nas rotas do organizador", true);
    await ctx.close();
  }

  // ---------------- ADMINISTRADOR ----------------
  {
    const { ctx, page } = await novoContexto(browser);
    await entrarDemo(page, "Administrador");
    await page.waitForURL("**/admin/dashboard");
    ok("ADM: redireciona ao dashboard", true);
    ok("ADM: selo de demonstração visível", await textoVisivel(page, /Modo demonstração/));
    ok("ADM: indicadores carregam", await textoVisivel(page, /aguardando aprovação|Fornecedor aprovado/));
    await page.screenshot({ path: `${S}/shots/adm-dashboard.png` });

    await page.goto(`${BASE}/admin/aprovacoes`);
    ok("ADM: lista cadastros pendentes", await textoVisivel(page, /Click Moments/));
    await page.screenshot({ path: `${S}/shots/adm-aprovacoes.png` });
    const linhas = await page.locator("tbody tr").count();
    await page.locator("tbody tr").filter({ hasText: "Click Moments" }).getByRole("button", { name: /Aprovar/ }).click();
    await page.waitForTimeout(1000);
    ok("ADM: aprovar remove da fila de pendentes", (await page.locator("tbody tr").count()) < linhas);

    await page.locator("tbody tr").filter({ hasText: "Sabor & Arte" }).getByRole("button", { name: /Rejeitar/ }).click();
    await page.getByRole("button", { name: /Confirmar rejeição/ }).click();
    ok("ADM: rejeição sem motivo é bloqueada pela tela", await textoVisivel(page, /Selecione um motivo/));
    await page.locator("select").last().selectOption("Documentação incompleta");
    await page.locator("textarea").fill("Faltou o contrato social");
    await page.getByRole("button", { name: /Confirmar rejeição/ }).click();
    await page.waitForTimeout(1000);
    ok("ADM: rejeição concluída (fora da fila)", !(await page.locator("tbody tr").filter({ hasText: "Sabor & Arte" }).count()));

    await page.goto(`${BASE}/admin/usuarios`);
    ok("ADM: lista usuários", await textoVisivel(page, /Rafael Teixeira|Lumi Decor/));
    ok("ADM: aprovação persistiu na sessão", await textoVisivel(page, /Click Moments/));
    await page.screenshot({ path: `${S}/shots/adm-usuarios.png` });

    await page.goto(`${BASE}/admin/eventos`);
    ok("ADM: lista eventos com propostas", await textoVisivel(page, /Feira Gastronômica de Verão/));
    await page.screenshot({ path: `${S}/shots/adm-eventos.png` });
    await page.goto(`${BASE}/admin/relatorios`);
    ok("ADM: relatórios", await textoVisivel(page, /Relatórios/));
    await page.screenshot({ path: `${S}/shots/adm-relatorios.png` });
    await page.goto(`${BASE}/admin/minha-conta`);
    ok("ADM: minha conta", await textoVisivel(page, /Administrador Demonstração|Configurações/));

    // logout encerra a sessão
    const token = await page.evaluate(() => sessionStorage.getItem("token"));
    await page.getByRole("button", { name: /Sair/ }).first().click();
    await page.waitForURL("**/login");
    const guardado = await page.evaluate(() => sessionStorage.getItem("token"));
    ok("ADM: logout limpa a sessão local", guardado === null);
    const r = await fetch("http://localhost:3000/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
    ok("ADM: token invalidado no servidor após logout", r.status === 401, `status ${r.status}`);
    await ctx.close();
  }

  // ---------------- EXPIRAÇÃO / TOKEN INVÁLIDO ----------------
  {
    const { ctx, page } = await novoContexto(browser);
    await entrarDemo(page, "Organizador");
    await page.waitForURL("**/dashboard");
    await page.evaluate(() => sessionStorage.setItem("token", "token.invalido.aqui"));
    await page.goto(`${BASE}/meus-eventos`);
    await page.waitForURL(/\/login\?sessao=expirada/, { timeout: 8000 }).catch(() => {});
    ok("EXP: token inválido leva ao login com aviso", page.url().includes("sessao=expirada"));
    ok("EXP: mensagem de sessão expirada", await textoVisivel(page, /sessão expirou/i));
    await ctx.close();
  }

  // ---------------- LOGIN NORMAL COM CREDENCIAL INVÁLIDA ----------------
  {
    const { ctx, page } = await novoContexto(browser);
    await page.goto(`${BASE}/login`);
    await page.fill("#email", "nao@existe.com");
    await page.fill("#senha", "123456");
    await page.getByRole("button", { name: /^Entrar/ }).click();
    ok("LOGIN: erro de credencial não redireciona nem derruba a tela", await textoVisivel(page, /inválid|não aprovado|Erro/i) && page.url().includes("/login"));
    await ctx.close();
  }

  // ---------------- MOBILE ----------------
  {
    const { ctx, page } = await novoContexto(browser, { viewport: { width: 390, height: 800 } });
    await page.goto(`${BASE}/login`);
    await page.screenshot({ path: `${S}/shots/mobile-login.png`, fullPage: true });
    const rolagem = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    ok("MOBILE: login sem rolagem horizontal", !rolagem);
    await page.getByRole("button", { name: /Fornecedor/ }).click();
    await page.waitForURL("**/fornecedor/dashboard");
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${S}/shots/mobile-forn.png` });
    const r2 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    ok("MOBILE: dashboard do fornecedor sem rolagem horizontal", !r2);
    await ctx.close();
  }

  await browser.close();
  const falhas = resultados.filter((r) => !r.ok);
  console.log(`\nTOTAL ${resultados.length} | PASS ${resultados.length - falhas.length} | FAIL ${falhas.length}`);
  const unicos = [...new Set(problemas)];
  console.log(`\nPROBLEMAS OBSERVADOS (${unicos.length}):`); unicos.forEach((p) => console.log(" - " + p));
})();
