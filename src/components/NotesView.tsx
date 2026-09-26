import React, { useState, useMemo } from 'react';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  PinOff,
  Copy,
  Trash2,
  Edit3,
  Check,
  Tag,
  Calendar,
  Sparkles,
  FileText,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PersonalNote } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

type CategoryFilter = 'all' | 'pinned' | 'general' | 'idea' | 'reminder' | 'client' | 'urgent';

const CATEGORY_CONFIG: Record<
  NonNullable<PersonalNote['category']>,
  { label: string; textClass: string; bgClass: string; darkBgClass: string }
> = {
  general: {
    label: 'Geral',
    textClass: 'text-slate-700 dark:text-slate-300',
    bgClass: 'bg-slate-100',
    darkBgClass: 'dark:bg-slate-800',
  },
  idea: {
    label: 'Ideia',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50',
    darkBgClass: 'dark:bg-amber-950/40',
  },
  reminder: {
    label: 'Lembrete',
    textClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50',
    darkBgClass: 'dark:bg-blue-950/40',
  },
  client: {
    label: 'Cliente / Reunião',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50',
    darkBgClass: 'dark:bg-emerald-950/40',
  },
  urgent: {
    label: 'Urgente',
    textClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50',
    darkBgClass: 'dark:bg-rose-950/40',
  },
};

const COLOR_ACCENTS: Record<
  NonNullable<PersonalNote['color']>,
  { border: string; darkBorder: string; banner: string; label: string }
> = {
  indigo: {
    border: 'border-indigo-200 dark:border-indigo-800/60',
    darkBorder: 'dark:border-indigo-800/60',
    banner: 'bg-indigo-500',
    label: 'Índigo',
  },
  slate: {
    border: 'border-slate-200 dark:border-slate-800',
    darkBorder: 'dark:border-slate-800',
    banner: 'bg-slate-500',
    label: 'Neutro',
  },
  amber: {
    border: 'border-amber-200 dark:border-amber-800/60',
    darkBorder: 'dark:border-amber-800/60',
    banner: 'bg-amber-500',
    label: 'Âmbar',
  },
  emerald: {
    border: 'border-emerald-200 dark:border-emerald-800/60',
    darkBorder: 'dark:border-emerald-800/60',
    banner: 'bg-emerald-500',
    label: 'Esmeralda',
  },
  rose: {
    border: 'border-rose-200 dark:border-rose-800/60',
    darkBorder: 'dark:border-rose-800/60',
    banner: 'bg-rose-500',
    label: 'Rosa',
  },
  sky: {
    border: 'border-sky-200 dark:border-sky-800/60',
    darkBorder: 'dark:border-sky-800/60',
    banner: 'bg-sky-500',
    label: 'Azul Céu',
  },
};

