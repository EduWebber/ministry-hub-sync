import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  EstudanteWithProgress,
  StudentQualifications,
  StudentProgress,
  ProgressLevel,
  SpeechType,
  InstructorDashboardData,
  DragDropResult
} from '@/types/estudantes';

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

export const useInstructorDashboard = () => {
  const [data, setData] = useState<InstructorDashboardData>({
    students_by_progress: {
      beginning: [],
      developing: [],
      qualified: [],
      advanced: []
    },
    students_by_speech_type: {
      bible_reading: [],
      initial_call: [],
      return_visit: [],
      bible_study: [],
      talk: [],
      demonstration: []
    },
    recent_updates: [],
    statistics: {
      total_students: 0,
      by_progress_level: {
        beginning: 0,
        developing: 0,
        qualified: 0,
        advanced: 0
      },
      by_speech_type: {
        bible_reading: 0,
        initial_call: 0,
        return_visit: 0,
        bible_study: 0,
        talk: 0,
        demonstration: 0
      },
      active_students: 0,
      needs_attention: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load students with progress data
  const loadStudentsData = useCallback(async () => {
    // If in mock mode, return mock data
    if (isMockMode) {
      console.log('🧪 Mock mode: returning mock instructor dashboard data');
      setLoading(true);
      setError(null);

      // Mock students data
      const mockStudents: EstudanteWithProgress[] = [
        {
          id: 'mock-student-1',
          genero: 'masculino',
          ativo: true,
          created_at: new Date().toISOString(),
          profile_id: 'mock-profile-1',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: null,
          disponibilidade: null,
          qualificacoes: null,
          progress: {
            student_id: 'mock-student-1',
            progress_level: 'qualified',
            qualifications: {
              bible_reading: true,
              initial_call: true,
              return_visit: true,
              bible_study: true,
              talk: true,
              demonstration: true,
              can_be_helper: true,
              can_teach_others: false
            },
            total_assignments: 15,
            updated_at: new Date().toISOString(),
            updated_by: 'system'
          },
          qualifications: {
            bible_reading: true,
            initial_call: true,
            return_visit: true,
            bible_study: true,
            talk: true,
            demonstration: true,
            can_be_helper: true,
            can_teach_others: false
          },
          pai_mae: null,
          filhos: [],
          familia: 'Família Silva',
          congregacao: 'Congregação Central',
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: false,
          starting: false,
          following: false,
          making: false,
          explaining: false,
          talk: false
        },
        {
          id: 'mock-student-2',
          genero: 'feminino',
          ativo: true,
          created_at: new Date().toISOString(),
          profile_id: 'mock-profile-2',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: null,
          disponibilidade: null,
          qualificacoes: null,
          progress: {
            student_id: 'mock-student-2',
            progress_level: 'developing',
            qualifications: {
              bible_reading: false,
              initial_call: true,
              return_visit: true,
              bible_study: false,
              talk: false,
              demonstration: true,
              can_be_helper: false,
              can_teach_others: false
            },
            total_assignments: 8,
            updated_at: new Date().toISOString(),
            updated_by: 'system'
          },
          qualifications: {
            bible_reading: false,
            initial_call: true,
            return_visit: true,
            bible_study: false,
            talk: false,
            demonstration: true,
            can_be_helper: false,
            can_teach_others: false
          },
          pai_mae: null,
          filhos: [],
          familia: 'Família Santos',
          congregacao: 'Congregação Central',
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: false,
          starting: false,
          following: false,
          making: false,
          explaining: false,
          talk: false
        }
      ];

      // Organize data by progress level
      const studentsByProgress: Record<ProgressLevel, EstudanteWithProgress[]> = {
        beginning: mockStudents.filter(s => s.progress?.progress_level === 'beginning'),
        developing: mockStudents.filter(s => s.progress?.progress_level === 'developing'),
        qualified: mockStudents.filter(s => s.progress?.progress_level === 'qualified'),
        advanced: mockStudents.filter(s => s.progress?.progress_level === 'advanced')
      };

      // Organize data by speech type
      const studentsBySpeechType: Record<SpeechType, EstudanteWithProgress[]> = {
        bible_reading: mockStudents.filter(s => s.qualifications?.bible_reading),
        initial_call: mockStudents.filter(s => s.qualifications?.initial_call),
        return_visit: mockStudents.filter(s => s.qualifications?.return_visit),
        bible_study: mockStudents.filter(s => s.qualifications?.bible_study),
        talk: mockStudents.filter(s => s.qualifications?.talk),
        demonstration: mockStudents.filter(s => s.qualifications?.demonstration)
      };

      // Calculate statistics
      const statistics = {
        total_students: mockStudents.length,
        by_progress_level: {
          beginning: studentsByProgress.beginning.length,
          developing: studentsByProgress.developing.length,
          qualified: studentsByProgress.qualified.length,
          advanced: studentsByProgress.advanced.length
        },
        by_speech_type: {
          bible_reading: studentsBySpeechType.bible_reading.length,
          initial_call: studentsBySpeechType.initial_call.length,
          return_visit: studentsBySpeechType.return_visit.length,
          bible_study: studentsBySpeechType.bible_study.length,
          talk: studentsBySpeechType.talk.length,
          demonstration: studentsBySpeechType.demonstration.length
        },
        active_students: mockStudents.filter(s => s.ativo).length,
        needs_attention: studentsByProgress.beginning.length + 
                        mockStudents.filter(s => {
                          const qualCount = Object.values(s.qualifications || {}).filter(Boolean).length;
                          return qualCount < 3;
                        }).length
      };

      setData({
        students_by_progress: studentsByProgress,
        students_by_speech_type: studentsBySpeechType,
        recent_updates: [],
        statistics
      });

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (studentsError) throw studentsError;

      // For now, we'll simulate progress and qualifications data
      // In a real implementation, this would come from additional tables
      const studentsWithProgress: EstudanteWithProgress[] = (students || []).map(student => {
        // Simulate progress level based on student data
        // Since cargo is in the profile table, we'll use a default approach for the real implementation
        const getProgressLevel = (): ProgressLevel => {
          // In a real implementation, we would join with profiles to get the cargo
          // For now, we'll use a simple heuristic based on other fields
          return 'qualified'; // Default for demo purposes
        };

        // Simulate qualifications based on S-38-T rules
        const getQualifications = (): StudentQualifications => {
          const progressLevel = getProgressLevel();
          const isMale = student.genero === 'masculino';
          // In a real implementation, we would check the cargo from profiles
          const isQualified = true; // Default for demo purposes

          return {
            bible_reading: isMale && progressLevel !== 'beginning',
            initial_call: true, // All students can do initial calls
            return_visit: progressLevel !== 'beginning',
            bible_study: progressLevel === 'qualified' || progressLevel === 'advanced',
            talk: isMale && isQualified,
            demonstration: true, // All students can do demonstrations
            can_be_helper: progressLevel === 'qualified' || progressLevel === 'advanced',
            can_teach_others: progressLevel === 'advanced'
          };
        };

        const progressLevel = getProgressLevel();
        const qualifications = getQualifications();

        return {
          ...student,
          progress: {
            student_id: student.id,
            progress_level: progressLevel,
            qualifications,
            total_assignments: Math.floor(Math.random() * 20) + 1,
            updated_at: new Date().toISOString(),
            updated_by: 'system'
          },
          qualifications
        };
      });

      // Organize data by progress level
      const studentsByProgress: Record<ProgressLevel, EstudanteWithProgress[]> = {
        beginning: [],
        developing: [],
        qualified: [],
        advanced: []
      };

      studentsWithProgress.forEach(student => {
        const level = student.progress?.progress_level || 'beginning';
        studentsByProgress[level].push(student);
      });

      // Organize data by speech type
      const studentsBySpeechType: Record<SpeechType, EstudanteWithProgress[]> = {
        bible_reading: [],
        initial_call: [],
        return_visit: [],
        bible_study: [],
        talk: [],
        demonstration: []
      };

      studentsWithProgress.forEach(student => {
        Object.entries(student.qualifications || {}).forEach(([speechType, isQualified]) => {
          if (isQualified && speechType in studentsBySpeechType) {
            studentsBySpeechType[speechType as SpeechType].push(student);
          }
        });
      });

      // Calculate statistics
      const statistics = {
        total_students: studentsWithProgress.length,
        by_progress_level: {
          beginning: studentsByProgress.beginning.length,
          developing: studentsByProgress.developing.length,
          qualified: studentsByProgress.qualified.length,
          advanced: studentsByProgress.advanced.length
        },
        by_speech_type: {
          bible_reading: studentsBySpeechType.bible_reading.length,
          initial_call: studentsBySpeechType.initial_call.length,
          return_visit: studentsBySpeechType.return_visit.length,
          bible_study: studentsBySpeechType.bible_study.length,
          talk: studentsBySpeechType.talk.length,
          demonstration: studentsBySpeechType.demonstration.length
        },
        active_students: studentsWithProgress.filter(s => s.ativo).length,
        needs_attention: studentsByProgress.beginning.length + 
                        studentsWithProgress.filter(s => {
                          const qualCount = Object.values(s.qualifications || {}).filter(Boolean).length;
                          return qualCount < 3;
                        }).length
      };

      setData({
        students_by_progress: studentsByProgress,
        students_by_speech_type: studentsBySpeechType,
        recent_updates: [], // Would come from a real updates table
        statistics
      });

    } catch (err) {
      console.error('Error loading instructor dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do painel do instrutor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update student qualifications
  const updateQualifications = useCallback(async (studentId: string, qualifications: StudentQualifications) => {
    try {
      // In a real implementation, this would update a qualifications table
      // For now, we'll update the local state
      setData(prevData => {
        const newData = { ...prevData };
        
        // Update in all relevant arrays
        Object.keys(newData.students_by_progress).forEach(level => {
          newData.students_by_progress[level as ProgressLevel] = 
            newData.students_by_progress[level as ProgressLevel].map(student => 
              student.id === studentId 
                ? { ...student, qualifications }
                : student
            );
        });

        // Recalculate speech type categorization
        const allStudents = Object.values(newData.students_by_progress).flat();
        const newStudentsBySpeechType: Record<SpeechType, EstudanteWithProgress[]> = {
          bible_reading: [],
          initial_call: [],
          return_visit: [],
          bible_study: [],
          talk: [],
          demonstration: []
        };

        allStudents.forEach(student => {
          Object.entries(student.qualifications || {}).forEach(([speechType, isQualified]) => {
            if (isQualified && speechType in newStudentsBySpeechType) {
              newStudentsBySpeechType[speechType as SpeechType].push(student);
            }
          });
        });

        newData.students_by_speech_type = newStudentsBySpeechType;

        // Update statistics
        newData.statistics.by_speech_type = {
          bible_reading: newStudentsBySpeechType.bible_reading.length,
          initial_call: newStudentsBySpeechType.initial_call.length,
          return_visit: newStudentsBySpeechType.return_visit.length,
          bible_study: newStudentsBySpeechType.bible_study.length,
          talk: newStudentsBySpeechType.talk.length,
          demonstration: newStudentsBySpeechType.demonstration.length
        };

        return newData;
      });

      toast({
        title: "Qualificações atualizadas",
        description: "As qualificações do estudante foram atualizadas com sucesso.",
      });

    } catch (err) {
      console.error('Error updating qualifications:', err);
      toast({
        title: "Erro ao atualizar qualificações",
        description: "Não foi possível atualizar as qualificações do estudante.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Update student progress level
  const updateProgress = useCallback(async (studentId: string, progressLevel: string, notes?: string) => {
    try {
      // In a real implementation, this would update a progress table
      // For now, we'll update the local state
      setData(prevData => {
        const newData = { ...prevData };
        
        // Find and move student between progress levels
        let studentToMove: EstudanteWithProgress | null = null;
        let fromLevel: ProgressLevel | null = null;

        // Find the student in current progress levels
        Object.entries(newData.students_by_progress).forEach(([level, students]) => {
          const studentIndex = students.findIndex(s => s.id === studentId);
          if (studentIndex !== -1) {
            studentToMove = students[studentIndex];
            fromLevel = level as ProgressLevel;
            // Remove from current level
            newData.students_by_progress[level as ProgressLevel].splice(studentIndex, 1);
          }
        });

        if (studentToMove && fromLevel) {
          // Update student progress
          studentToMove.progress = {
            ...studentToMove.progress!,
            progress_level: progressLevel as ProgressLevel,
            instructor_feedback: notes,
            updated_at: new Date().toISOString()
          };

          // Add to new level
          newData.students_by_progress[progressLevel as ProgressLevel].push(studentToMove);

          // Update statistics
          newData.statistics.by_progress_level = {
            beginning: newData.students_by_progress.beginning.length,
            developing: newData.students_by_progress.developing.length,
            qualified: newData.students_by_progress.qualified.length,
            advanced: newData.students_by_progress.advanced.length
          };
        }

        return newData;
      });

      toast({
        title: "Progresso atualizado",
        description: "O nível de progresso do estudante foi atualizado com sucesso.",
      });

    } catch (err) {
      console.error('Error updating progress:', err);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível atualizar o progresso do estudante.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle drag and drop
  const moveStudent = useCallback(async (result: DragDropResult) => {
    await updateProgress(result.student_id, result.to_level);
  }, [updateProgress]);

  // Load data on mount
  useEffect(() => {
    loadStudentsData();
  }, [loadStudentsData]);

  return {
    data,
    loading,
    error,
    updateQualifications,
    updateProgress,
    moveStudent,
    refreshData: loadStudentsData
  };
};
