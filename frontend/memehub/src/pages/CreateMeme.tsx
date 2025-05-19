import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { TextOverlay } from '@/services/memeService';
import memeService from '@/services/memeService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  X, 
  Plus, 
  Upload, 
  ImageIcon, 
  Text, 
  Wand2, 
  Tag, 
  Save, 
  Pencil, 
  Trash2, 
  Image as ImageLucide,
  ArrowLeft,
  SparkleIcon,
  CheckCircle2,
  Clock,
  Move,
  Info
} from 'lucide-react';
import { getAICaption, getAITags } from '../services/aiService';
import { uploadImageToCloudinary } from '../services/imageUploadService';
import memeTemplates from '../assets/memeTemplates';
import TextOverlayDialog from '@/components/TextOverlayDialog';
import MemeTemplateDialog from '@/components/MemeTemplateDialog';
import { cleanCaption } from '@/lib/utils';
import './CreateMeme.css';

// Extend the TextOverlay interface for local use
interface ExtendedTextOverlay extends TextOverlay {
  stroke?: boolean;
  strokeColor?: string;
}

export default function CreateMeme() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textOverlays, setTextOverlays] = useState<ExtendedTextOverlay[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [aiCaptions, setAiCaptions] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [showCaptionSuggestions, setShowCaptionSuggestions] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [editingOverlay, setEditingOverlay] = useState<ExtendedTextOverlay | undefined>(undefined);
  const [showTextOverlayDialog, setShowTextOverlayDialog] = useState(false);
  const [showMemeTemplateDialog, setShowMemeTemplateDialog] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ id: string | null; offset: { x: number; y: number } | null }>({ id: null, offset: null });
  
  const formattedTemplates = memeTemplates.map((url, index) => ({
    id: `template-${index}`,
    url,
    name: `Template ${index + 1}`
  }));

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('Please log in to create memes');
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setImage(selectedFile);
    setSelectedTemplate(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleTemplateSelect = (template: { id: string; url: string; name: string }) => {
    setSelectedTemplate(template.url);
    setImage(null);
    setImagePreviewUrl(template.url);
    toast.success(`Selected template: ${template.name}`);
  };

  const addTextOverlay = () => {
    setEditingOverlay(undefined);
    setShowTextOverlayDialog(true);
  };

  const editTextOverlay = (overlay: ExtendedTextOverlay) => {
    setEditingOverlay(overlay);
    setShowTextOverlayDialog(true);
  };

  const saveTextOverlay = (overlay: ExtendedTextOverlay) => {
    if (editingOverlay) {
      setTextOverlays(textOverlays.map(o => o.id === overlay.id ? overlay : o));
    } else {
      setTextOverlays([...textOverlays, overlay]);
    }
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
    toast.success('Text overlay removed');
  };

  const getOverlayById = (id: string) => textOverlays.find(o => o.id === id);

  const handleDragStart = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setActiveDragId(id);
    dragState.current.id = id;
    if (e && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const overlay = getOverlayById(id);
      if (overlay) {
        const overlayX = rect.left + (overlay.x / 100) * rect.width;
        const overlayY = rect.top + (overlay.y / 100) * rect.height;
        dragState.current.offset = { x: e.clientX - overlayX, y: e.clientY - overlayY };
      }
    }
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragStop);
  };

  const handleDragMove = (e: MouseEvent) => {
    const id = dragState.current.id;
    const offset = dragState.current.offset;
    if (!id || !imageContainerRef.current || !offset) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left - offset.x) / rect.width) * 100;
    let y = ((e.clientY - rect.top - offset.y) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setTextOverlays(prev => prev.map(overlay =>
      overlay.id === id ? { ...overlay, x, y } : overlay
    ));
  };

  const handleDragStop = () => {
    setActiveDragId(null);
    dragState.current.id = null;
    dragState.current.offset = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragStop);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAICaption = async () => {
    if (!image && !selectedTemplate) {
      toast.error('Please upload an image or select a template first');
      return;
    }
    setAiLoading(true);
    toast.loading('AI is generating captions...');
    try {
      const url = image ? await uploadImageToCloudinary(image) : selectedTemplate!;
      const captionRaw = await getAICaption(url);
      let options: string[] = [];
      if (captionRaw.includes('Option')) {
        options = captionRaw.split(/\*\*Option [0-9]+.*?\*\*|Option [0-9]+.*?:/i).map(s => s.trim()).filter(Boolean);
      } else if (captionRaw.includes('\n')) {
        options = captionRaw.split(/\n+/).map(s => s.trim()).filter(Boolean);
      } else {
        options = [captionRaw];
      }
      // Clean up: remove leading *, quotes, and whitespace
      options = options.map(caption => cleanCaption(caption)).filter(Boolean);
      setAiCaptions(options.slice(0, 5));
      setShowCaptionSuggestions(true);
      toast.dismiss();
      toast.success('Caption suggestions ready!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to generate caption');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAITags = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title or generate a caption first');
      return;
    }
    setAiLoading(true);
    toast.loading('AI is generating tags...');
    try {
      const tagsRaw = await getAITags(title);
      let tags: string[] = Array.isArray(tagsRaw) ? tagsRaw : String(tagsRaw).split(',').map(t => t.trim()).filter(Boolean);
      // Filter out junk tags
      tags = tags.filter(tag =>
        tag &&
        !tag.toLowerCase().includes('here are') &&
        !tag.toLowerCase().includes('comma-separated') &&
        !tag.toLowerCase().includes('for that meme') &&
        !tag.toLowerCase().includes('relevant') &&
        !tag.toLowerCase().includes('short')
      );
      setAiTags(tags.slice(0, 5));
      setShowTagSuggestions(true);
      toast.dismiss();
      toast.success('Tag suggestions ready!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to generate tags');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image && !selectedTemplate) {
      toast.error('Please upload an image or select a template');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      setIsSubmitting(true);
      toast.loading('Creating your meme...');

      // 1. Upload to Cloudinary (if not already a Cloudinary URL)
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      } else if (selectedTemplate) {
        // If template is already a Cloudinary URL, use as is; otherwise, upload
        if (selectedTemplate.includes('res.cloudinary.com')) {
          imageUrl = selectedTemplate;
        } else {
          // Fetch template image, convert to File, upload to Cloudinary
          const response = await fetch(selectedTemplate);
          const blob = await response.blob();
          let fileType = 'image/jpeg';
          if (blob.type && blob.type.startsWith('image/')) fileType = blob.type;
          const file = new File([blob], 'template-meme.jpg', { type: fileType });
          imageUrl = await uploadImageToCloudinary(file);
        }
      }

      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Convert the extended text overlays to the format expected by the API
      const apiTextOverlays = textOverlays.map(({ stroke, strokeColor, ...overlay }) => overlay);

      // 2. Send meme data to backend (JSON, not FormData)
      const memePayload = {
        title,
        imageUrl,
        tags,
        textOverlays: apiTextOverlays,
      };
      console.log('Submitting memePayload:', memePayload);
      const result = await memeService.createMeme(memePayload);
      toast.dismiss();
      toast.success('Meme created successfully!');
      navigate(`/memes/${result.id}`);
    } catch (error) {
      console.error('Failed to create meme:', error);
      toast.dismiss();
      toast.error('Failed to create meme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center mb-6 justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Meme</h1>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !imagePreviewUrl || !title.trim()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Meme
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main meme editor area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === "upload" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                onClick={() => setActiveTab("upload")}
              >
                <Upload size={18} className="inline-block mr-2" />
                Upload Image
              </button>
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === "template" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                onClick={() => setActiveTab("template")}
              >
                <ImageLucide size={18} className="inline-block mr-2" />
                Use Template
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === "upload" ? (
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="mb-3">
                    <Upload className="h-12 w-12 mx-auto text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">Click to upload</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  
                  <div className="mt-4 text-xs text-center text-purple-500 flex items-center justify-center">
                    <Info size={12} className="mr-1" /> Best quality: 1200×800 pixels
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button 
                    type="button"
                    className="w-full py-6 flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-400 transition-colors" 
                    onClick={() => setShowMemeTemplateDialog(true)}
                  >
                    <ImageLucide className="h-12 w-12 text-gray-300" />
                    <span className="text-lg font-medium text-gray-700">Choose Template</span>
                    <span className="text-sm text-gray-500">Select from popular meme templates</span>
                    
                    <div className="mt-4 text-xs text-center text-purple-500 flex items-center justify-center">
                      <SparkleIcon size={12} className="mr-1" /> {formattedTemplates.length}+ templates available
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            {imagePreviewUrl && (
              <div className="p-0 pb-4 mt-2">
                <div 
                  ref={imageContainerRef}
                  className="relative border-0 overflow-hidden rounded bg-gray-800 mb-0 meme-preview-container"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {textOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      id={overlay.id}
                      className={`text-overlay enhanced-text-shadow ${activeDragId === overlay.id ? 'dragging' : ''}`}
                      style={{
                        position: 'absolute',
                        top: `${overlay.y}%`,
                        left: `${overlay.x}%`,
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        fontFamily: overlay.fontFamily,
                        textAlign: overlay.textAlign as any,
                        transform: 'translate(-50%, -50%)',
                        textShadow: overlay.stroke ? 
                          `1px 1px 0 ${overlay.strokeColor || '#000000'}, -1px -1px 0 ${overlay.strokeColor || '#000000'}, 1px -1px 0 ${overlay.strokeColor || '#000000'}, -1px 1px 0 ${overlay.strokeColor || '#000000'}` : 'none',
                      }}
                      onMouseDown={(e) => handleDragStart(overlay.id, e)}
                      tabIndex={0}
                    >
                      {overlay.text}
                      <div className="drag-handle">
                        <Move size={8} className="text-white" />
                      </div>
                    </div>
                  ))}
                  <div className="position-guide">
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                    <div className="position-guide-cell"></div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTextOverlay}
                    className="mx-1"
                  >
                    <Plus size={16} className="mr-1" /> Add Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mx-1"
                    onClick={() => {
                      setImage(null);
                      setImagePreviewUrl('');
                      setSelectedTemplate(null);
                      setTextOverlays([]);
                    }}
                  >
                    <Trash2 size={16} className="mr-1" /> Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Meme Details Card */}
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-medium">Meme Details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label htmlFor="title" className="mb-1.5 text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title"
                  className="enhanced-input"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="mb-1.5 text-sm font-medium text-gray-700">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="funny, cat, reaction"
                  className="enhanced-input"
                />
                {tagsInput && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tagsInput.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={aiLoading || !imagePreviewUrl}
                  onClick={handleAICaption}
                  className="flex-1"
                >
                  {aiLoading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 size={16} className="mr-2" />
                  )}
                  AI Caption
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={aiLoading || !title}
                  onClick={handleAITags}
                  className="flex-1"
                >
                  {aiLoading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Tag size={16} className="mr-2" />
                  )}
                  AI Tags
                </Button>
              </div>

              {showCaptionSuggestions && aiCaptions.length > 0 && (
                <div className="mt-4 p-4 border border-gray-100 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-sm font-medium text-purple-700">
                      <SparkleIcon className="h-4 w-4 mr-2" />
                      AI Caption Suggestions
                    </span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowCaptionSuggestions(false);
                        setAiCaptions([]);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {aiCaptions.filter(caption =>
                      !caption.toLowerCase().includes('here are') &&
                      !caption.toLowerCase().includes('suggestion')
                    ).map((caption, idx) => (
                      <div 
                        key={idx} 
                        className="relative p-2 border border-transparent hover:border-purple-200 rounded-md bg-white"
                      >
                        <p className="pr-20 text-sm">{cleanCaption(caption)}</p>
                        <Button
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => {
                            setTitle(cleanCaption(caption));
                            setShowCaptionSuggestions(false);
                            setAiCaptions([]);
                            toast.success('Caption applied!');
                          }}
                        >
                          Use This
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {showTagSuggestions && aiTags.length > 0 && (
                <div className="mt-4 p-4 border border-gray-100 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-sm font-medium text-purple-700">
                      <SparkleIcon className="h-4 w-4 mr-2" />
                      AI Tag Suggestions
                    </span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowTagSuggestions(false);
                        setAiTags([]);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {aiTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="bg-white text-sm border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        onClick={() => {
                          const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
                          if (!currentTags.includes(tag)) {
                            const newTags = [...currentTags, tag];
                            setTagsInput(newTags.join(', '));
                            toast.success(`Added tag: ${tag}`);
                          }
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Text Overlays */}
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-medium">Text Overlays</h3>
            </div>
            <div className="p-5">
              {!imagePreviewUrl ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  <Text className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-600 font-medium">No image selected</p>
                  <p className="text-sm text-gray-500 mt-1">Upload an image to add text</p>
                </div>
              ) : textOverlays.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  <Text className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-600 font-medium">No text overlays yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add text to make your meme more expressive</p>
                  <Button
                    type="button"
                    onClick={addTextOverlay}
                    className="mt-4"
                    variant="outline"
                    size="sm"
                  >
                    <Plus size={16} className="mr-2" /> Add Text
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
                    {textOverlays.map((overlay) => (
                      <div 
                        key={overlay.id} 
                        className="p-3 border rounded-md bg-gray-50 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <p 
                            className="font-medium pr-8 truncate flex-1" 
                            style={{ 
                              fontFamily: overlay.fontFamily,
                              color: overlay.color,
                              textAlign: overlay.textAlign as any,
                              textShadow: overlay.stroke ? `1px 1px 0 ${overlay.strokeColor || '#000000'}, -1px -1px 0 ${overlay.strokeColor || '#000000'}, 1px -1px 0 ${overlay.strokeColor || '#000000'}, -1px 1px 0 ${overlay.strokeColor || '#000000'}` : 'none',
                            }}
                          >
                            {overlay.text}
                          </p>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => editTextOverlay(overlay)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeTextOverlay(overlay.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span>
                            {overlay.fontFamily}, {overlay.fontSize}px
                          </span>
                          <span className="ml-auto flex items-center gap-1">
                            <Move className="h-3 w-3" /> {Math.round(overlay.x)}%, {Math.round(overlay.y)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={addTextOverlay}
                    className="w-full mt-3"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" /> Add Another Text
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <TextOverlayDialog
        isOpen={showTextOverlayDialog}
        onClose={() => setShowTextOverlayDialog(false)}
        initialOverlay={editingOverlay}
        onSave={saveTextOverlay}
      />

      <MemeTemplateDialog
        isOpen={showMemeTemplateDialog}
        onClose={() => setShowMemeTemplateDialog(false)}
        templates={formattedTemplates}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}
