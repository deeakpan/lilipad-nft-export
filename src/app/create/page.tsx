"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const options = [
  {
    key: "single-nft",
    title: "Single NFT",
    description: "Mint a unique, one-of-one NFT with a single image and metadata.",
    icon: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mx-auto mb-4">
        <rect x="16" y="16" width="32" height="32" rx="6" stroke="#32CD32" strokeWidth="3" fill="none" />
        <path d="M32 40V24M32 24l-8 8M32 24l8 8" stroke="#32CD32" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "layered-collection",
    title: "Layered Collection (Generative)",
    description: "Upload trait layers and let the system generate a full NFT collection with rarity.",
    icon: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mx-auto mb-4">
        <rect x="10" y="10" width="44" height="44" rx="7" stroke="#32CD32" strokeWidth="3" fill="none" />
        <g stroke="#32CD32" strokeWidth="2.2">
          <rect x="18" y="18" width="8" height="8" rx="2" />
          <rect x="28" y="18" width="8" height="8" rx="2" />
          <rect x="38" y="18" width="8" height="8" rx="2" />
          <rect x="18" y="28" width="8" height="8" rx="2" />
          <rect x="28" y="28" width="8" height="8" rx="2" />
          <rect x="38" y="28" width="8" height="8" rx="2" />
        </g>
        <path d="M32 38v8M32 46l-4-4M32 46l4-4" stroke="#32CD32" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "one-of-one-collection",
    title: "One-of-one Collection",
    description: "Create a collection of unique, individually drawn NFTs, each with its own image and metadata.",
    icon: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mx-auto mb-4">
        <rect x="12" y="12" width="40" height="40" rx="8" stroke="#32CD32" strokeWidth="3" fill="none" />
        <path d="M24 24h16v16H24z" stroke="#32CD32" strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="32" r="4" stroke="#32CD32" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
];

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-black border-2 border-green-500 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button
          className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function CreatePage() {
  const [modal, setModal] = useState<string | null>(null);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white font-sans w-full flex flex-col items-center justify-start pt-0 px-0">
      {/* Header */}
      <header className="flex items-center justify-between px-16 py-6 border-b-4 border-green-500 bg-black/95 shadow-lg max-w-4xl w-full mx-auto rounded-b-2xl mt-0 mb-8">
        <span className="text-3xl font-extrabold tracking-tight text-primary select-none">Lilipad</span>
        <button
          className="px-7 py-2 rounded-lg border-2 border-primary text-primary font-bold bg-black/70 cursor-not-allowed opacity-70 hover:opacity-90 transition-all shadow-md"
          disabled
        >
          Connect Wallet
        </button>
      </header>
      <div className="w-full max-w-7xl mx-auto px-8 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">
            Create on <span className="text-yellow-400 drop-shadow">Lilipad</span>
          </h1>
          <div className="h-1 w-24 bg-yellow-400 rounded-full mx-auto mb-6" />
          <p className="text-green-300 text-lg md:text-xl">
            Start by selecting the type of NFT or collection you want to create.<br />
            <span className="text-white">Choose the workflow that fits your project—single NFT, generative collection, or a collection of unique artworks.</span>
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {options.map((opt) => (
            <button
              key={opt.key}
              className="flex-1 bg-black border-2 border-green-700 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg hover:border-green-400 hover:shadow-green-700 transition-all min-w-[260px] max-w-sm group focus:outline-none"
              style={{ minHeight: 320 }}
              onClick={() =>
                opt.key === "one-of-one-collection"
                  ? router.push("/create/one-of-one")
                  : setModal(opt.key)
              }
            >
              {opt.icon}
              <span className="text-xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors text-center">
                {opt.title}
              </span>
              <span className="text-green-300 text-base text-center">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-500 mb-4">Coming Soon</h2>
          <p className="text-green-300 mb-2">This workflow will guide you through the {modal && options.find(o => o.key === modal)?.title?.toLowerCase()} creation process.</p>
          <p className="text-yellow-400">Stay tuned for the full feature rollout!</p>
        </div>
      </Modal>
    </main>
  );
} 