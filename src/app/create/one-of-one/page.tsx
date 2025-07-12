"use client";
import React, { useState, useRef } from "react";
// @ts-ignore
import Switch from "react-switch";
import Link from "next/link";

interface NFTItem {
  id: string;
  image: string; // URL
  imageData?: string; // Base64 data for persistence
  metadata: any;
  file?: File;
  tokenId: number; // Added tokenId to the interface
  saved?: boolean; // Track if NFT has been saved
}

export default function OneOfOneCollectionPage() {
  const [collection, setCollection] = useState({
    name: "",
    description: "",
  });
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [globalAttributes, setGlobalAttributes] = useState<string[]>([]);
  const [useCollectionDescription, setUseCollectionDescription] = useState(true);
  const [lockNFTNames, setLockNFTNames] = useState(true);
  const [lockNFTDescriptions, setLockNFTDescriptions] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop or file picker for images
  function handleImageDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    addImages(files);
  }
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files).filter(f => f.type.startsWith("image/")) : [];
    addImages(files);
  }
  function addImages(files: File[]) {
    setNfts(prev => {
      const startIdx = prev.length;
      const newNfts = files.map((file, i) => ({
        id: `${Date.now()}-${Math.random()}`,
        tokenId: startIdx + i,
        image: URL.createObjectURL(file), // Keep blob URL for immediate display
        imageData: undefined, // Will be set to base64 when needed
        metadata: {
          name: collection.name ? `${collection.name} #${startIdx + i}` : `#${startIdx + i}`,
          description: useCollectionDescription ? (collection.description || "") : "",
          image: "",
          attributes: globalAttributes.filter(Boolean).map(trait => ({ trait_type: trait, value: "" })),
        },
        file,
      }));
      return [...prev, ...newNfts];
    });
  }

  // Collection-level form handlers
  function handleCollectionInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setCollection(c => ({ ...c, [name]: value }));
  }

  // NFT property editing
  function updateNFT(id: string, meta: any) {
    setNfts(nfts => nfts.map(nft => nft.id === id ? { ...nft, metadata: meta, saved: true } : nft));
  }

  // Global attributes handlers
  function addGlobalAttribute() {
    setGlobalAttributes(attrs => [...attrs, ""]);
  }
  function updateGlobalAttribute(i: number, value: string) {
    setGlobalAttributes(attrs => {
      const newAttrs = attrs.map((attr, idx) => idx === i ? value : attr);
      return newAttrs;
    });
  }
  function removeGlobalAttribute(i: number) {
    setGlobalAttributes(attrs => {
      const removedAttr = attrs[i];
      const newAttrs = attrs.filter((_, idx) => idx !== i);
      // Also remove this attribute from all existing NFTs
      setNfts(prevNfts => prevNfts.map(nft => ({
        ...nft,
        metadata: {
          ...nft.metadata,
          attributes: (nft.metadata?.attributes || []).filter((attr: any) => attr.trait_type !== removedAttr)
        }
      })));
      return newAttrs;
    });
  }

  const selectedNFT = selected ? nfts.find(n => n.id === selected) : null;

  // Check if all NFTs have been saved and have their attributes filled
  const allAttributesFilled = nfts.length > 0 && nfts.every(nft => {
    // Only check NFTs that have been saved
    if (!nft.saved) return false;
    const attributes = nft.metadata?.attributes || [];
    return attributes.every((attr: any) => attr.value && attr.value.trim() !== '');
  });

  // Sync global attributes across all NFTs whenever globalAttributes changes
  React.useEffect(() => {
    if (globalAttributes.length > 0) {
      setNfts(prevNfts => prevNfts.map(nft => {
        const currentAttrs = nft.metadata?.attributes || [];
        const newAttrs = globalAttributes.filter(Boolean).map(trait => {
          const existing = currentAttrs.find((a: any) => a.trait_type === trait);
          return existing || { trait_type: trait, value: "" };
        });
        return {
          ...nft,
          metadata: {
            ...nft.metadata,
            attributes: newAttrs
          }
        };
      }));
    }
  }, [globalAttributes]);

  // Convert images to base64 and save NFTs to localStorage
  React.useEffect(() => {
    const saveNFTs = async () => {
      const nftsWithBase64 = await Promise.all(
        nfts.map(async (nft) => {
          if (nft.imageData) {
            return nft; // Already has base64 data
          }
          
          if (nft.file) {
            // Convert file to base64
            const reader = new FileReader();
            return new Promise<NFTItem>((resolve) => {
              reader.onload = () => {
                resolve({
                  ...nft,
                  imageData: reader.result as string
                });
              };
              reader.readAsDataURL(nft.file!);
            });
          }
          
          return nft;
        })
      );
      
      // REMOVE: localStorage.setItem('lilipad-nfts', JSON.stringify(nftsWithBase64));
    };
    
    if (nfts.length > 0) {
      saveNFTs();
    }
  }, [nfts]);

  React.useEffect(() => {
    // REMOVE: localStorage.setItem('lilipad-collection', JSON.stringify(collection));
  }, [collection]);

  // REMOVE: React.useEffect for saving global attributes to localStorage
  React.useEffect(() => {
    // REMOVE: localStorage.setItem('lilipad-global-attributes', JSON.stringify(globalAttributes));
  }, [globalAttributes]);

  React.useEffect(() => {
    // REMOVE: localStorage.setItem('lilipad-lock-names', JSON.stringify(lockNFTNames));
  }, [lockNFTNames]);

  React.useEffect(() => {
    // REMOVE: localStorage.setItem('lilipad-lock-descriptions', JSON.stringify(lockNFTDescriptions));
  }, [lockNFTDescriptions]);

  return (
    <main className="min-h-screen bg-black text-white font-sans w-full flex flex-col">
      {/* Header with Next button */}
      <header className="flex items-center justify-between px-16 py-6 border-b-4 border-green-500 bg-black/95 shadow-lg w-full">
        <span className="text-3xl font-extrabold tracking-tight text-primary select-none">Generate Unique One-of-One Collections</span>
        <Link href={nfts.length >= 5 && allAttributesFilled ? "/create/one-of-one/preview" : "#"}>
          <button 
            className={`px-8 py-3 font-bold rounded-lg shadow transition text-lg ${
              nfts.length >= 5 && allAttributesFilled
                ? "bg-green-500 text-black hover:bg-green-600" 
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={nfts.length < 5 || !allAttributesFilled}
            onClick={() => {
              if (nfts.length >= 5 && allAttributesFilled) {
                // Temporarily save data for preview page
                localStorage.setItem('lilipad-nfts', JSON.stringify(nfts));
                localStorage.setItem('lilipad-collection', JSON.stringify(collection));
              }
            }}
          >
            Next
          </button>
        </Link>
        {nfts.length >= 5 && !allAttributesFilled && (
          <div className="text-yellow-400 text-sm mt-2">
            {nfts.some(nft => !nft.saved) 
              ? "Save all NFT details to continue" 
              : "Fill in all attribute values for each NFT to continue"
            }
          </div>
        )}
      </header>

      {/* Main content area */}
      <div className="flex flex-row flex-1">
        {/* Left: Collection settings and info */}
        <aside className="w-80 min-w-[18rem] bg-black border-r-2 border-green-500 flex flex-col h-screen">
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto p-8 pb-2">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Collection</h2>
            <label className="font-bold text-green-300">Name
              <input 
                name="name" 
                value={collection.name} 
                onChange={handleCollectionInput} 
                placeholder="e.g., My Awesome Collection"
                className="mt-1 w-full rounded bg-black border border-green-700 text-white p-2" 
              />
            </label>
            <label className="font-bold text-green-300 mt-4 block">Description
              <textarea 
                name="description" 
                value={collection.description} 
                onChange={handleCollectionInput} 
                placeholder="A unique collection of hand-drawn NFTs"
                className="mt-1 w-full rounded bg-black border border-green-700 text-white p-2" 
                rows={3} 
              />
            </label>
            {/* Lock NFT names and descriptions switches */}
            <div className="flex flex-col gap-4 mt-2 mb-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={lockNFTNames}
                  onChange={setLockNFTNames}
                  onColor="#32CD32"
                  offColor="#222"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={22}
                  width={44}
                  handleDiameter={18}
                  boxShadow="0 0 2px #111"
                  activeBoxShadow="0 0 2px #32CD32"
                />
                <label htmlFor="lockNFTNames" className="text-green-300 text-sm cursor-pointer select-none">
                  Lock NFT names to collection name + #ID
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={lockNFTDescriptions}
                  onChange={setLockNFTDescriptions}
                  onColor="#32CD32"
                  offColor="#222"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={22}
                  width={44}
                  handleDiameter={18}
                  boxShadow="0 0 2px #111"
                  activeBoxShadow="0 0 2px #32CD32"
                />
                <label htmlFor="lockNFTDescriptions" className="text-green-300 text-sm cursor-pointer select-none">
                  Lock NFT descriptions to collection description
                </label>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                <p>• <strong>ON:</strong> All NFTs use collection defaults</p>
                <p>• <strong>OFF:</strong> Edit each NFT individually</p>
              </div>
            </div>
            <label className="font-bold text-green-300 mt-4 block">Collection Size
              <input
                value={nfts.length}
                readOnly
                className="mt-1 w-full rounded bg-black border border-green-700 text-gray-400 p-2 cursor-not-allowed select-none"
                tabIndex={-1}
              />
            </label>
            {/* Global Attributes Section */}
            <div className="mt-8 mb-2">
              <h3 className="text-lg font-bold text-green-400 mb-2">Global Attributes</h3>
              <div className="flex flex-col gap-2">
                {globalAttributes.map((attr, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={attr}
                      onChange={e => updateGlobalAttribute(i, e.target.value)}
                      placeholder="Trait Type"
                      className="rounded bg-black border border-green-700 text-white p-1 flex-1"
                    />
                    <button
                      className="text-yellow-400 font-bold px-2 py-1 rounded hover:bg-yellow-900/30"
                      onClick={() => removeGlobalAttribute(i)}
                      type="button"
                    >×</button>
                  </div>
                ))}
                <button
                  className="mt-2 px-4 py-1 bg-green-500 text-black font-bold rounded shadow hover:bg-green-600 transition text-sm"
                  type="button"
                  onClick={addGlobalAttribute}
                >+ Add Attribute</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">These attributes will appear for every NFT. Set values per NFT in the details panel.</p>
            </div>
          </div>
          {/* NFT Preview */}
          <div className="max-h-64 overflow-y-auto p-8 pt-0">
            <h3 className="text-lg font-bold text-green-400 mb-2">NFT Preview</h3>
            {selectedNFT ? (
              <div className="flex flex-col items-center gap-2">
                <img src={selectedNFT.image} alt="nft preview" className="w-24 h-24 object-cover rounded border border-green-700 mb-2" />
                <pre className="scroll-x w-full max-h-32 overflow-y-auto bg-black border border-green-700 rounded text-xs text-green-300 p-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedNFT.metadata, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-green-300 text-center text-sm">Select an NFT to preview</div>
            )}
          </div>
        </aside>

        {/* Center: NFT grid and drag-and-drop */}
        <section className="flex-1 flex flex-col items-center justify-start p-10 gap-8 overflow-y-auto h-screen">
          <div className="w-full flex flex-row gap-8">
            {/* Drag-and-drop for images and file picker */}
            <div
              className={`flex-1 bg-black border-2 border-green-700 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px] transition-all text-center ${(!collection.name || !collection.description) ? 'opacity-60 cursor-not-allowed' : 'hover:border-green-400 cursor-pointer'}`}
              onDrop={e => {
                if (collection.name && collection.description) handleImageDrop(e);
              }}
              onDragOver={e => e.preventDefault()}
              onClick={() => {
                if (collection.name && collection.description) imageInputRef.current?.click();
              }}
            >
              <span className="text-green-400 font-bold text-lg mb-2">Drag & Drop Images Here</span>
              <span className="text-green-300 text-sm mb-2">PNG, JPG, etc. Each image will be a unique NFT.</span>
              <button
                className="mt-4 px-6 py-2 bg-green-500 text-black font-bold rounded-lg shadow hover:bg-green-600 transition text-base disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={!collection.name || !collection.description}
                onClick={e => {
                  e.stopPropagation();
                  if (collection.name && collection.description) imageInputRef.current?.click();
                }}
              >
                Select Images
              </button>
              {(!collection.name || !collection.description) && (
                <span className="text-yellow-400 text-xs mt-2">Fill in collection name and description to add images</span>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>
          {/* NFT grid */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {nfts.map(nft => (
              <div
                key={nft.id}
                className={`bg-black border-2 rounded-xl p-2 flex flex-col items-center transition-all ${selected === nft.id ? "border-yellow-400" : "border-green-700 hover:border-green-400"} ${!collection.name || !collection.description ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (collection.name && collection.description) {
                    setSelected(nft.id);
                    setShowDetails(true);
                  }
                }}
              >
                <div className="w-full flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 font-mono">ID: {nft.tokenId}</span>
                </div>
                <img src={nft.image} alt="nft" className="w-24 h-24 object-cover rounded mb-2 border border-green-700" />
                <span className="text-green-400 font-bold text-sm truncate w-full">{nft.metadata?.name || "Untitled"}</span>
                {nft.saved && (
                  <span className="text-xs text-green-500 font-bold">✓ Saved</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right: NFT details/properties */}
        <aside className="w-96 min-w-[20rem] max-w-[28rem] bg-black border-l-2 border-green-500 p-8 flex flex-col gap-6 h-screen overflow-y-auto">
          <h3 className="text-xl font-bold text-green-400 mb-4">NFT Details</h3>
          {selected ? (
            <NFTDetails
              nft={nfts.find(n => n.id === selected)!}
              onChange={meta => updateNFT(selected, meta)}
              onClose={() => setShowDetails(false)}
              globalAttributes={globalAttributes}
              lockNFTNames={lockNFTNames}
              lockNFTDescriptions={lockNFTDescriptions}
              collectionName={collection.name}
              collectionDescription={collection.description}
              nfts={nfts}
              setNfts={setNfts}
            />
          ) : (
            <div className="text-green-300 text-center mt-24">
              {(!collection.name || !collection.description)
                ? "Fill in collection name and description to edit NFTs"
                : "Select an NFT to edit its properties"}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function NFTDetails({ nft, onChange, onClose, globalAttributes, lockNFTNames, lockNFTDescriptions, collectionName, collectionDescription, nfts, setNfts }: {
  nft: NFTItem;
  onChange: (meta: any) => void;
  onClose: () => void;
  globalAttributes: string[];
  lockNFTNames: boolean;
  lockNFTDescriptions: boolean;
  collectionName: string;
  collectionDescription: string;
  nfts: NFTItem[];
  setNfts: React.Dispatch<React.SetStateAction<NFTItem[]>>;
}) {
  const [meta, setMeta] = useState<any>(nft.metadata);
  React.useEffect(() => {
    setMeta(nft.metadata);
  }, [nft]);

  // Ensure all global attributes exist in meta.attributes
  React.useEffect(() => {
    setMeta((m: any) => {
      const attrs = [...(m.attributes || [])];
      globalAttributes.forEach((trait) => {
        if (trait && !attrs.some((a: any) => a.trait_type === trait)) {
          attrs.push({ trait_type: trait, value: "" });
        }
      });
      // Remove attributes not in globalAttributes
      const filtered = attrs.filter((a: any) => !a.trait_type || globalAttributes.includes(a.trait_type));
      // Ensure order matches globalAttributes
      const ordered = globalAttributes.filter(Boolean).map(trait => filtered.find((a: any) => a.trait_type === trait) || { trait_type: trait, value: "" });
      return { ...m, attributes: ordered };
    });
  }, [globalAttributes]);

  // Add/remove property
  function updateAttribute(i: number, key: string, value: string) {
    setMeta((m: any) => {
      const attrs = [...(m.attributes || [])];
      attrs[i][key] = value;
      return { ...m, attributes: attrs };
    });
  }
  function removeAttribute(i: number) {
    setMeta((m: any) => {
      const attrs = [...(m.attributes || [])];
      attrs.splice(i, 1);
      return { ...m, attributes: attrs };
    });
  }
  // Save changes
  function save() {
    onChange(meta);
    onClose();
  }
  // Lock logic for name/description
  const lockedName = lockNFTNames ? (collectionName ? `${collectionName} #${nft.tokenId}` : `#${nft.tokenId}`) : undefined;
  const lockedDescription = lockNFTDescriptions ? (collectionDescription || "") : undefined;
  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto overflow-x-hidden">
      <div className="flex items-center gap-2 mb-2">
        <label className="font-bold text-green-300">Token ID</label>
        <input value={nft.tokenId !== undefined ? nft.tokenId : ''} readOnly className="w-20 rounded bg-black border border-green-700 text-gray-400 p-1 cursor-not-allowed select-none text-center" tabIndex={-1} />
        <button 
          className="px-3 py-1 bg-yellow-500 text-black font-bold rounded text-xs hover:bg-yellow-400 transition"
          onClick={() => {
            // Save all NFTs with current metadata, filling empty attributes with "null"
            const updatedNFTs = nfts.map(nft => {
              const attributes = (nft.metadata?.attributes || []).map((attr: any) => ({
                ...attr,
                value: attr.value || "null"
              }));
              return {
                ...nft,
                metadata: {
                  ...nft.metadata,
                  attributes
                },
                saved: true
              };
            });
            setNfts(updatedNFTs);
          }}
        >
          Save All
        </button>
      </div>
      <h3 className="text-xl font-bold text-yellow-400 mb-2">NFT Properties</h3>
      <label className="font-bold text-green-300">Name
        <input
          value={lockedName !== undefined ? lockedName : (meta.name || "")}
          onChange={e => !lockNFTNames && setMeta((m: any) => ({ ...m, name: e.target.value }))}
          className={`mt-1 w-full rounded bg-black border border-green-700 ${lockNFTNames ? 'text-gray-400 cursor-not-allowed select-none' : 'text-white'} p-2`}
          readOnly={lockNFTNames}
        />
      </label>
      <label className="font-bold text-green-300">Description
        <textarea
          value={lockedDescription !== undefined ? lockedDescription : (meta.description || "")}
          onChange={e => !lockNFTDescriptions && setMeta((m: any) => ({ ...m, description: e.target.value }))}
          className={`mt-1 w-full rounded bg-black border border-green-700 ${lockNFTDescriptions ? 'text-gray-400 cursor-not-allowed select-none' : 'text-white'} p-2`}
          rows={2}
          readOnly={lockNFTDescriptions}
        />
      </label>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-green-300">Attributes</span>
        </div>
        <div className="flex flex-col gap-2 scroll-x">
          {(meta.attributes || []).map((attr: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={attr.trait_type} readOnly className="rounded bg-black border border-green-700 text-gray-400 p-1 flex-1" />
              <input value={attr.value} onChange={e => updateAttribute(i, "value", e.target.value)} placeholder="Value" className="rounded bg-black border border-green-700 text-white p-1 flex-1 break-all" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-2 bg-green-500 text-black font-bold rounded-lg shadow hover:bg-green-600 transition text-base" onClick={save} type="button">Save</button>
        <button className="px-6 py-2 bg-black border border-green-700 text-green-300 font-bold rounded-lg hover:bg-green-900/30 transition text-base" onClick={onClose} type="button">Cancel</button>
      </div>
    </div>
  );
} 