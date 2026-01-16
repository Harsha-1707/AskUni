'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, RefreshCw, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ingestionLoading, setIngestionLoading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchMetrics();
  }, [token, user, router]);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/admin/metrics');
      setMetrics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics');
      setLoading(false);
    }
  };

  const triggerIngestion = async () => {
    setIngestionLoading(true);
    try {
      await api.post('/admin/ingest');
      alert('Ingestion triggered successfully!');
      await fetchMetrics();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ingestion failed');
    }
    setIngestionLoading(false);
  };

  // Sample data for charts (replace with real data from API)
  const accuracyData = [
    { date: 'Jan', accuracy: 85 },
    { date: 'Feb', accuracy: 88 },
    { date: 'Mar', accuracy: 92 },
    { date: 'Apr', accuracy: 90 },
    { date: 'May', accuracy: 94 },
  ];

  const hallucinationData = [
    { month: 'Jan', rate: 12 },
    { month: 'Feb', rate: 9 },
    { month: 'Mar', rate: 6 },
    { month: 'Apr', rate: 8 },
    { month: 'May', rate: 5 },
  ];

  const queryVolumeData = [
    { day: 'Mon', queries: 120 },
    { day: 'Tue', queries: 150 },
    { day: 'Wed', queries: 180 },
    { day: 'Thu', queries: 140 },
    { day: 'Fri', queries: 200 },
    { day: 'Sat', queries: 90 },
    { day: 'Sun', queries: 70 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
          Sign Out
        </Button>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Queries</p>
                <p className="text-3xl font-bold">{metrics?.total_queries || 0}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-3xl font-bold">92%</p>
              </div>
              <FileText className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hallucination Rate</p>
                <p className="text-3xl font-bold">5%</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">{metrics?.total_users || 0}</p>
              </div>
              <Upload className="w-10 h-10 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={triggerIngestion} disabled={ingestionLoading}>
            <RefreshCw className="mr-2 w-4 h-4" />
            {ingestionLoading ? 'Ingesting...' : 'Trigger Re-Ingestion'}
          </Button>
          <Link href="/admin/documents">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 w-4 h-4" />
              Manage Documents
            </Button>
          </Link>
          <Link href="/admin/feedback">
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 w-4 h-4" />
              View Feedback
            </Button>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Accuracy Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Hallucination Rate */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hallucination Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hallucinationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Query Volume */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Query Volume (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={queryVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="queries" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Failed Queries</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-3">
                <p className="font-medium">Query with low confidence score</p>
                <p className="text-sm text-gray-600">Confidence: 0.3 · 2 hours ago</p>
              </div>
            ))}
          </div>
          <Link href="/admin/failed-queries">
            <Button variant="link" className="mt-4">View All →</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
