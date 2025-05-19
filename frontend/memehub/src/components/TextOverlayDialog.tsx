import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { X, Type, Move, AlignLeft, AlignCenter, AlignRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextOverlay } from '@/services/memeService';

// Extend the TextOverlay interface for local use
interface ExtendedTextOverlay extends TextOverlay {
  stroke?: boolean;
  strokeColor?: string;
  position?: { x: number; y: number };
}

type TextOverlayDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialOverlay?: ExtendedTextOverlay;
  onSave: (overlay: ExtendedTextOverlay) => void;
};

export default function TextOverlayDialog({
  isOpen,
  onClose,
  initialOverlay,
  onSave,
}: TextOverlayDialogProps) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [stroke, setStroke] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#000000');

  // Set initial values when editing an existing overlay
  useEffect(() => {
    if (initialOverlay) {
      setText(initialOverlay.text);
      setFontSize(initialOverlay.fontSize || 24);
      setColor(initialOverlay.color || '#FFFFFF');
      setPosition(initialOverlay.position || { x: initialOverlay.x || 50, y: initialOverlay.y || 50 });
      setFontFamily(initialOverlay.fontFamily || 'Impact');
      setTextAlign(initialOverlay.textAlign || 'center');
      setStroke(initialOverlay.stroke !== undefined ? initialOverlay.stroke : true);
      setStrokeColor(initialOverlay.strokeColor || '#000000');
    } else {
      // Reset to defaults for new overlays
      setText('');
      setFontSize(24);
      setColor('#FFFFFF');
      setPosition({ x: 50, y: 50 });
      setFontFamily('Impact');
      setTextAlign('center');
      setStroke(true);
      setStrokeColor('#000000');
    }
  }, [initialOverlay, isOpen]);

  const handleSave = () => {
    const overlay: ExtendedTextOverlay = {
      id: initialOverlay?.id || Date.now().toString(),
      text,
      fontSize,
      color,
      x: position.x,
      y: position.y,
      position,
      fontFamily,
      textAlign,
      stroke,
      strokeColor,
      fontWeight: 'normal', // Default value
      fontStyle: 'normal',  // Default value
    };
    onSave(overlay);
    onClose();
  };

  const fontOptions = [
    { id: 'impact', name: 'Impact', value: 'Impact' },
    { id: 'arial', name: 'Arial', value: 'Arial, sans-serif' },
    { id: 'comic', name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
    { id: 'times', name: 'Times New Roman', value: '"Times New Roman", serif' },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    {initialOverlay ? 'Edit Text Overlay' : 'Add Text Overlay'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Type className="h-4 w-4 mr-1" />
                      Text
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-meme-purple"
                      rows={2}
                      placeholder="Enter your meme text..."
                    />
                  </div>
                  
                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font
                    </label>
                    <RadioGroup value={fontFamily} onChange={setFontFamily} className="mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        {fontOptions.map((option) => (
                          <RadioGroup.Option
                            key={option.id}
                            value={option.value}
                            className={({ active, checked }) => `
                              ${checked ? 'bg-meme-purple/10 border-meme-purple' : 'bg-white border-gray-200'}
                              relative flex cursor-pointer rounded-lg px-3 py-2 border focus:outline-none
                            `}
                          >
                            {({ checked }) => (
                              <>
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="text-sm" style={{ fontFamily: option.value }}>
                                      <RadioGroup.Label as="p" className={`font-medium ${checked ? 'text-meme-purple' : 'text-gray-900'}`}>
                                        {option.name}
                                      </RadioGroup.Label>
                                    </div>
                                  </div>
                                  {checked && (
                                    <div className="shrink-0 text-meme-purple">
                                      <CheckCircle className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Text Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alignment
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setTextAlign('left')}
                        className={`flex-1 py-2 border rounded-md ${
                          textAlign === 'left' ? 'bg-meme-purple/10 border-meme-purple' : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('center')}
                        className={`flex-1 py-2 border rounded-md ${
                          textAlign === 'center' ? 'bg-meme-purple/10 border-meme-purple' : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('right')}
                        className={`flex-1 py-2 border rounded-md ${
                          textAlign === 'right' ? 'bg-meme-purple/10 border-meme-purple' : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        <AlignRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="h-10 w-10 border-0 p-0"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="ml-2 w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-meme-purple"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Outline
                        </label>
                        <div className="ml-auto">
                          <input
                            type="checkbox"
                            checked={stroke}
                            onChange={(e) => setStroke(e.target.checked)}
                            className="h-4 w-4 text-meme-purple focus:ring-meme-purple border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          disabled={!stroke}
                          className={`h-10 w-10 border-0 p-0 ${!stroke ? 'opacity-50' : ''}`}
                        />
                        <input
                          type="text"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          disabled={!stroke}
                          className={`ml-2 w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-meme-purple ${!stroke ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Position */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Move className="h-4 w-4 mr-1" />
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Horizontal: {position.x}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={position.x}
                          onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Vertical: {position.y}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={position.y}
                          onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                  {/* Preview */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Text Preview:</label>
                  <div className="flex flex-col space-y-2">
                    <div 
                      className="p-4 text-center rounded-md border bg-white"
                      style={{
                        color,
                        fontFamily,
                        fontSize: `${fontSize}px`,
                        textAlign,
                        textShadow: stroke ? `1px 1px 0 ${strokeColor}, -1px -1px 0 ${strokeColor}, 1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor}` : 'none',
                      }}
                    >
                      {text || 'Text Preview'}
                    </div>
                    <div 
                      className="p-4 text-center rounded-md border bg-gray-900"
                      style={{
                        color,
                        fontFamily,
                        fontSize: `${fontSize}px`,
                        textAlign,
                        textShadow: stroke ? `1px 1px 0 ${strokeColor}, -1px -1px 0 ${strokeColor}, 1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor}` : 'none',
                      }}
                    >
                      {text || 'Text Preview'}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-white bg-meme-purple rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={handleSave}
                    disabled={!text.trim()}
                  >
                    {initialOverlay ? 'Update' : 'Add'} Text
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
