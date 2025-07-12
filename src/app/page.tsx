import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-16 py-6 border-b-4 border-green-500 bg-black/95 shadow-lg max-w-4xl w-full mx-auto rounded-b-2xl">
        <span className="text-3xl font-extrabold tracking-tight text-primary select-none">Lilipad</span>
        <button
          className="px-7 py-2 rounded-lg border-2 border-primary text-primary font-bold bg-black/70 cursor-not-allowed opacity-70 hover:opacity-90 transition-all shadow-md"
          disabled
        >
          Connect Wallet
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-start justify-center pl-12 pt-24 max-w-md w-full">
        <h1 className="text-5xl font-bold mb-2 text-green-500 text-left">
          Welcome
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-yellow-400 text-left">
          to Lilipad NFT Generator
        </h2>
        <p className="text-base text-green-300 mb-8 text-left leading-relaxed">
          Your go to <span className="font-semibold text-primary">no code NFT generator</span> for{' '}
          <Link
            href="https://lilipad.art"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-yellow-400 underline underline-offset-2 hover:text-yellow-300 transition"
          >
            lilipad.art
          </Link>{' '}
          and external marketplaces for <span className="font-semibold text-white">Pepe Unchained V2</span>.
        </p>
        <Link href="/create">
          <button
            className="px-8 py-3 bg-green-500 text-black font-bold rounded-lg shadow hover:bg-green-600 transition text-lg mt-2"
          >
            Get Started
          </button>
        </Link>
      </section>
    </main>
  );
}
