"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function PhotoModal({ photos, onClose }) {
    const [activeTab, setActiveTab] = useState("before");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const modalRef = useRef(null);

    const currentPhotos = activeTab === "before" ? photos.before : photos.after;

    // ✅ Lock body scroll when modal opens
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // ✅ Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, currentPhotos]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
        setIsZoomed(false);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentIndex(0);
        setIsZoomed(false);
    };

    // ✅ Prevent scroll propagation inside modal
    const handleWheel = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheel} // ✅ Stop scroll propagation
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleTabChange("before")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "before"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            Before ({photos.before?.length || 0})
                        </button>
                        <button
                            onClick={() => handleTabChange("after")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "after"
                                    ? "bg-green-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            After ({photos.after?.length || 0})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Toggle */}
                        <button
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title={isZoomed ? "Zoom Out" : "Zoom In"}
                        >
                            {isZoomed ? (
                                <ZoomOut className="w-5 h-5 text-slate-600" />
                            ) : (
                                <ZoomIn className="w-5 h-5 text-slate-600" />
                            )}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Main Image Viewer */}
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                    {currentPhotos && currentPhotos.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Navigation Buttons */}
                            {currentPhotos.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-2 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-slate-800" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-2 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6 text-slate-800" />
                                    </button>
                                </>
                            )}

                            {/* Current Image */}
                            <div className={`max-w-full max-h-full transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                                }`}
                                onClick={() => setIsZoomed(!isZoomed)}>
                                <img
                                    src={currentPhotos[currentIndex]}
                                    alt={`${activeTab} ${currentIndex + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    loading="lazy" // ✅ Lazy load
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.png'; // Fallback image
                                    }}
                                />
                            </div>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                                {currentIndex + 1} / {currentPhotos.length}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p>No {activeTab} images available</p>
                        </div>
                    )}
                </div>

                {/* Thumbnail Strip - ✅ Virtualized for performance */}

                {/* {currentPhotos && currentPhotos.length > 1 && (
          <div className="border-t border-slate-200 p-4 flex-shrink-0 overflow-x-auto">
            <div className="flex gap-2 min-w-min">
              {currentPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
        )} */}
            </div>
        </div>
    );
}
