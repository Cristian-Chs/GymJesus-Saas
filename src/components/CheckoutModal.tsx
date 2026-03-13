"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { processPayment } from "@/lib/payment";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tier: {
    id: "basico" | "pro" | "elite";
    name: string;
    price: number;
    planId: string;
  };
  userProfile: UserProfile;
}

export default function CheckoutModal({ isOpen, onClose, tier, userProfile }: Props) {
  const [loading, setLoading] = useState(false);
  const [bcvRate, setBcvRate] = useState(null as number | null);
  const [formData, setFormData] = useState({
    phone: "",
    reference: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bcv")
        .then(res => res.json())
        .then(data => {
          if (data.rate) setBcvRate(parseFloat(data.rate));
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let receiptUrl = "";
      
      if (selectedFile) {
        const fileRef = ref(storage, `receipts/${userProfile.uid}_${Date.now()}`);
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        receiptUrl = await getDownloadURL(uploadResult.ref);
      }

      const details = `Ref: ${formData.reference}, Tel: ${formData.phone}`;
        
      await processPayment(userProfile, tier.id, tier.price, "pagomovil", details, tier.planId, receiptUrl);
      alert("¡Gracias! Tu pago ha sido registrado y está en espera de verificación por el administrador.");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  const totalPriceBs = bcvRate ? (tier.price * bcvRate).toFixed(2) : "...";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-900/90 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-surface-800 p-8 shadow-2xl relative overflow-hidden h-[90vh] overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-brand-primary/10 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Finalizar Compra</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Pricing Info */}
          <div className="mb-6 rounded-2xl bg-surface-700/50 p-5 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Seleccionado</span>
              <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold text-brand-primary uppercase">
                {tier.name}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-400">Total a pagar</span>
              <div className="text-right">
                <p className="text-3xl font-black text-white">${tier.price}</p>
                <p className="text-xs text-brand-primary font-bold">≈ Bs. {totalPriceBs}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-4 animate-slide-up">
            {/* Merchant Data */}
            <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4">
              <p className="mb-2 text-[10px] font-black uppercase text-brand-primary tracking-widest">Datos del Comercio</p>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-gray-500">Banco:</span> <span className="text-gray-200 font-medium">Banesco</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Teléfono:</span> <span className="text-gray-200 font-medium">04246188448</span></p>
                <p className="flex justify-between"><span className="text-gray-500">C.I:</span> <span className="text-gray-200 font-medium">V28735492</span></p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Tu Teléfono (Emisor)</label>
              <input 
                required
                placeholder="0414..."
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                className="w-full rounded-xl bg-surface-900 border border-white/5 p-3 text-sm text-gray-100 outline-none focus:border-brand-primary/50 transition-colors" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Número de Referencia (4 últimos dígitos)</label>
              <input 
                required
                placeholder="1234"
                value={formData.reference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, reference: e.target.value})}
                className="w-full rounded-xl bg-surface-900 border border-white/5 p-3 text-sm text-gray-100 outline-none focus:border-brand-primary/50 transition-colors" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Comprobante / Capture (Opcional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/5 border-dashed rounded-xl cursor-pointer bg-surface-900 hover:bg-surface-950 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-500 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-xs text-gray-500 font-bold uppercase"><span className="text-brand-primary">{selectedFile ? selectedFile.name : "Subir Capture"}</span></p>
                    <p className="text-[10px] text-gray-600">PNG, JPG o JPEG</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-xl bg-brand-primary py-4 text-sm font-black text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar Pago Móvil"}
            </button>
            
            <p className="text-center text-[10px] text-gray-500 font-medium">
              Transacción segura protegida por cifrado de extremo a extremo.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
