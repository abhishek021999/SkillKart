import React, { useState, lazy, Suspense } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  FormControl,
  FormLabel,
  useToast,
  Text,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { baseURL, endpoints } from '../../utils/api';
import axiosInstance from '../../utils/axiosInstance';

const ReactQuill = lazy(() => import('react-quill'));
import 'quill/dist/quill.snow.css';

const ArticleEditorModal = ({ isOpen, onClose, onSave, initialValue }) => {
  const toast = useToast();
  const [title, setTitle] = useState(initialValue?.title || '');
  const [tags, setTags] = useState(initialValue?.tags?.join(', ') || '');
  const [readingTime, setReadingTime] = useState(initialValue?.readingTime || 5);
  const [content, setContent] = useState(initialValue?.content || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    try {
      // Save to backend
      const token = localStorage.getItem('token');
      const res = await fetch(baseURL + endpoints.adminArticles, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          readingTime,
          content,
        }),
      });
      if (res.ok) {
        toast({
          title: 'Article saved successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onSave({
          title,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          readingTime,
          content,
        });
      } else {
        setError('Failed to save article');
      }
    } catch (e) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Article</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article Title" />
            </FormControl>
            <FormControl>
              <FormLabel>Tags (comma separated)</FormLabel>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. react, javascript, webdev" />
            </FormControl>
            <FormControl>
              <FormLabel>Reading Time (minutes)</FormLabel>
              <NumberInput min={1} value={readingTime} onChange={(_, v) => setReadingTime(v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Suspense fallback={<Text>Loading editor...</Text>}>
                <ReactQuill theme="snow" value={content} onChange={setContent} style={{ minHeight: 200 }} />
              </Suspense>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArticleEditorModal;