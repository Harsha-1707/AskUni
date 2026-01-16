'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import api from '@/lib/api';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    // Simulated feedback data - replace with API call
    setFeedback([
      { id: 1, rating: 5, comment: 'Very accurate answer!', query: 'What is the CSE fee?', createdAt: '2024-01-15' },
      { id: 2, rating: 4, comment: 'Good response', query: 'Hostel facilities?', createdAt: '2024-01-15' },
      { id: 3, rating: 2, comment: 'Answer was incomplete', query: 'MBA specializations', createdAt: '2024-01-14' },
      { id: 4, rating: 5, comment: 'Perfect!', query: 'Placement statistics', createdAt: '2024-01-14' },
      { id: 5, rating: 3, comment: 'Okayish', query: 'Admission process', createdAt: '2024-01-13' },
    ]);
  }, []);

  const filteredFeedback = filter
    ? feedback.filter((f) => f.rating === filter)
    : feedback;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">User Feedback</h1>
        </div>
        <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
          Sign Out
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(null)}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filter === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(rating)}
            >
              {rating} Star
            </Button>
          ))}
        </div>

        {/* Feedback List */}
        <Card className="p-6">
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-1">{renderStars(item.rating)}</div>
                  <span className="text-sm text-gray-500">{item.createdAt}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">"{item.query}"</p>
                {item.comment && (
                  <p className="text-sm text-gray-600">{item.comment}</p>
                )}
              </div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <p className="text-center text-gray-500 py-8">No feedback found</p>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {feedback.filter((f) => f.rating >= 4).length}
            </p>
            <p className="text-sm text-gray-600">Positive (4-5 ⭐)</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {feedback.filter((f) => f.rating === 3).length}
            </p>
            <p className="text-sm text-gray-600">Neutral (3 ⭐)</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {feedback.filter((f) => f.rating <= 2).length}
            </p>
            <p className="text-sm text-gray-600">Negative (1-2 ⭐)</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
