import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";

export default function AdminDashboard() {
  return (
    <LayoutAdmin active="dashboard">
      <main className="adm-main">
        <PageHeader
          eyebrow="CENTRAL DE GESTÃO"
          title="Visão geral da plataforma"
          description="Acompanhe o crescimento e as movimentações do TicketLab."
        />

        <section className="adm-stats-grid">
          <StatCard
            label="Usuários cadastrados"
            value="1.248"
            change="14,8% este mês"
            icon="users"
          />
          <StatCard label="Organizadores" value="842" icon="calendar" />
          <StatCard
            label="Fornecedores"
            value="406"
            icon="briefcase"
            tone="orange"
          />
          <StatCard
            label="Eventos ativos"
            value="236"
            change="22 novos"
            icon="trend"
            tone="green"
          />
        </section>
      </main>
    </LayoutAdmin>
  );
}