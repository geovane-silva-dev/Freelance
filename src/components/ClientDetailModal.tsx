import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Instagram,
  MapPin,
  Calendar,
  FolderKanban,
  DollarSign,
  MessageSquare,
  FileText,
  Paperclip,
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Client, ClientStatus, FileCategory } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  onEdit: (client: Client) => void;
}

const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  contacted: { label: 'Contatado', color: 'bg-blue-100 text-blue-700' },
  negotiating: { label: 'Em negociação', color: 'bg-indigo-100 text-indigo-700' },
  awaiting_response: { label: 'Aguardando resposta', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', color: 'bg-teal-100 text-teal-700' },
  active_client: { label: 'Cliente ativo', color: 'bg-emerald-100 text-emerald-700' },
  project_in_progress: { label: 'Projeto em andamento', color: 'bg-purple-100 text-purple-700' },
  project_completed: { label: 'Projeto concluído', color: 'bg-emerald-100 text-emerald-800' },
  lost_client: { label: 'Cliente perdido', color: 'bg-rose-100 text-rose-700' },
  inactive_client: { label: 'Cliente inativo', color: 'bg-slate-200 text-slate-600' },
};

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onEdit,
}) => {
  const {
    data,
    updateClient,
    addClientHistoryNote,
    deleteClientHistoryItem,
    addFileAttachment,
    deleteFileAttachment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'files' | 'projects'>('overview');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<FileCategory>('briefing');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  if (!isOpen || !clientId) return null;

  const client = data.clients.find((c) => c.id === clientId);
  if (!client) return null;

  const clientProjects = data.projects.filter((p) => p.clientId === clientId);
  const clientPayments = data.payments.filter((p) => p.clientId === clientId);
  const clientHistory = data.clientHistory
    .filter((h) => h.clientId === clientId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const clientFiles = data.files.filter((f) => f.clientId === clientId);

  const totalBilled = clientPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalReceived = clientPayments.reduce((sum, p) => sum + p.receivedAmount, 0);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    await addClientHistoryNote(clientId, newNoteContent.trim());
    setNewNoteContent('');
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    await addFileAttachment({
      clientId,
      name: newFileName.trim(),
      category: newFileCategory,
      fileSize: '1.5 MB',
      fileUrl: newFileUrl.trim() || '#',
    });
    setNewFileName('');
    setNewFileUrl('');
  };

  const statusInfo = STATUS_CONFIG[client.status] || {
    label: client.status,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 my-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header with quick info & actions */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900">{client.companyName}</h3>
              <span className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  title="Clique para selecionar a condição deste cliente"
                  className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-all select-none hover:shadow-xs hover:ring-2 hover:ring-indigo-300 active:scale-95 ${statusInfo.color}`}
                >
                  <span>{statusInfo.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform" />
                </button>

                {isStatusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />
                    <div
                      className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Alterar Condição</span>
                        <span className="text-[9px] font-normal text-slate-400 lowercase">status</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-0.5">
                        {Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
                          const isSelected = client.status === statusKey;
                          return (
                            <button
                              key={statusKey}
                              type="button"
                              onClick={async () => {
                                await updateClient(client.id, { status: statusKey as ClientStatus });
                                setIsStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50 font-bold text-indigo-900'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.color.split(' ')[0]}`} />
                                <span className="truncate">{cfg.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Contato: <strong className="text-slate-700">{client.contactName || 'Não informado'}</strong> • Nicho:{' '}
              {client.niche || 'Geral'} • Cidade: {client.city || 'Não informada'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {client.whatsapp && (
              <a
                href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            <button
              onClick={() => onEdit(client)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="Editar dados do cliente"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Histórico e Anotações ({clientHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Projetos & Pagamentos ({clientProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            Documentos e Arquivos ({clientFiles.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Dados de Contato
                  </h4>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {client.email || 'Nenhum e-mail informado'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {client.phone || client.whatsapp || 'Nenhum telefone informado'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Instagram className="w-3.5 h-3.5 text-slate-400" />
                    {client.instagram || 'Nenhum Instagram informado'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {client.city || 'Cidade não informada'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Origem & Negócio
                  </h4>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Primeiro Contato:</span>{' '}
                    {formatDate(client.firstContactDate)}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Origem:</span> {client.origin || 'Não informada'}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Faturamento Total:</span>{' '}
                    {formatCurrency(totalBilled)}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Valor Já Recebido:</span>{' '}
                    {formatCurrency(totalReceived)}
                  </p>
                </div>
              </div>

              {client.notes && (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                  <h4 className="font-bold text-indigo-900 mb-1">Observações Cadastradas</h4>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO & ANOTAÇÕES (Section 12) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Form to add note */}
              <form onSubmit={handleAddNote} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Adicionar Anotação Manual ao Histórico
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Ex: Cliente pediu reunião na próxima terça para definir nova campanha..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Anotar
                  </button>
                </div>
              </form>

              {/* Timeline list */}
              <div className="space-y-3 pt-2">
                {clientHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum evento registrado ainda.</p>
                ) : (
                  clientHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              item.type === 'auto_event'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.type === 'auto_event' ? 'Evento Automático' : 'Anotação'}
                          </span>
                          <span className="text-[11px] text-slate-400">{formatDate(item.date)}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{item.content}</p>
                      </div>

                      {item.type === 'manual_note' && (
                        <button
                          onClick={() => deleteClientHistoryItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Excluir anotação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROJETOS & PAGAMENTOS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Projetos do Cliente ({clientProjects.length})
                </h4>
                {clientProjects.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Nenhum projeto vinculado a este cliente.</p>
                ) : (
                  <div className="space-y-2">
                    {clientProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-slate-500 text-[11px]">
                            {p.serviceType} • Prazo: {formatDate(p.deliveryDeadline)} • Status: {p.status}
                          </p>
                        </div>
                        <span className="font-bold text-indigo-600">{formatCurrency(p.chargedPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Cobranças & Pagamentos ({clientPayments.length})
                </h4>
                {clientPayments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Nenhuma cobrança registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {clientPayments.map((pay) => (
                      <div
                        key={pay.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{pay.title}</p>
                          <p className="text-slate-500 text-[11px]">
                            Recebido: {formatCurrency(pay.receivedAmount)} de {formatCurrency(pay.totalAmount)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            pay.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : pay.status === 'partial'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {pay.status === 'paid' ? 'Pago' : pay.status === 'partial' ? 'Parcial' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTOS E ARQUIVOS (Section 13) */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* Form to attach file */}
              <form onSubmit={handleAddFile} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Anexar Novo Arquivo / Link</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome do Arquivo</label>
                    <input
                      type="text"
                      required
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Ex: Briefing_Final.pdf"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoria</label>
                    <select
                      value={newFileCategory}
                      onChange={(e) => setNewFileCategory(e.target.value as FileCategory)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="briefing">Briefing</option>
                      <option value="logo">Logo / Marca</option>
                      <option value="images">Imagens</option>
                      <option value="contracts">Contrato</option>
                      <option value="documents">Documento</option>
                      <option value="references">Referências</option>
                      <option value="project_files">Arquivos do Projeto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link ou URL</label>
                    <input
                      type="text"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Anexar Arquivo
                  </button>
                </div>
              </form>

              {/* Files list */}
              <div className="space-y-2">
                {clientFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Nenhum arquivo anexado a este cliente.</p>
                ) : (
                  clientFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{file.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Categoria: <strong className="text-slate-600 capitalize">{file.category}</strong> • Anexado em:{' '}
                            {formatDate(file.uploadDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.fileUrl && file.fileUrl !== '#' && (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Abrir arquivo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteFileAttachment(file.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                          title="Excluir anexo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
