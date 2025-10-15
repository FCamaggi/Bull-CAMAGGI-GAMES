import { useMemo } from 'react';
import { BullRound } from '../types';

// Constantes de validación (deben coincidir con el backend)
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 120;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AnswerValidation {
  validateAnswer: (
    answer: string,
    currentRound?: BullRound
  ) => ValidationResult;
  validatePlayerName: (name: string) => ValidationResult;
  validateLobbyCode: (code: string) => ValidationResult;
}

/**
 * Hook para validaciones del frontend que coinciden con el backend
 */
export function useValidation(): AnswerValidation {
  const validateAnswer = useMemo(() => {
    return (answer: string, currentRound?: BullRound): ValidationResult => {
      const trimmedAnswer = answer.trim();

      // Validar que no esté vacía
      if (trimmedAnswer.length === 0) {
        return {
          isValid: false,
          error: 'La respuesta no puede estar vacía',
        };
      }

      // Validar longitud mínima
      if (trimmedAnswer.length < MIN_ANSWER_LENGTH) {
        return {
          isValid: false,
          error: `La respuesta debe tener al menos ${MIN_ANSWER_LENGTH} caracter`,
        };
      }

      // Validar longitud máxima
      if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
        return {
          isValid: false,
          error: `La respuesta no puede tener más de ${MAX_ANSWER_LENGTH} caracteres`,
        };
      }

      // Si tenemos la ronda actual, validar contra las respuestas correcta/incorrecta
      if (currentRound) {
        const userAnswer = trimmedAnswer.toLowerCase();
        const correctAnswer = currentRound.correctAnswer.toLowerCase();
        const incorrectAnswer = currentRound.incorrectAnswer.toLowerCase();

        if (userAnswer === correctAnswer) {
          return {
            isValid: false,
            error: 'Tu respuesta no puede ser igual a la respuesta correcta',
          };
        }

        if (userAnswer === incorrectAnswer) {
          return {
            isValid: false,
            error:
              'Tu respuesta no puede ser igual a la respuesta incorrecta predefinida',
          };
        }
      }

      return { isValid: true };
    };
  }, []);

  const validatePlayerName = useMemo(() => {
    return (name: string): ValidationResult => {
      const trimmedName = name.trim();

      if (trimmedName.length === 0) {
        return {
          isValid: false,
          error: 'El nombre es obligatorio',
        };
      }

      if (trimmedName.length > 50) {
        return {
          isValid: false,
          error: 'El nombre no puede tener más de 50 caracteres',
        };
      }

      // Validar caracteres permitidos (solo letras, números, espacios, guiones y guiones bajos)
      const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!validPattern.test(trimmedName)) {
        return {
          isValid: false,
          error:
            'El nombre solo puede contener letras, números, espacios, guiones y guiones bajos',
        };
      }

      return { isValid: true };
    };
  }, []);

  const validateLobbyCode = useMemo(() => {
    return (code: string): ValidationResult => {
      const trimmedCode = code.trim().toUpperCase();

      if (trimmedCode.length === 0) {
        return {
          isValid: false,
          error: 'El código del lobby es obligatorio',
        };
      }

      if (trimmedCode.length !== 6) {
        return {
          isValid: false,
          error: 'El código debe tener exactamente 6 caracteres',
        };
      }

      // Validar que solo contenga letras mayúsculas y números
      const validPattern = /^[A-Z0-9]+$/;
      if (!validPattern.test(trimmedCode)) {
        return {
          isValid: false,
          error: 'El código solo puede contener letras mayúsculas y números',
        };
      }

      return { isValid: true };
    };
  }, []);

  return {
    validateAnswer,
    validatePlayerName,
    validateLobbyCode,
  };
}

/**
 * Hook específico para validar respuestas en tiempo real
 */
export function useAnswerValidation(currentRound?: BullRound) {
  const { validateAnswer } = useValidation();

  return useMemo(() => {
    return (answer: string) => validateAnswer(answer, currentRound);
  }, [validateAnswer, currentRound]);
}
