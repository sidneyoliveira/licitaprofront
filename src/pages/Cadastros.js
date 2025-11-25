// frontend/src/pages/Cadastros.js
import React, { useEffect, useMemo, useState } from "react";
import useAxios from "../api/config";
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";

/* 
  Observações:
  - Esta tela mantém sua estrutura, apenas acrescentando o campo genérico `codigo_unidade` no cadastro de Órgãos.
  - Endpoints usados: /entidades/, /orgaos/
  - Usa o hook useAxios (autenticado) que você já tem no projeto.
*/

// ==============================
// Helpers genéricos de UI
// ==============================
const Title = ({ children }) => (
  <h1 className="text-2xl font-semibold tracking-tight mb-4">{children}</h1>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, children }) => (
  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
    <h2 className="text-base font-semibold">{title}</h2>
    {children}
  </div>
);

const CardBody = ({ children }) => <div className="p-4">{children}</div>;

const Button = ({ children, variant = "primary", icon: Icon, ...props }) => {
  const base =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:focus:ring-offset-zinc-900",
    ghost:
      "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-offset-zinc-900",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:focus:ring-offset-zinc-900",
    subtle:
      "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-offset-zinc-900",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
  />
);

const Label = ({ children }) => (
  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{children}</label>
);

const Empty = ({ children }) => (
  <div className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">{children}</div>
);

// ==============================
// Formulários
// ==============================

/**
 * ENTIDADE
 */
const FormEntidade = ({ initialData, onClose, onSaved }) => {
  const api = useAxios();
  const [formData, setFormData] = useState(
    initialData || { nome: "", cnpj: "", ano: new Date().getFullYear() }
  );
  const isEditing = Boolean(initialData?.id);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/entidades/${initialData.id}/`, formData);
      } else {
        await api.post(`/entidades/`, formData);
      }
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <Label>Nome da Entidade</Label>
        <Input name="nome" value={formData.nome} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>CNPJ</Label>
          <Input name="cnpj" value={formData.cnpj || ""} onChange={handleChange} />
        </div>
        <div>
          <Label>Ano de Exercício</Label>
          <Input
            type="number"
            name="ano"
            value={formData.ano}
            onChange={handleChange}
            min="2000"
            max="2100"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" icon={XIcon} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {saving ? "Salvando..." : isEditing ? "Atualizar Entidade" : "Salvar Entidade"}
        </Button>
      </div>
    </form>
  );
};

/**
 * ÓRGÃO (com campo genérico `codigo_unidade`)
 * - Este campo atende ao requisito de Unidade Compradora para publicação no PNCP.
 */
const FormOrgao = ({ entidades, initialData, onClose, onSaved }) => {
  const api = useAxios();
  const [formData, setFormData] = useState(
    initialData || { nome: "", entidade: "", codigo_unidade: "" }
  );
  const isEditing = Boolean(initialData?.id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData || { nome: "", entidade: "", codigo_unidade: "" });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/orgaos/${initialData.id}/`, formData);
      } else {
        await api.post(`/orgaos/`, formData);
      }
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <Label>Entidade</Label>
        <Select
          name="entidade"
          value={formData.entidade || ""}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {entidades.map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.nome}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Nome do Órgão</Label>
        <Input name="nome" value={formData.nome} onChange={handleChange} required />
      </div>

      <div>
        <Label>Código da Unidade</Label>
        <Input
          name="codigo_unidade"
          value={formData.codigo_unidade || ""}
          onChange={handleChange}
          placeholder="ex.: 1010"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" icon={XIcon} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {saving ? "Salvando..." : isEditing ? "Atualizar Órgão" : "Salvar Órgão"}
        </Button>
      </div>
    </form>
  );
};

// ==============================
// Listagens
// ==============================

