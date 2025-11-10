'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
  currentImage?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function ImageUpload({
  onUploadComplete,
  folder = 'misc',
  currentImage,
  maxSizeMB = 5,
  label = 'Image'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = () => fileInputRef.current?.click();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Allowed: JPEG, PNG, WebP');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Max size ${maxSizeMB}MB`);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUploadComplete(data.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
        onChange={handleFileSelect}
      />

      <div
        className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border ${
          preview ? 'border-gray-200 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600'
        } bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-gray-900`}
      >
        {preview ? (
          <div className="relative w-full">
            <div className="relative mx-auto aspect-square w-40">
              <Image
                src={preview}
                alt="Uploaded preview"
                fill
                className="rounded-lg object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={pick}
                disabled={isUploading}
                className="w-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-center text-sm font-medium text-white transition-shadow hover:shadow-md disabled:opacity-50"
              >
                {isUploading ? 'Uploading…' : 'Change Image'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setError('');
                }}
                disabled={isUploading}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center space-y-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload an image (JPEG, PNG, WebP)
            </p>
            <button
              type="button"
              onClick={pick}
              disabled={isUploading}
              className="w-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-center text-sm font-medium text-white transition-shadow hover:shadow-md disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Select File'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Max size {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}