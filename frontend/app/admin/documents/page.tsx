'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function DocumentsPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    // Simulated upload - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`File "${selectedFile.name}" uploaded successfully!`);
    setSelectedFile(null);
    setUploading(false);
  };

  // Sample documents list
  const documents = [
    { id: 1, name: 'admissions_policy.txt', size: '12 KB', uploadedAt: '2024-01-15' },
    { id: 2, name: 'fee_structure.txt', size: '8 KB', uploadedAt: '2024-01-15' },
    { id: 3, name: 'hostel_accommodation.txt', size: '15 KB', uploadedAt: '2024-01-15' },
    { id: 4, name: 'academic_programs.txt', size: '18 KB', uploadedAt: '2024-01-15' },
    { id: 5, name: 'placements_career.txt', size: '20 KB', uploadedAt: '2024-01-15' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        </div>
        <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
          Sign Out
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select File</label>
              <Input type="file" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
              )}
            </div>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Supported formats: TXT, PDF, DOCX · Max size: 10MB
          </p>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Indexed Documents ({documents.length})</h3>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-600">
                    {doc.size} · Uploaded {doc.uploadedAt}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