export const NotesView: React.FC = () => {
  const {
    data,
    addPersonalNote,
    updatePersonalNote,
    deletePersonalNote,
    togglePinPersonalNote,
    updateScratchpad,
    showToast,
  } = useApp();

  const notes = data.personalNotes || [];
  const scratchpadContent = data.scratchpad || '';

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [activeScratchpad, setActiveScratchpad] = useState(scratchpadContent);
  const [isScratchpadSaved, setIsScratchpadSaved] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: NonNullable<PersonalNote['category']>;
    color: NonNullable<PersonalNote['color']>;
    pinned: boolean;
  }>({
    title: '',
    content: '',
    category: 'general',
    color: 'indigo',
    pinned: false,
  });

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Category filter
        if (categoryFilter === 'pinned' && !note.pinned) return false;
        if (categoryFilter !== 'all' && categoryFilter !== 'pinned' && note.category !== categoryFilter) {
          return false;
        }

        // Search term
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned notes always come first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Sort by updatedAt descending
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [notes, categoryFilter, searchTerm]);

  // Open modal for new note
  const handleOpenNew = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      color: 'indigo',
      pinned: false,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing note
  const handleOpenEdit = (note: PersonalNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || 'general',
      color: note.color || 'indigo',
      pinned: !!note.pinned,
    });
    setIsModalOpen(true);
  };

  // Save note (create or update)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.content.trim()) {
      showToast('Preencha ao menos o título ou conteúdo da observação.', 'error');
      return;
    }

    if (editingNote) {
      await updatePersonalNote(editingNote.id, {
        title: formData.title.trim() || 'Sem título',
        content: formData.content,
        category: formData.category,
        color: formData.color,
        pinned: formData.pinned,
      });
    } else {
      await addPersonalNote({
        title: formData.title.trim() || 'Sem título',
        content: formData.content,
        category: formData.category,
        color: formData.color,
        pinned: formData.pinned,
      });
    }

    setIsModalOpen(false);
  };

  // Copy note content to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Observação copiada para a área de transferência!');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Save scratchpad
  const handleSaveScratchpad = async () => {
    await updateScratchpad(activeScratchpad);
    setIsScratchpadSaved(true);
    showToast('Bloco rápido salvo com sucesso!');
    setTimeout(() => setIsScratchpadSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Observações & Mensagens Pessoais
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {notes.length} {notes.length === 1 ? 'anotação' : 'anotações'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Espaço privado para guardar ideias, lembretes de reuniões, rascunhos de propostas e mensagens para si mesmo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              showScratchpad
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bloco Rápido</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Observação</span>
          </button>
        </div>
      </div>

      {/* Quick Scratchpad collapsible panel */}
      {showScratchpad && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Bloco de Rascunho Imediato
              </h3>
              <span className="text-[10px] text-slate-400">
                (digite livremente e clique em salvar)
              </span>
            </div>
            <button
              onClick={handleSaveScratchpad}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isScratchpadSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Salvar Rascunho
                </>
              )}
            </button>
          </div>
          <textarea
            value={activeScratchpad}
            onChange={(e) => setActiveScratchpad(e.target.value)}
            rows={3}
            placeholder="Anote números de telefone rápidos, ideias instantâneas, links que você viu ou lembretes passageiros..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou conteúdo..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter segmented tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Todas ({notes.length})
          </button>
          <button
            onClick={() => setCategoryFilter('pinned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              categoryFilter === 'pinned'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Pin className="w-3 h-3 text-amber-500" />
            Fixadas ({notes.filter((n) => n.pinned).length})
          </button>
          {(['idea', 'reminder', 'client', 'urgent', 'general'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {CATEGORY_CONFIG[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {searchTerm || categoryFilter !== 'all'
              ? 'Nenhuma observação encontrada'
              : 'Nenhuma observação salva ainda'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'all'
              ? 'Tente mudar seus termos de busca ou remover os filtros aplicados.'
              : 'Use as observações para manter pensamentos organizados, listas de verificação rápidas ou ideias para seus clientes e projetos.'}
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Escrever Primeira Observação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const cat = note.category || 'general';
            const catInfo = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.general;
            const color = note.color || 'indigo';
            const colorInfo = COLOR_ACCENTS[color] || COLOR_ACCENTS.indigo;

            return (
              <div
                key={note.id}
                className={`group relative rounded-2xl bg-white dark:bg-slate-900 border ${colorInfo.border} dark:border-slate-800 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}
              >
                {/* Top colored strip */}
                <div className={`h-1.5 w-full ${colorInfo.banner}`} />

                {/* Card Header */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePinPersonalNote(note.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          note.pinned
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                            : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
                        }`}
                        title={note.pinned ? 'Desafixar do topo' : 'Fixar no topo'}
                      >
                        {note.pinned ? <Pin className="w-3.5 h-3.5 fill-amber-500" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Metadata: Category & Date (Zero-pill text formatting) */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                    <span className={`font-semibold ${catInfo.textClass}`}>
                      {catInfo.label}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {note.updatedAt
                        ? `Atualizado em ${formatDate(note.updatedAt)}`
                        : formatDate(note.createdAt)}
                    </span>
                  </div>

                  {/* Note Body */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed flex-1 break-words">
                    {note.content}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-400">
                    <button
                      onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                      className="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                      title="Copiar texto da anotação"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors text-slate-400 dark:text-slate-500"
                        title="Editar anotação"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingNoteId(note.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-slate-400 dark:text-slate-500"
                        title="Excluir anotação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {editingNote ? 'Editar Observação' : 'Nova Observação Pessoal'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Observação *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Alinhamento de proposta com o Carlos, Ideia para serviço de SEO..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as NonNullable<PersonalNote['category']>,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="general">Geral</option>
                    <option value="idea">Ideia de Negócio</option>
                    <option value="reminder">Lembrete</option>
                    <option value="client">Cliente / Reunião</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cor de Destaque
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {(Object.keys(COLOR_ACCENTS) as (keyof typeof COLOR_ACCENTS)[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        className={`w-6 h-6 rounded-full ${COLOR_ACCENTS[c].banner} flex items-center justify-center transition-transform ${
                          formData.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={COLOR_ACCENTS[c].label}
                      >
                        {formData.color === c && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Conteúdo / Mensagem
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva sua mensagem aqui. Você pode usar quebras de linha, marcadores ou listas."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notePinned"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                />
                <label
                  htmlFor="notePinned"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5"
                >
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  Fixar no topo desta lista
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNote ? 'Salvar Alterações' : 'Guardar Observação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingNoteId}
        title="Excluir Observação?"
        message="Tem certeza de que deseja remover esta observação? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Excluir"
        onConfirm={async () => {
          if (deletingNoteId) {
            await deletePersonalNote(deletingNoteId);
            setDeletingNoteId(null);
          }
        }}
        onCancel={() => setDeletingNoteId(null)}
      />
    </div>
  );
};
