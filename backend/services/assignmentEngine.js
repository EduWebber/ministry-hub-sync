/**
 * Assignment Engine
 * Generates student assignments based on S-38 instructions
 * Implements official JW meeting assignment rules
 */
class AssignmentEngine {
  constructor() {
    this.s38Rules = this.loadS38Rules();
  }

  /**
   * Load S-38 assignment rules
   */
  loadS38Rules() {
    return {
      bible_reading: {
        gender: 'male_only',
        assistant: false,
        introduction: false,
        conclusion: false,
        qualifications: ['baptized_or_unbaptized_publisher']
      },
      starting: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same_or_family',
        settings: ['house_to_house', 'informal', 'public'],
        qualifications: ['publisher']
      },
      following: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same',
        settings: ['house_to_house', 'informal', 'public'],
        qualifications: ['publisher']
      },
      making_disciples: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same',
        type: 'bible_study_segment',
        qualifications: ['publisher']
      },
      talk: {
        gender: 'male_only',
        assistant: false,
        type: 'talk_to_congregation',
        qualifications: ['qualified_male']
      },
      explaining_beliefs_demo: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same_or_family',
        qualifications: ['publisher']
      },
      explaining_beliefs_talk: {
        gender: 'male_only',
        assistant: false,
        qualifications: ['qualified_male']
      }
    };
  }

  /**
   * Generate assignments for a program
   */
  generateAssignments(program, students, congregationId) {
    if (!program || !program.partes || !Array.isArray(students)) {
      throw new Error('Invalid program or students data');
    }

    const assignments = [];
    const usedStudents = new Set();

    // Filter and categorize students
    const categorizedStudents = this.categorizeStudents(students);

    for (const parte of program.partes) {
      try {
        const assignment = this.assignStudentToPart(
          parte, 
          categorizedStudents, 
          usedStudents, 
          program.id,
          congregationId
        );
        
        if (assignment) {
          assignments.push(assignment);
          
          // Mark students as used for this week
          if (assignment.principal_estudante_id) {
            usedStudents.add(assignment.principal_estudante_id);
          }
          if (assignment.assistente_estudante_id) {
            usedStudents.add(assignment.assistente_estudante_id);
          }
        }
      } catch (error) {
        console.error(`Error assigning part ${parte.numero}:`, error);
        // Continue with next part even if one fails
      }
    }

    return assignments;
  }

  /**
   * Categorize students by qualifications and gender
   */
  categorizeStudents(students) {
    const categories = {
      male_qualified: [],
      male_publishers: [],
      female_publishers: [],
      elders: [],
      ministerial_servants: [],
      all: []
    };

    // Ensure students is an array
    if (!Array.isArray(students)) {
      console.warn('Students is not an array:', students);
      return categories;
    }

    for (const student of students) {
      // Add to all category
      categories.all.push(student);

      // Categorize by gender and qualifications
      const gender = student.genero || student.gender || 'male';
      const privileges = Array.isArray(student.privilegios) ? student.privilegios : 
                        Array.isArray(student.privileges) ? student.privileges : [];
      const isPublisher = student.publicador !== false && student.publisher !== false;

      if (gender === 'male' || gender === 'masculino') {
        if (privileges.includes('elder') || privileges.includes('anciao')) {
          categories.elders.push(student);
          categories.male_qualified.push(student);
        } else if (privileges.includes('ministerial_servant') || privileges.includes('servo_ministerial')) {
          categories.ministerial_servants.push(student);
          categories.male_qualified.push(student);
        }
        
        if (isPublisher) {
          categories.male_publishers.push(student);
        }
      } else if (gender === 'female' || gender === 'feminino') {
        if (isPublisher) {
          categories.female_publishers.push(student);
        }
      }
    }

    return categories;
  }

  /**
   * Assign a student to a specific part
   */
  assignStudentToPart(parte, categorizedStudents, usedStudents, programId, congregationId) {
    const rules = this.getPartRules(parte);
    if (!rules) {
      console.warn(`No rules found for part type: ${parte.tipo}`);
      return null;
    }

    // Get eligible students for principal role
    const eligiblePrincipal = this.getEligibleStudents(
      categorizedStudents, 
      rules, 
      'principal', 
      usedStudents
    );

    if (eligiblePrincipal.length === 0) {
      console.warn(`No eligible students for part ${parte.numero}: ${parte.titulo}`);
      return null;
    }

    // Select principal student (simple rotation for now)
    const principalStudent = eligiblePrincipal[0];
    let assistantStudent = null;

    // Assign assistant if required
    if (rules.assistant_required) {
      const eligibleAssistant = this.getEligibleAssistants(
        categorizedStudents,
        rules,
        principalStudent,
        usedStudents
      );

      if (eligibleAssistant.length > 0) {
        assistantStudent = eligibleAssistant[0];
      }
    }

    return {
      id: this.generateAssignmentId(),
      programacao_id: programId,
      congregacao_id: congregationId,
      programacao_item_id: `item-${parte.numero}`,
      parte_numero: parte.numero,
      parte_titulo: parte.titulo,
      parte_tipo: parte.tipo,
      principal_estudante_id: principalStudent.id,
      assistente_estudante_id: assistantStudent ? assistantStudent.id : null,
      status: 'assigned',
      created_at: new Date().toISOString(),
      s38_compliance: {
        rules_applied: rules,
        principal_qualifications: this.getStudentQualifications(principalStudent),
        assistant_qualifications: assistantStudent ? this.getStudentQualifications(assistantStudent) : null
      }
    };
  }

  /**
   * Get rules for a specific part type
   */
  getPartRules(parte) {
    const tipo = parte.tipo;
    
    // Handle special cases
    if (tipo === 'explaining_beliefs' || parte.titulo.toLowerCase().includes('explicando')) {
      // Check if it's a talk or demonstration based on instructions
      const isTalk = parte.instrucoes && parte.instrucoes.toLowerCase().includes('discurso');
      return this.s38Rules[isTalk ? 'explaining_beliefs_talk' : 'explaining_beliefs_demo'];
    }

    return this.s38Rules[tipo] || null;
  }

  /**
   * Get eligible students for a role
   */
  getEligibleStudents(categorizedStudents, rules, role, usedStudents) {
    let candidates = [];

    // Select candidate pool based on gender rules
    if (rules.gender === 'male_only') {
      if (rules.qualifications && rules.qualifications.includes('qualified_male')) {
        candidates = categorizedStudents.male_qualified;
      } else {
        candidates = categorizedStudents.male_publishers;
      }
    } else if (rules.gender === 'both') {
      candidates = [
        ...categorizedStudents.male_publishers,
        ...categorizedStudents.female_publishers
      ];
    }

    // Filter out already used students
    candidates = candidates.filter(student => !usedStudents.has(student.id));

    // Apply additional qualification filters
    if (rules.qualifications) {
      candidates = candidates.filter(student => 
        this.studentMeetsQualifications(student, rules.qualifications)
      );
    }

    return candidates;
  }

  /**
   * Get eligible assistants based on principal student and rules
   */
  getEligibleAssistants(categorizedStudents, rules, principalStudent, usedStudents) {
    let candidates = [];
    const principalGender = principalStudent.genero || principalStudent.gender || 'male';

    if (rules.assistant_gender === 'same') {
      // Same gender as principal
      if (principalGender === 'male' || principalGender === 'masculino') {
        candidates = categorizedStudents.male_publishers;
      } else {
        candidates = categorizedStudents.female_publishers;
      }
    } else if (rules.assistant_gender === 'same_or_family') {
      // Same gender or family member (simplified: same gender for now)
      if (principalGender === 'male' || principalGender === 'masculino') {
        candidates = categorizedStudents.male_publishers;
      } else {
        candidates = categorizedStudents.female_publishers;
      }
    }

    // Filter out used students and the principal student
    candidates = candidates.filter(student => 
      !usedStudents.has(student.id) && student.id !== principalStudent.id
    );

    return candidates;
  }

  /**
   * Check if student meets qualifications
   */
  studentMeetsQualifications(student, requiredQualifications) {
    const studentPrivileges = student.privilegios || student.privileges || [];
    const isPublisher = student.publicador || student.publisher || true;

    for (const qualification of requiredQualifications) {
      switch (qualification) {
        case 'publisher':
          if (!isPublisher) return false;
          break;
        case 'qualified_male':
          const gender = student.genero || student.gender || 'male';
          if (gender !== 'male' && gender !== 'masculino') return false;
          if (!studentPrivileges.some(p => ['elder', 'anciao', 'ministerial_servant', 'servo_ministerial'].includes(p))) {
            return false;
          }
          break;
        case 'elder':
          if (!studentPrivileges.some(p => ['elder', 'anciao'].includes(p))) return false;
          break;
      }
    }

    return true;
  }

  /**
   * Get student qualifications summary
   */
  getStudentQualifications(student) {
    return {
      gender: student.genero || student.gender || 'male',
      privileges: student.privilegios || student.privileges || [],
      publisher: student.publicador || student.publisher || true,
      baptized: student.batizado || student.baptized || false
    };
  }

  /**
   * Generate unique assignment ID
   */
  generateAssignmentId() {
    return `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = AssignmentEngine;