const Tabela = ({ columns = [], data = [], emptyText = "Sem registros." }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-600 dark:text-zinc-300">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-3 py-6" colSpan={columns.length}>
                <Empty>{emptyText}</Empty>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-t border-zinc-100 dark:border-zinc-800">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 align-top">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ==============================
// Página principal
// ==============================

const Cadastros = () => {
  const api = useAxios();
  const [activeTab, setActiveTab] = useState("orgaos"); // 'entidades' | 'orgaos'
  const [loading, setLoading] = useState(false);

  // ENTIDADES
  const [entidades, setEntidades] = useState([]);
  const [searchEnt, setSearchEnt] = useState("");
  const filteredEntidades = useMemo(() => {
    const term = searchEnt.trim().toLowerCase();
    if (!term) return entidades;
    return entidades.filter(
      (e) =>
        e.nome?.toLowerCase().includes(term) ||
        e.cnpj?.toLowerCase().includes(term) ||
        String(e.ano || "").includes(term)
    );
  }, [entidades, searchEnt]);

  const [editingEntidade, setEditingEntidade] = useState(null);
  const [showEntModal, setShowEntModal] = useState(false);

  // ÓRGÃOS
  const [orgaos, setOrgaos] = useState([]);
  const [searchOrg, setSearchOrg] = useState("");
  const filteredOrgaos = useMemo(() => {
    const term = searchOrg.trim().toLowerCase();
    if (!term) return orgaos;
    return orgaos.filter(
      (o) =>
        o.nome?.toLowerCase().includes(term) ||
        o.codigo_unidade?.toLowerCase().includes(term) ||
        o.entidade_nome?.toLowerCase().includes(term)
    );
  }, [orgaos, searchOrg]);

  const [editingOrgao, setEditingOrgao] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rEnt, rOrg] = await Promise.all([api.get("/entidades/"), api.get("/orgaos/")]);
      setEntidades(rEnt.data || []);
      // enriquecer orgaos com nome da entidade pra facilitar filtro/exibição
      const entsById = new Map((rEnt.data || []).map((e) => [e.id, e]));
      const orgs = (rOrg.data || []).map((o) => ({
        ...o,
        entidade_nome: entsById.get(o.entidade)?.nome || "",
      }));
      setOrgaos(orgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD ENTIDADES
  const openEntidadeCreate = () => {
    setEditingEntidade(null);
    setShowEntModal(true);
  };
  const openEntidadeEdit = (row) => {
    setEditingEntidade(row);
    setShowEntModal(true);
  };
  const deleteEntidade = async (row) => {
    if (!window.confirm(`Excluir a entidade "${row.nome}"?`)) return;
    await api.delete(`/entidades/${row.id}/`);
    await loadAll();
  };

  // CRUD ÓRGÃOS
  const openOrgaoCreate = () => {
    setEditingOrgao(null);
    setShowOrgModal(true);
  };
  const openOrgaoEdit = (row) => {
    setEditingOrgao(row);
    setShowOrgModal(true);
  };
  const deleteOrgao = async (row) => {
    if (!window.confirm(`Excluir o órgão "${row.nome}"?`)) return;
    await api.delete(`/orgaos/${row.id}/`);
    await loadAll();
  };

  // Colunas
  const colsEntidades = [
    { key: "nome", header: "Entidade" },
    { key: "cnpj", header: "CNPJ" },
    { key: "ano", header: "Ano" },
    {
      key: "acoes",
      header: "Ações",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="subtle" icon={PencilIcon} onClick={() => openEntidadeEdit(row)}>
            Editar
          </Button>
          <Button variant="danger" icon={Trash2Icon} onClick={() => deleteEntidade(row)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  const colsOrgaos = [
    { key: "nome", header: "Órgão" },
    {
      key: "entidade_nome",
      header: "Entidade",
      render: (row) => <span className="text-zinc-700 dark:text-zinc-300">{row.entidade_nome}</span>,
    },
    {
      key: "codigo_unidade",
      header: "Código da Unidade",
      render: (row) => row.codigo_unidade || <span className="text-zinc-400">—</span>,
    },
    {
      key: "acoes",
      header: "Ações",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="subtle" icon={PencilIcon} onClick={() => openOrgaoEdit(row)}>
            Editar
          </Button>
          <Button variant="danger" icon={Trash2Icon} onClick={() => deleteOrgao(row)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Title>Cadastros</Title>

      {/* Tabs simples */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={activeTab === "entidades" ? "primary" : "subtle"}
          onClick={() => setActiveTab("entidades")}
        >
          Entidades
        </Button>
        <Button
          variant={activeTab === "orgaos" ? "primary" : "subtle"}
          onClick={() => setActiveTab("orgaos")}
        >
          Órgãos
        </Button>
      </div>

      {/* Conteúdo */}
      {activeTab === "entidades" && (
        <Card>
          <CardHeader
            title="Entidades"
            children={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2 top-2.5 text-zinc-400" size={16} />
                  <Input
                    placeholder="Buscar por nome, CNPJ ou ano..."
                    className="pl-8 w-64"
                    value={searchEnt}
                    onChange={(e) => setSearchEnt(e.target.value)}
                  />
                </div>
                <Button icon={PlusIcon} onClick={openEntidadeCreate}>
                  Nova Entidade
                </Button>
              </div>
            }
          />
          <CardBody>
            {loading ? (
              <Empty>Carregando...</Empty>
            ) : (
              <Tabela columns={colsEntidades} data={filteredEntidades} emptyText="Nenhuma entidade cadastrada." />
            )}
          </CardBody>

          {/* Modal simples (inline) */}
          {showEntModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="w-full max-w-xl">
                <Card>
                  <CardHeader
                    title={editingEntidade ? "Editar Entidade" : "Nova Entidade"}
                    children={
                      <Button variant="ghost" icon={XIcon} onClick={() => setShowEntModal(false)} />
                    }
                  />
                  <CardBody>
                    <FormEntidade
                      initialData={editingEntidade}
                      onClose={() => setShowEntModal(false)}
                      onSaved={loadAll}
                    />
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === "orgaos" && (
        <Card>
          <CardHeader
            title="Órgãos"
            children={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2 top-2.5 text-zinc-400" size={16} />
                  <Input
                    placeholder="Buscar por nome, entidade ou código da unidade..."
                    className="pl-8 w-80"
                    value={searchOrg}
                    onChange={(e) => setSearchOrg(e.target.value)}
                  />
                </div>
                <Button icon={PlusIcon} onClick={openOrgaoCreate}>
                  Novo Órgão
                </Button>
              </div>
            }
          />
          <CardBody>
            {loading ? (
              <Empty>Carregando...</Empty>
            ) : (
              <Tabela columns={colsOrgaos} data={filteredOrgaos} emptyText="Nenhum órgão cadastrado." />
            )}
          </CardBody>

          {/* Modal simples (inline) */}
          {showOrgModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="w-full max-w-xl">
                <Card>
                  <CardHeader
                    title={editingOrgao ? "Editar Órgão" : "Novo Órgão"}
                    children={<Button variant="ghost" icon={XIcon} onClick={() => setShowOrgModal(false)} />}
                  />
                  <CardBody>
                    <FormOrgao
                      entidades={entidades}
                      initialData={editingOrgao}
                      onClose={() => setShowOrgModal(false)}
                      onSaved={loadAll}
                    />
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Cadastros;
