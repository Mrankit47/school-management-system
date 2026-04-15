import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const ImageSlider = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await api.get('gallery/images/');
                setImages(res.data);
            } catch (err) {
                console.error("Error fetching gallery images:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [images]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    if (loading) {
        return (
            <div className="w-full h-full bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center">
                <ImageIcon className="text-slate-300 animate-bounce" size={48} />
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="w-full h-full bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-8">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-center">Your school moments will appear here!</p>
                <p className="text-xs text-center mt-2 px-6">Upload images in the Gallery section to showcase your school's best highlights.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-slate-200/50 border border-white/10">
            {/* Images Container */}
            <div className="flex w-full h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((img) => (
                    <div key={img.id} className="min-w-full h-full relative">
                        <img 
                            src={img.image} 
                            alt={img.caption || 'School highlight'} 
                            className="w-full h-full object-cover" 
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Caption Area */}
                        {img.caption && (
                            <div className="absolute bottom-10 left-10 right-10 animate-in slide-in-from-bottom-5 duration-700">
                                <span className="px-3 py-1 bg-school-blue text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">Highlight</span>
                                <h3 className="text-white text-2xl font-poppins font-black leading-tight drop-shadow-lg">{img.caption}</h3>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageSlider;
