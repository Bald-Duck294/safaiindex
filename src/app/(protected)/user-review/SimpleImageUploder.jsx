
// Simple Frontend Image Component (NO Cloudinary SDK needed)

"use client";

import { useState, useRef } from "react";
import { Camera, X, Upload, CheckCircle } from "lucide-react";
import imageCompression from "browser-image-compression"; // Only for compression
import Image from "next/image";

export default function SimpleImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  maxSizeKB = 500,
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression error:", error);
      return file; // Return original if compression fails
    }
  };

  const handleFileSelect = async (files) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setLoading(true);
    const newImages = [];

    try {
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          alert(`File "${file.name}" is not an image`);
          continue;
        }

        // Compress the image
        const compressedFile = await compressImage(file);
        newImages.push(compressedFile);
      }

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Error processing images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={images.length >= maxImages || loading}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <Camera className="h-5 w-5 mr-2" />
          Take Photo
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages || loading}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Files
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-blue-700">Compressing images...</span>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Image
                src={URL.createObjectURL(image)}
                alt={`Photo ${index + 1}`}
                width={400}
                height={250}
                className="w-full h-64 object-cover rounded-lg"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium truncate">{image.name}</div>
                <div className="text-gray-500">
                  {Math.round(image.size / 1024)}KB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
