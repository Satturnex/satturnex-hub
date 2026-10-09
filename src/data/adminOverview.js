// Frontend-only control-center catalog. Replace this adapter with an authenticated API service when available.
export const adminOverview = {
  demo: true,
  systems: [
    { name: "API", state: "Aguardando integração" },
    { name: "Banco de dados", state: "Aguardando integração" },
    { name: "Autenticação", state: "Protótipo local" },
    { name: "Armazenamento", state: "Aguardando integração" },
    { name: "Frontend", state: "Disponível" },
    { name: "Serviços", state: "Aguardando integração" },
  ],
};
