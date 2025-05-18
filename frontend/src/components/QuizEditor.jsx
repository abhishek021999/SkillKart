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
  FormControl,
  FormLabel,
  Input,
  Stack,
  Box,
  RadioGroup,
  Radio,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const QuizEditor = ({ isOpen, onClose, quizData = [], onSave }) => {
  const [questions, setQuestions] = useState(quizData.length ? quizData : [
    { question: '', options: ['', ''], correctIndex: 0 }
  ]);

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

  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    const updated = [...questions];
    updated[qIdx].options.splice(oIdx, 1);
    if (updated[qIdx].correctIndex >= updated[qIdx].options.length) {
      updated[qIdx].correctIndex = 0;
    }
    setQuestions(updated);
  };

  const handleCorrectOption = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = parseInt(value);
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctIndex: 0 }]);
  };

  const handleRemoveQuestion = (idx) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const handleSave = () => {
    onSave(questions);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Quiz</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6} maxH="60vh" overflowY="auto">
            {questions.map((q, qIdx) => (
              <Box key={qIdx} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                <Stack direction="row" justify="space-between" align="center">
                  <FormControl mb={2} flex={1}>
                    <FormLabel>Question {qIdx + 1}</FormLabel>
                    <Input
                      value={q.question}
                      onChange={e => handleQuestionChange(qIdx, e.target.value)}
                      placeholder="Enter question text"
                    />
                  </FormControl>
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete question"
                    colorScheme="red"
                    size="sm"
                    ml={2}
                    onClick={() => handleRemoveQuestion(qIdx)}
                    isDisabled={questions.length === 1}
                  />
                </Stack>
                <FormControl mt={2}>
                  <FormLabel>Options</FormLabel>
                  <RadioGroup
                    value={q.correctIndex.toString()}
                    onChange={val => handleCorrectOption(qIdx, val)}
                  >
                    <Stack spacing={2}>
                      {q.options.map((opt, oIdx) => (
                        <Stack direction="row" align="center" key={oIdx}>
                          <Radio value={oIdx.toString()} />
                          <Input
                            value={opt}
                            onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete option"
                            size="xs"
                            colorScheme="red"
                            ml={2}
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            isDisabled={q.options.length <= 2}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </RadioGroup>
                  <Button
                    leftIcon={<AddIcon />}
                    size="xs"
                    mt={2}
                    onClick={() => handleAddOption(qIdx)}
                  >
                    Add Option
                  </Button>
                </FormControl>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={handleAddQuestion} colorScheme="blue" variant="outline">
              Add Question
            </Button>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Quiz
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuizEditor; 