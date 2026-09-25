import React, { useState } from 'react';
import {
  Plus,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit2,
  Tag,
  Sparkles,
  MoveRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Lead, LeadStage } from '../types/index.ts';
import { LeadModal, STAGE_LABELS } from './LeadModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

const STAGES: LeadStage[] = [
  'prospect',
  'first_contact',
  'talking',
  'awaiting_response',
  'proposal_sent',
  'negotiating',
  'closed',
  'lost',
];

export const KanbanView: React.FC = () => {
  const {
    data,
    addLead,
    updateLead,
    deleteLead,
    moveLeadStage,
    convertLeadToClient,
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialStageForModal, setInitialStageForModal] = useState<LeadStage>('prospect');
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSaveLead = async (formData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (leadToEdit) {
      await updateLead(leadToEdit.id, formData);
      setLeadToEdit(null);
    } else {
      await addLead(formData);
    }
  };

  const handleConfirmConvert = async () => {
    if (leadToConvert) {
      await convertLeadToClient(leadToConvert.id, true);
      setLeadToConvert(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (id) {
      const lead = data.leads.find((l) => l.id === id);
      if (lead && lead.stage !== targetStage) {
        if (targetStage === 'closed') {
          setLeadToConvert(lead);
        } else {
          await moveLeadStage(id, targetStage);
        }
      }
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Prospecção & Funil Kanban
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe o ciclo de vendas desde o primeiro contato até o fechamento do contrato.
          </p>
        </div>

        <button
          onClick={() => {
            setLeadToEdit(null);
            setInitialStageForModal('prospect');
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-4 min-w-[1680px]">
          {STAGES.map((stageKey, stageIdx) => {
            const stageConfig = STAGE_LABELS[stageKey];
            const stageLeads = data.leads.filter((l) => l.stage === stageKey);
            const stageTotalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div
                key={stageKey}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stageKey)}
                className="w-72 flex-shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[78vh]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${stageConfig.color}`}>
                      {stageConfig.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">({stageLeads.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setLeadToEdit(null);
                      setInitialStageForModal(stageKey);
                      setIsCreateOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                    title="Adicionar lead nesta etapa"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subheader with stage potential sum */}
                <div className="py-1 text-[11px] text-slate-500 flex justify-between items-center font-medium">
                  <span>Potencial:</span>
                  <span className="font-bold text-slate-700">{formatCurrency(stageTotalValue)}</span>
                </div>

                {/* Cards Column */}
                <div className="flex-1 overflow-y-auto space-y-3 pt-2 pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      Arraste ou crie aqui
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const isOverdue =
                        lead.nextContactDate &&
                        lead.nextContactDate < todayStr &&
                        lead.stage !== 'closed' &&
                        lead.stage !== 'lost';

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className={`bg-white rounded-xl p-3.5 shadow-2xs border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                            isOverdue
                              ? 'border-rose-400 ring-2 ring-rose-200/60'
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs leading-tight">
                                {lead.company}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {lead.name} {lead.niche ? `• ${lead.niche}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setLeadToEdit(lead);
                                  setIsCreateOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setLeadToDelete(lead)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Value */}
                          <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(lead.estimatedValue || 0)}
                          </div>

                          {/* Follow-up Alert / Reminder */}
                          {lead.nextContactDate && (
                            <div
                              className={`mt-2.5 p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
                                isOverdue
                                  ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                                  : 'bg-slate-50 text-slate-600'
                              }`}
                            >
                              {isOverdue ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <p>
                                  Follow-up: {formatDate(lead.nextContactDate)}{' '}
                                  {isOverdue && <span className="text-rose-600 font-bold">(Atrasado!)</span>}
                                </p>
                                {lead.followUpReminder && (
                                  <p className="text-[10px] mt-0.5 opacity-90 truncate">
                                    &ldquo;{lead.followUpReminder}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {lead.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick Actions & Move Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                            {lead.whatsapp ? (
                              <a
                                href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                WhatsApp
                              </a>
                            ) : (
                              <span />
                            )}

                            <div className="flex items-center gap-1">
                              {/* Move previous */}
                              {stageIdx > 0 && (
                                <button
                                  onClick={() => moveLeadStage(lead.id, STAGES[stageIdx - 1])}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                                  title="Voltar etapa"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Convert to Client Button if in negotiating or closed */}
                              {lead.stage !== 'closed' && (
                                <button
                                  onClick={() => setLeadToConvert(lead)}
                                  className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                                  title="Fechar Venda (Transformar em Cliente & Criar Projeto)"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Move next */}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  onClick={() => {
                                    const nextStage = STAGES[stageIdx + 1];
                                    if (nextStage === 'closed') {
                                      setLeadToConvert(lead);
                                    } else {
                                      moveLeadStage(lead.id, nextStage);
                                    }
                                  }}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                                  title="Avançar etapa"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Modal */}
      <LeadModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setLeadToEdit(null);
        }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        initialStage={initialStageForModal}
      />

      {/* Confirm Convert Lead Modal */}
      <ConfirmModal
        isOpen={!!leadToConvert}
        title="Fechar Venda do Lead"
        message={`Deseja marcar "${leadToConvert?.company}" como FECHADO? Isso irá cadastrá-lo automaticamente na lista oficial de Clientes e criar o projeto em andamento com as cobranças.`}
        confirmLabel="Sim, Fechar e Criar Projeto"
        isDestructive={false}
        onConfirm={handleConfirmConvert}
        onCancel={() => setLeadToConvert(null)}
      />

      {/* Confirm Delete Lead Modal */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Excluir Oportunidade"
        message={`Deseja realmente remover o lead "${leadToDelete?.company}" do funil?`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (leadToDelete) {
            await deleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
};
