"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";

interface NFTItem {
  id: string;
  tokenId: number;
  image: string;
  metadata: {
    name: string;
    description: string;
    attributes: { trait_type: string; value: string }[];
  };
}

export default function OneOfOnePreviewPage() {
  const router = useRouter();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [collection, setCollection] = useState({ name: "", description: "" });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Load NFTs from localStorage
    const savedNFTs = localStorage.getItem('lilipad-nfts');
    const savedCollection = localStorage.getItem('lilipad-collection');
    
    if (savedNFTs) {
      setNfts(JSON.parse(savedNFTs));
    }
    
    if (savedCollection) {
      setCollection(JSON.parse(savedCollection));
    }
  }, []);

  const downloadCollection = async () => {
    if (nfts.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      
      // Create folders
      const imagesFolder = zip.folder("images");
      const metadataFolder = zip.folder("metadata");
      
      // Process each NFT
      for (const nft of nfts) {
        const tokenId = nft.tokenId;
        
        // Download and rename image
        const imageResponse = await fetch(nft.image);
        const imageBlob = await imageResponse.blob();
        const newImageName = `${tokenId}.png`;
        imagesFolder?.file(newImageName, imageBlob);
        
        // Create metadata JSON
        const metadata = {
          name: nft.metadata.name || `Lilipad #${tokenId}`,
          description: nft.metadata.description || "",
          external_url: "",
          image: newImageName,
          attributes: nft.metadata.attributes || [],
          properties: {
            files: [
              {
                uri: newImageName,
                type: "image/png"
              }
            ],
            category: "image",
            creators: []
          },
          compiler: "Lilipad NFT Generator"
        };
        
        metadataFolder?.file(`${tokenId}.json`, JSON.stringify(metadata, null, 2));
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${collection.name || 'lilipad'}-collection.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans w-full flex flex-col items-center pt-0 px-0">
      <header className="flex items-center justify-between px-16 py-6 border-b-4 border-green-500 bg-black/95 shadow-lg max-w-4xl w-full mx-auto rounded-b-2xl mt-0 mb-8">
        <span className="text-3xl font-extrabold tracking-tight text-primary select-none">Lilipad</span>
        <button
          className="px-7 py-2 rounded-lg border-2 border-primary text-primary font-bold bg-black/70 cursor-not-allowed opacity-70 hover:opacity-90 transition-all shadow-md"
          disabled
        >
          Connect Wallet
        </button>
      </header>
      <div className="w-full max-w-7xl mx-auto px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-green-500">Preview Collection</h1>
            {collection.name && (
              <p className="text-green-300 mt-2">{collection.name} - {nfts.length} NFTs</p>
            )}
          </div>
          <div className="flex gap-4">
            <Link href="/create/one-of-one">
              <button 
                className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg shadow hover:bg-yellow-300 transition text-base"
                onClick={() => {
                  // Clear localStorage when returning to edit
                  localStorage.removeItem('lilipad-nfts');
                  localStorage.removeItem('lilipad-collection');
                }}
              >
                Return & Edit
              </button>
            </Link>
            <button
              className={`px-6 py-2 font-bold rounded-lg shadow transition text-base ${
                isDownloading 
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                  : 'bg-green-500 text-black hover:bg-green-600'
              }`}
              onClick={downloadCollection}
              disabled={isDownloading || nfts.length === 0}
            >
              {isDownloading ? 'Generating ZIP...' : 'Download All'}
            </button>
          </div>
        </div>
        {/* NFT Grid Preview */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8">
          {nfts.length === 0 ? (
            <div className="col-span-full text-green-300 text-center">
              <p className="text-lg mb-4">No NFTs to preview.</p>
              <Link href="/create/one-of-one">
                <button className="px-6 py-2 bg-green-500 text-black font-bold rounded-lg shadow hover:bg-green-600 transition text-base">
                  Go Back to Create
                </button>
              </Link>
            </div>
          ) : (
            nfts.map(nft => (
              <div key={nft.id} className="bg-black border-2 border-green-700 rounded-xl p-4 flex flex-col items-center shadow-lg">
                <span className="text-xs text-gray-400 font-mono mb-1">ID: {nft.tokenId}</span>
                <img src={nft.image} alt="nft" className="w-32 h-32 object-cover rounded mb-2 border border-green-700" />
                <span className="text-green-400 font-bold text-base mb-1 text-center">{nft.metadata?.name || "Untitled"}</span>
                <div className="text-green-300 text-xs text-center mb-2">{nft.metadata?.description}</div>
                <div className="w-full flex flex-col gap-1 mt-2">
                  {(nft.metadata?.attributes || []).map((attr: { trait_type: string; value: string }, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-green-300">
                      <span className="font-mono text-gray-400">{attr.trait_type}</span>
                      <span className="font-mono text-yellow-400">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 