import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type MemeTemplateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  templates: { id: string; url: string; name: string }[];
  onSelectTemplate: (template: { id: string; url: string; name: string }) => void;
};

export default function MemeTemplateDialog({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: MemeTemplateDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTemplate = (template: { id: string; url: string; name: string }) => {
    setIsLoading(true);
    // Simulate loading the template (in a real app, this might involve actual processing)
    setTimeout(() => {
      onSelectTemplate(template);
      setIsLoading(false);
      onClose();
    }, 500);
  };

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Choose a Meme Template
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-meme-purple focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                {/* Templates Grid */}
                <div className="h-[400px] overflow-y-auto px-1">
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Array(6).fill(0).map((_, idx) => (
                        <div key={idx} className="aspect-square">
                          <Skeleton height="100%" className="rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                          <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={template.url}
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2 text-center text-sm font-medium text-gray-700 truncate">
                              {template.name}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-3 py-12 text-center">
                          <p className="text-gray-500">No templates found matching "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  )}
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
