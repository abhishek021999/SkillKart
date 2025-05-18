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
  Input,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Text,
  IconButton,
  Alert,
  AlertIcon,
  Box,
  useToast,
  Divider,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const emptyQuestion = () => ({ question: '', options: ['', ''], correctIndex: 0 });

const QuizEditorModal = ({ isOpen, onClose, onSave, initialValue }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState(initialValue?.length ? initialValue : [emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].question = value;
    setQuestions(updated);
  };
  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };
  const handleCorrectChange = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = parseInt(value);
    setQuestions(updated);
  };
  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.length > 1 ? questions.filter((_, i) => i !== idx) : questions);
  const addOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };
  const removeOption = (qIdx, oIdx) => {
    const updated = [...questions];
    if (updated[qIdx].options.length > 2) {
      updated[qIdx].options.splice(oIdx, 1);
      if (updated[qIdx].correctIndex >= updated[qIdx].options.length) {
        updated[qIdx].correctIndex = 0;
      }
      setQuestions(updated);
    }
  };

  const validate = () => {
    if (!questions.length) return 'At least one question is required.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} is empty.`;
      if (q.options.length < 2) return `Question ${i + 1} must have at least 2 options.`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) return `Option ${j + 1} in question ${i + 1} is empty.`;
      }
      if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= q.options.length) return `Select a correct answer for question ${i + 1}.`;
    }
    return '';
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave(questions);
      onClose();
      toast({ title: 'Quiz saved!', status: 'success', duration: 2000, isClosable: true });
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Quiz</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {error && <Alert status="error"><AlertIcon />{error}</Alert>}
            {questions.map((q, qIdx) => (
              <Box key={qIdx} p={4} borderWidth={1} borderRadius="md" bg="gray.50" boxShadow="sm">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold">Question {qIdx + 1}</Text>
                  <IconButton icon={<DeleteIcon />} aria-label="Delete question" size="sm" colorScheme="red" variant="ghost" onClick={() => removeQuestion(qIdx)} isDisabled={questions.length === 1} />
                </HStack>
                <FormControl mb={2} isRequired>
                  <FormLabel>Question</FormLabel>
                  <Input value={q.question} onChange={e => handleQuestionChange(qIdx, e.target.value)} />
                </FormControl>
                <FormControl mb={2} isRequired>
                  <FormLabel>Options</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    {q.options.map((opt, oIdx) => (
                      <HStack key={oIdx}>
                        <RadioGroup value={q.correctIndex.toString()} onChange={val => handleCorrectChange(qIdx, val)}>
                          <Radio value={oIdx.toString()} colorScheme="green" />
                        </RadioGroup>
                        <Input value={opt} onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                        <IconButton icon={<DeleteIcon />} aria-label="Delete option" size="xs" colorScheme="red" variant="ghost" onClick={() => removeOption(qIdx, oIdx)} isDisabled={q.options.length <= 2} />
                      </HStack>
                    ))}
                    <Button leftIcon={<AddIcon />} size="xs" colorScheme="blue" variant="ghost" onClick={() => addOption(qIdx)} mt={1}>Add Option</Button>
                  </VStack>
                </FormControl>
                <Divider my={2} />
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} colorScheme="brand" variant="outline" onClick={addQuestion}>Add Question</Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="brand" mr={3} onClick={handleSave} isLoading={saving}>Save Quiz</Button>
          <Button variant="ghost" onClick={onClose} isDisabled={saving}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuizEditorModal; 