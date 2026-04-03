"use client";

import { useState, useRef } from "react";
import { Banknote, CreditCard, Smartphone, Upload, Check, Image } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface PaymentFormProps {
  onConfirm: (method: PaymentMethod, refNo?: string, slipFile?: string) => void;
  total: number;
}

export default function PaymentForm({ onConfirm, total }: PaymentFormProps) {
  const { t } = useI18n();
  const [method, setMethod] = useState<PaymentMethod>("promptpay");
  const [refNo, setRefNo] = useState("");
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipName, setSlipName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSlipName(file.name);
    setSlipUploaded(true);
  };

  const methods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
    { value: "cash", label: t("pay.cash"), icon: Banknote },
    { value: "credit_card", label: t("pay.credit"), icon: CreditCard },
    { value: "promptpay", label: t("pay.promptpay"), icon: Smartphone },
  ];

  return (
    <div className="space-y-4">
      {/* Payment Method Selector */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-2">
          {t("pay.method")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all ${
                  active
                    ? "border-sage-500 bg-sage-50 text-sage-700 ring-1 ring-sage-500"
                    : "border-sage-200 bg-white text-charcoal-500 hover:border-sage-300 hover:bg-sage-50/50"
                }`}
              >
                <Icon size={20} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PromptPay Details */}
      {method === "promptpay" && (
        <div className="space-y-3 rounded-lg border border-sage-200 bg-sage-50/50 p-4">
          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              {t("pay.refNo")}
            </label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. 20260403-1530-PP"
              className="w-full rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            />
          </div>

          {/* Slip Upload */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              {t("pay.slip")}
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragOver
                  ? "border-sage-500 bg-sage-100"
                  : slipUploaded
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-sage-300 bg-white hover:border-sage-400 hover:bg-sage-50"
              }`}
            >
              {slipUploaded ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">{t("pay.uploaded")}</p>
                  <p className="text-xs text-charcoal-400">{slipName}</p>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100">
                    <Upload size={20} className="text-sage-500" />
                  </div>
                  <p className="text-sm text-charcoal-500">{t("pay.dragDrop")}</p>
                  <p className="text-xs text-charcoal-300">PNG, JPG up to 5MB</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={() => onConfirm(method, refNo || undefined, slipUploaded ? slipName : undefined)}
        className="w-full rounded-lg bg-sage-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700"
      >
        {t("common.pay")} ฿{total.toLocaleString()} — {methods.find((m) => m.value === method)?.label}
      </button>
    </div>
  );
}
