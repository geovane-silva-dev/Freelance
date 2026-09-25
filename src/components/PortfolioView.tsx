import React, { useState, useMemo } from 'react';
import {
  Globe,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Star,
  Award,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PortfolioItem } from '../types/index.ts';
import { PortfolioModal } from './PortfolioModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';

export const PortfolioView: React.FC = () => {
  const { data, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } = useApp();

  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PortfolioItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

  // Available niches
  const niches = useMemo(() => {
    const list = new Set(data.portfolio.map((p) => p.niche).filter(Boolean));
    return Array.from(list);
  }, [data.portfolio]);

  const filteredItems = useMemo(() => {
    return data.portfolio.filter((item) => {
      const title = item.title || item.siteName || '';
      const client = item.client || item.clientName || '';
      const niche = item.niche || '';
      const tags = item.tags || item.technologies || [];

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        client.toLowerCase().includes(search.toLowerCase()) ||
        niche.toLowerCase().includes(search.toLowerCase()) ||
        tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesNiche = nicheFilter === 'all' || item.niche === nicheFilter;
      return matchesSearch && matchesNiche;
    });
  }, [data.portfolio, search, nicheFilter]);

  const handleSave = async (itemData: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    if (itemToEdit) {
      await updatePortfolioItem(itemToEdit.id, itemData);
      setItemToEdit(null);
    } else {
      await addPortfolioItem(itemData);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deletePortfolioItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Meu Portfólio de Projetos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize seus melhores trabalhos, mostre resultados comprovados e compartilhe com potenciais clientes.
          </p>
        </div>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar ao Portfólio
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por título, cliente, nicho ou tag..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todos os Nichos ({data.portfolio.length})</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum projeto cadastrado no portfólio</h3>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre seus sites finalizados com imagem, resultados e depoimento de clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Cover Image */}
              <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                {item.imageUrl || item.coverImage ? (
                  <img
                    src={item.imageUrl || item.coverImage}
                    alt={item.title || item.siteName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Globe className="w-8 h-8 opacity-40" />
                  </div>
                )}
                {item.niche && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                    {item.niche}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.title || item.siteName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cliente: {item.client || item.clientName}
                  </p>

                  {/* Results badge */}
                  {item.results && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-800">
                          Resultado Comprovado
                        </span>
                        <p className="text-xs leading-snug">{item.results}</p>
                      </div>
                    </div>
                  )}

                  {/* Testimonial */}
                  {item.testimonial && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs italic">
                      &ldquo;{item.testimonial}&rdquo;
                    </div>
                  )}

                  {/* Before / After note */}
                  {item.beforeAfterNote && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      <strong className="text-slate-700">Antes & Depois:</strong> {item.beforeAfterNote}
                    </p>
                  )}

                  {/* Tags */}
                  {(item.tags || item.technologies) && (item.tags || item.technologies)!.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(item.tags || item.technologies || []).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  {item.liveUrl || item.publishedUrl ? (
                    <a
                      href={item.liveUrl || item.publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visitar Site
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Sem link público</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setItemToEdit(item);
                        setIsCreateOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PortfolioModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSave}
        itemToEdit={itemToEdit}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Excluir Item do Portfólio"
        message={`Deseja realmente remover "${itemToDelete?.title || itemToDelete?.siteName}" do seu portfólio?`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
