/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface DocumentManagerProps {
  // Will be used in future implementation
  propertyId?: string;
}

export function DocumentManager({ propertyId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Implement file upload to backend
      // For now, just create mock documents
      const newDocs = Array.from(files).map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
      }));
      setDocuments([...documents, ...newDocs]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#e56e43] text-white rounded-lg"
        >
          Upload Document
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileUpload}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-500">
                  {/* Add document icon based on type */}
                  📄
                </div>
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={doc.url}
                  download={doc.name}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Download
                </a>
                <button
                  onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
