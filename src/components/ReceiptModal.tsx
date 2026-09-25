import React from 'react';
import { X, Copy, Check, Share2, Printer, CheckCircle2 } from 'lucide-react';
import { Payment, Installment, Client, BusinessSettings } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  installment?: Installment;
  client?: Client;
  settings: BusinessSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  installment,
  client,
  settings,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const instNum = installment ? (installment.installmentNumber ?? installment.number ?? 1) : 1;
  const totalInst = payment.installmentsCount ?? payment.installments?.length ?? 1;
  const payMethod = (payment.paymentMethod || installment?.paymentMethod || 'PIX').toUpperCase();

  const receiptAmount = installment ? installment.amount : payment.receivedAmount || payment.totalAmount;
  const receiptNumber = `REC-${payment.id.slice(-4)}-${instNum}`;
  const currentDateFormatted = new Date().toLocaleDateString('pt-BR');

  const receiptText = `*COMPROVANTE DE PAGAMENTO / RECIBO*
----------------------------------------
Número: ${receiptNumber}
Data: ${currentDateFormatted}

RECEBEMOS DE:
${client?.companyName || 'Cliente'} (Resp: ${client?.contactName || 'Responsável'})
Documento: ${client?.email || client?.phone || 'Não informado'}

A IMPORTÂNCIA DE:
${formatCurrency(receiptAmount)}

REFERENTE A:
${payment.title}${installment ? ` - Parcela ${instNum} de ${totalInst}` : ''}
Forma de Pagamento: ${payMethod}

EMISSOR:
${settings.companyName || settings.userName}
CNPJ / Chave PIX: ${settings.pixKey || 'Não informada'}
Telefone / WhatsApp: ${settings.phone || 'Não informado'}
----------------------------------------
Obrigado pela preferência e parceria!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(receiptText);
    const phone = client?.whatsapp ? client.whatsapp.replace(/\D/g, '') : '';
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Recibo de Pagamento</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Receipt Card */}
        <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-3 text-slate-800">
          <div className="flex justify-between items-start border-b border-slate-200 pb-2">
            <div>
              <p className="font-bold text-sm text-slate-900">{settings.companyName || 'FreelanceHub'}</p>
              <p className="text-[11px] text-slate-500">{settings.userName}</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                PAGO
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">{receiptNumber}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Recebemos de:</span>
            <p className="font-bold text-slate-900">{client?.companyName || 'Cliente'}</p>
            <p className="text-[11px] text-slate-600">{client?.contactName} • {client?.city}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Valor Recebido:</span>
            <p className="text-lg font-black text-emerald-700">{formatCurrency(receiptAmount)}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Referente a:</span>
            <p className="font-semibold text-slate-800">
              {payment.title}
              {installment && ` (Parcela ${instNum}/${totalInst})`}
            </p>
            <p className="text-[11px] text-slate-500">Método: {payMethod}</p>
          </div>

          <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-400 flex justify-between">
            <span>Emissão: {currentDateFormatted}</span>
            <span>Autenticação digital</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Enviar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
