import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Upload, X, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const GalleryUpload = () => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [dragActive, setDragActive] = useState(false);

    const fetchImages = async () => {
        try {
            const res = await api.get('gallery/images/');
            setImages(res.data);
        } catch (err) {
            console.error("Error fetching images:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        setUploading(true);
        setMessage({ text: '', type: '' });
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('caption', file.name.split('.')[0]);

            try {
                await api.post('gallery/images/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                successCount++;
            } catch (err) {
                console.error("Upload error:", err);
                failCount++;
            }
        }

        if (successCount > 0) {
            setMessage({ text: `Successfully uploaded ${successCount} image(s).`, type: 'success' });
            fetchImages();
        }
        if (failCount > 0) {
            setMessage({ text: `Failed to upload ${failCount} image(s).`, type: 'error' });
        }
        setUploading(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await api.delete(`gallery/images/${id}/`);
            setImages(images.filter(img => img.id !== id));
            setMessage({ text: 'Image deleted successfully.', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Failed to delete image.', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-poppins font-black text-school-text tracking-tight">
                        School <span className="text-school-blue">Gallery</span>
                    </h1>
                    <p className="text-sm text-school-body font-medium mt-1">Manage images for your school dashboard slider</p>
                </div>
            </div>

            {/* Upload Section */}
            <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                    dragActive 
                    ? 'border-school-blue bg-school-blue/5 scale-[0.99]' 
                    : 'border-slate-200 bg-white hover:border-school-blue/50 hover:bg-slate-50/50'
                }`}
            >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 ${uploading ? 'animate-bounce bg-school-blue/10 text-school-blue' : 'bg-slate-100 text-slate-400'}`}>
                    {uploading ? <Upload size={32} /> : <ImageIcon size={32} />}
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-school-text">
                        {uploading ? 'Uploading your artistic shots...' : 'Drag and drop school photos here'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Support: JPG, PNG, WEBP (Max 5MB each)</p>
                </div>
                
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
                
                {!uploading && (
                    <button className="mt-2 px-6 py-2.5 bg-school-navy text-white rounded-xl text-sm font-bold hover:bg-school-blue transition-all shadow-lg shadow-school-navy/10 active:scale-95">
                        Select Files
                    </button>
                )}
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {/* Gallery Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h3 className="font-poppins font-bold text-school-text text-lg">Your Gallery</h3>
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {images.length} Images
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No images uploaded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img 
                                    src={img.image} 
                                    alt={img.caption}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <button 
                                        onClick={() => handleDelete(img.id)}
                                        className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors self-end"
                                        title="Delete Image"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryUpload;
