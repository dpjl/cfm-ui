
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Gallery, { ImageItem } from '@/components/Gallery';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchImages, deleteImages } from '@/api/imageApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch data for directory1
  const { 
    data: leftImages = [], 
    isLoading: isLoadingLeft 
  } = useQuery({
    queryKey: ['images', 'directory1'],
    queryFn: () => fetchImages('directory1'),
  });
  
  // Fetch data for directory2
  const { 
    data: rightImages = [], 
    isLoading: isLoadingRight 
  } = useQuery({
    queryKey: ['images', 'directory2'],
    queryFn: () => fetchImages('directory2'),
  });
  
  // Mutation for deleting images
  const deleteMutation = useMutation({
    mutationFn: deleteImages,
    onSuccess: () => {
      // Show success message
      toast({
        title: `${selectedImages.length} ${selectedImages.length === 1 ? 'image' : 'images'} deleted`,
        description: "The selected images have been removed successfully.",
      });
      
      // Reset selected images and close the dialog
      setSelectedImages([]);
      setDeleteDialogOpen(false);
      
      // Refetch both image lists to reflect the changes
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting images",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    }
  });
  
  const handleSelectImage = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imageId => imageId !== id)
        : [...prev, id]
    );
  };
  
  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deleteMutation.mutate(selectedImages);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Image Gallery Manager
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Browse and manage images from two different directories side by side.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">
              {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
            </span>
          </div>
          
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={selectedImages.length === 0 || deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Selected'}
          </Button>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 glass-panel p-6"
        >
          <Gallery
            title="Directory 1"
            images={leftImages}
            selectedImages={selectedImages}
            onSelectImage={handleSelectImage}
            isLoading={isLoadingLeft}
          />
          
          <Gallery
            title="Directory 2"
            images={rightImages}
            selectedImages={selectedImages}
            onSelectImage={handleSelectImage}
            isLoading={isLoadingRight}
          />
        </motion.div>
      </motion.div>
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        selectedCount={selectedImages.length}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
