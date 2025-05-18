import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Progress,
  Text,
  useToast,
  Input,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { baseURL, endpoints } from '../../utils/api';
import axiosInstance from '../../utils/axiosInstance';

const MAX_VIDEO_SIZE_MB = 200; // 200MB limit
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const VideoUploadModal = ({ isOpen, onClose, onUpload, initialUrl }) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialUrl || '');

  const handleFileChange = (e) => {
    setError('');
    const selected = e.target.files[0];
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Unsupported file type. Please upload an MP4, WebM, or OGG video.');
      return;
    }
    if (selected.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_VIDEO_SIZE_MB}MB.`);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(baseURL + endpoints.adminResourcesUpload, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Upload failed.');
      }
      const data = await res.json();
      const url = data.fileUrl || data.url || data;
      setVideoUrl(url);
      setFile(null);
      setUploading(false);
      setProgress(100);
      toast({ title: 'Success', description: 'Video uploaded successfully!', status: 'success', duration: 3000, isClosable: true });
      if (onUpload) onUpload(url);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Video</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Input type="file" accept="video/*" onChange={handleFileChange} isDisabled={uploading} />
            {error && <Alert status="error"><AlertIcon />{error}</Alert>}
            {file && (
              <Box>
                <Text fontSize="sm">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Text>
                <Button colorScheme="blue" onClick={handleUpload} isLoading={uploading} isDisabled={uploading} mt={2}>
                  Upload
                </Button>
              </Box>
            )}
            {uploading && <Progress value={progress} size="sm" colorScheme="blue" />}
            {videoUrl && !uploading && (
              <Box mt={4}>
                <Text fontWeight="bold" mb={2}>Preview:</Text>
                <video src={videoUrl} controls width="100%" style={{ maxHeight: 300 }} />
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost" isDisabled={uploading}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VideoUploadModal; 