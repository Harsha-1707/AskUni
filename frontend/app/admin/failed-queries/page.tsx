'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function FailedQueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);

  useEffect(() => {
    // Simulated data - replace with API call to get low-confidence queries
    setQueries([
      { id: 1, query: 'Is there a swimming pool?', confidence: 0.2, timestamp: '2024-01-15 10:30' },
      { id: 2, query: 'What about parking facilities?', confidence: 0.3, timestamp: '2024-01-15 09:45' },
      { id: 3, query: 'Do you have aerospace engineering?', confidence: 0.1, timestamp: '2024-01-14 14:20' },
      { id: 4, query: 'Tell me about the canteen menu', confidence: 0.4, timestamp: '2024-01-14 11:15' },
      { id: 5, query: 'Sports facilities available?', confidence: 0.3, timestamp: '2024-01-13 16:00' },
    ]);
  }, []);

  const getConfidenceBadge = (score: number) => {
    if (score < 0.3) return <Badge variant="destructive">Very Low</Badge>;
    if (score < 0.5) return <Badge className="bg-yellow-500">Low</Badge>;
    return <Badge className="bg-orange-500">Moderate</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Failed Queries</h1>
        </div>
        <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
          Sign Out
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-gray-600">
              These queries received low confidence scores (< 0.5), indicating the system couldn't find relevant information.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Low Confidence Queries ({queries.length})
          </h3>
          <div className="space-y-4">
            {queries.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">{item.query}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
                {getConfidenceBadge(item.confidence)}
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">
            Recommendations
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Add documents covering missing topics (sports, parking, canteen)</li>
            <li>Update existing documents with more comprehensive information</li>
            <li>Trigger re-ingestion after adding new documents</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
