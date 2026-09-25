import React from 'react';
import { X, Copy, Check, Share2, Printer, FileCheck } from 'lucide-react';
import { Proposal, Client, BusinessSettings } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  client?: Client;
  settings: BusinessSettings;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  isOpen,
  onClose,
  proposal,
  client,
  settings,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const proposalText = `*PROPOSTA COMERCIAL: ${proposal.title.toUpperCase()}*
--------------------------------------------
CLIENTE: ${client?.companyName || 'Cliente'}
RESPONSÁVEL: ${client?.contactName || ''}
DATA: ${new Date().toLocaleDateString('pt-BR')}

1. ESCOPO DO PROJETO:
${proposal.scope}

2. O QUE ESTÁ INCLUÍDO:
${proposal.includedItems?.map((item) => `• ${item}`).join('\n')}

3. O QUE NÃO ESTÁ INCLUÍDO:
${proposal.excludedItems?.map((item) => `✕ ${item}`).join('\n')}

4. PRAZO DE ENTREGA:
${proposal.deadlineDays} dias úteis após o recebimento do briefing e materiais.

5. INVESTIMENTO E CONDIÇÕES DE PAGAMENTO:
Valor Total: ${formatCurrency(proposal.totalValue)}
Condições: ${proposal.paymentTerms}

EMITIDO POR:
${settings.companyName || settings.userName}
Chave PIX: ${settings.pixKey || 'Não informada'}
Telefone/WhatsApp: ${settings.phone || 'Não informado'}
--------------------------------------------
Para aprovar esta proposta, basta responder com seu "De acordo".`;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = client?.whatsapp ? client.whatsapp.replace(/\D/g, '') : '';
    const encoded = encodeURIComponent(proposalText);
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Visualização da Proposta Comercial</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Proposal Document */}
        <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 space-y-4 text-xs">
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">{settings.companyName || 'Freelance Studio'}</h2>
              <p className="text-slate-500">{settings.userName} • {settings.email}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800 uppercase">
                {proposal.status}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Validade: 15 dias</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Cliente:</span>
            <p className="font-bold text-slate-900 text-sm">{client?.companyName}</p>
            <p className="text-slate-600">{client?.contactName} • {client?.email}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Título & Escopo:</span>
            <h4 className="font-bold text-slate-900">{proposal.title}</h4>
            <p className="text-slate-700 whitespace-pre-line mt-1">{proposal.scope}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                ✓ O que está incluído:
              </span>
              <ul className="space-y-1 text-emerald-950">
                {proposal.includedItems?.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-800 block mb-1">
                ✕ O que NÃO está incluído:
              </span>
              <ul className="space-y-1 text-rose-950">
                {proposal.excludedItems?.map((item: string, i: number) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prazo Estimado:</span>
              <p className="font-bold text-slate-800">
                {proposal.deadlineDays || proposal.estimatedDays || 7} dias úteis
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Condições:</span>
              <p className="font-bold text-slate-800">
                {proposal.paymentTerms || '50% de entrada + 50% na aprovação final'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <span className="font-bold text-xs">VALOR TOTAL DO INVESTIMENTO:</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {formatCurrency(proposal.totalValue ?? proposal.value ?? 0)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Share2 className="w-4 h-4" />
            Enviar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
