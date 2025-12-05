"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// ✅ Enhanced Photo Modal with HIGHER z-index
const PhotoModal = ({ photos, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // ✅ Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!photos || (!photos.before?.length && !photos.after?.length)) return null;

    // Combine all photos with labels
    const allPhotos = [
        ...(photos.before?.map(url => ({ url, label: "Before", color: "blue" })) || []),
        ...(photos.after?.map(url => ({ url, label: "After", color: "green" })) || [])
    ];

    const currentPhoto = allPhotos[currentIndex];

    // Navigation handlers
    const goToNext = () => {
        if (currentIndex < allPhotos.length - 1) {
            setCurrentIndex(currentIndex + 1);
            resetZoom();
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            resetZoom();
        }
    };

    // Zoom handlers
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => {
        if (zoomLevel > 1) {
            setZoomLevel(prev => Math.max(prev - 0.5, 1));
        } else {
            resetZoom();
        }
    };
    const resetZoom = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse drag handlers for panning
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case "ArrowLeft":
                goToPrevious();
                break;
            case "ArrowRight":
                goToNext();
                break;
            case "+":
            case "=":
                handleZoomIn();
                break;
            case "-":
            case "_":
                handleZoomOut();
                break;
            case "Escape":
                onClose();
                break;
            default:
                break;
        }
    };

    // Wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    return (
        // ✅ INCREASED z-index to 9999 (above ReportModal's z-50)
        <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"
                title="Close (Esc)"
            >
                <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium z-20">
                {currentIndex + 1} / {allPhotos.length}
            </div>

            {/* Main Image Container */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
            >
                <img
                    src={currentPhoto.url}
                    alt={`${currentPhoto.label} ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                    style={{
                        transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                        transformOrigin: 'center center'
                    }}
                    onError={(e) => {
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white'%3EImage not found%3C/text%3E%3C/svg%3E`;
                    }}
                    draggable={false}
                />

                {/* Image Label Badge */}
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold text-lg shadow-lg ${currentPhoto.color === "blue" ? "bg-blue-500" : "bg-green-500"
                    }`}>
                    {currentPhoto.label}
                </div>
            </div>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                    title="Previous"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {currentIndex < allPhotos.length - 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                    title="Next"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black bg-opacity-50 rounded-full px-4 py-3 z-20">
                <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Zoom Out (-)"
                >
                    <ZoomOut size={20} />
                </button>

                <span className="text-white font-medium min-w-[60px] text-center">
                    {Math.round(zoomLevel * 100)}%
                </span>

                <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Zoom In (+)"
                >
                    <ZoomIn size={20} />
                </button>

                <div className="w-px h-6 bg-gray-600 mx-1"></div>

                <button
                    onClick={resetZoom}
                    disabled={zoomLevel === 1}
                    className="text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Reset Zoom"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2 max-w-[90vw] overflow-x-auto z-20">
                {allPhotos.map((photo, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setCurrentIndex(idx);
                            resetZoom();
                        }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${idx === currentIndex
                                ? `border-${photo.color}-500 ring-2 ring-${photo.color}-400`
                                : "border-gray-600 hover:border-gray-400"
                            }`}
                    >
                        <img
                            src={photo.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <span className={`absolute top-1 left-1 ${photo.color === "blue" ? "bg-blue-500" : "bg-green-500"
                            } text-white px-1 text-xs font-semibold rounded`}>
                            {photo.label[0]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Use arrow keys to navigate • Scroll or +/- to zoom • Drag to pan when zoomed
            </div>
        </div>
    );
};

export default PhotoModal;
