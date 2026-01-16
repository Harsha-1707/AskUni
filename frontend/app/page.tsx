import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">AskUni</h1>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered
            <span className="text-blue-600"> University Assistant</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get instant, accurate answers about admissions, courses, fees, and university policies.
            Powered by advanced RAG technology.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Asking Questions
            </Button>
          </Link>
        </div>

        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Accurate Answers</h3>
            <p className="text-gray-600">
              Get precise information from verified university documents with source citations.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Responses</h3>
            <p className="text-gray-600">
              No more searching through endless PDFs. Get answers in seconds.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Trustworthy</h3>
            <p className="text-gray-600">
              Every answer includes confidence scores and source attribution.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
