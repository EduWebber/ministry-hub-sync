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
        qualifications: ['baptized_or_unbaptized_publisher'],
        cooldown_weeks: 4,
        rotation_priority: 'fairness'
      },
      starting: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same_or_family',
        settings: ['house_to_house', 'informal', 'public'],
        qualifications: ['publisher'],
        cooldown_weeks: 2,
        rotation_priority: 'balanced'
      },
      following: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same',
        settings: ['house_to_house', 'informal', 'public'],
        qualifications: ['publisher'],
        cooldown_weeks: 3,
        rotation_priority: 'balanced'
      },
      making_disciples: {
        gender: 'both',
        assistant_required: true,
        assistant_gender: 'same',
        type: 'bible_study_segment',
        qualifications: ['publisher'],
        cooldown_weeks: 4,
        rotation_priority: 'balanced'
      },
      talk: {
        gender: 'male_only',
        assistant: false,
        type: 'talk_to_congregation',
        qualifications: ['qualified_male'],
        cooldown_weeks: 6,
        rotation_priority: 'seniority'
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
      },
      spiritual_gems: {
        gender: 'male_only',
        assistant: false,
        qualifications: ['qualified_male'],
        cooldown_weeks: 6,
        rotation_priority: 'seniority'
      },
      treasures_talk: {
        gender: 'male_only',
        assistant: false,
        qualifications: ['qualified_male'],
        cooldown_weeks: 6,
        rotation_priority: 'seniority'
      },
      congregation_study: {
        gender: 'male_only',
        assistant: false,
        qualifications: ['elder'],
        cooldown_weeks: 8,
        rotation_priority: 'elder_rotation'
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
                        Array.isArray(student.privileges) ? student.privileges : 
                        (Array.isArray(student.privileges) ? student.privileges : []);
      const isPublisher = student.publicador !== false && student.publisher !== false;

      if (gender === 'male' || gender === 'masculino') {
        if (privileges.includes('elder') || privileges.includes('anciao')) {
          categories.elders.push(student);
          categories.male_qualified.push(student);
        } else if (privileges.includes('ministerial_servant') || privileges.includes('servo_ministerial')) {
          categories.ministerial_servants.push(student);
          categories.male_qualified.push(student);
        } else if (isPublisher) {
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
      return {
        id: this.generateAssignmentId(),
        programacao_id: programId,
        congregacao_id: congregationId,
        programacao_item_id: parte.id,
        parte_numero: parte.numero,
        parte_titulo: parte.titulo,
        parte_tipo: parte.tipo,
        principal_estudante_id: null,
        assistente_estudante_id: null,
        status: 'no_eligible_students',
        observacoes: 'Nenhum estudante elegível encontrado',
        s38_compliance: {
          rules_applied: rules
        }
      };
    }

    /**
     * Select principal student using fairness and rotation logic
     */
    const principalStudent = this.selectBestCandidate(eligiblePrincipal, rules, 'principal');
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
        assistantStudent = this.selectBestCandidate(eligibleAssistant, rules, 'assistant');
      }
    }

    return {
      id: this.generateAssignmentId(),
      programacao_id: programId,
      congregacao_id: congregationId,
      programacao_item_id: parte.id,
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
    if (tipo === 'explaining_beliefs' || (parte.titulo && parte.titulo.toLowerCase().includes('explicando'))) {
      // Check if it's a talk or demonstration based on instructions
      const isTalk = parte.instrucoes && parte.instrucoes.toLowerCase().includes('discurso');
      return this.s38Rules[isTalk ? 'explaining_beliefs_talk' : 'explaining_beliefs_demo'];
    }

    // Handle treasures section parts
    if (parte.secao === 'TREASURES' || (parte.titulo && parte.titulo.toLowerCase().includes('tesouro'))) {
      if (tipo === 'talk' || (parte.titulo && parte.titulo.toLowerCase().includes('discurso'))) {
        return this.s38Rules.treasures_talk;
      }
      if (tipo === 'spiritual_gems' || (parte.titulo && parte.titulo.toLowerCase().includes('joias'))) {
        return this.s38Rules.spiritual_gems;
      }
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
      } else if (rules.qualifications && rules.qualifications.includes('elder')) {
        candidates = categorizedStudents.elders;
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
      // Same gender or family member
      if (principalGender === 'male' || principalGender === 'masculino') {
        candidates = categorizedStudents.male_publishers;
      } else {
        candidates = categorizedStudents.female_publishers;
      }
      
      // TODO: Add family member logic here
      // For now, we'll just add same gender candidates
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
    const studentPrivileges = Array.isArray(student.privilegios) ? student.privilegios : 
                             Array.isArray(student.privileges) ? student.privileges : [];
    const isPublisher = student.publicador !== false && student.publisher !== false;

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
        case 'baptized_or_unbaptized_publisher':
          // Any publisher qualifies
          if (!isPublisher) return false;
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
      privileges: Array.isArray(student.privilegios) ? student.privilegios : 
                 Array.isArray(student.privileges) ? student.privileges : [],
      publisher: student.publicador !== false && student.publisher !== false,
      baptized: student.batizado !== false && student.baptized !== false,
      // S-38 specific qualifications
      reading: student.reading || false,
      treasures: student.treasures || false,
      gems: student.gems || false,
      talk: student.talk || false,
      explaining: student.explaining || false,
      starting: student.starting || false,
      following: student.following || false,
      making: student.making || false,
      congregation_study: student.congregation_study || false
    };
  }

  /**
   * Generate unique assignment ID
   */
  generateAssignmentId() {
    return `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Select best candidate using fairness and rotation logic
   */
  selectBestCandidate(candidates, rules, role = 'principal') {
    if (!candidates || candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Apply rotation priority based on rule type
    const rotationPriority = rules.rotation_priority || 'fairness';
    
    switch (rotationPriority) {
      case 'seniority':
        return this.selectBySeniority(candidates);
      case 'elder_rotation':
        return this.selectByElderRotation(candidates);
      case 'balanced':
        return this.selectByBalance(candidates, rules);
      case 'fairness':
      default:
        return this.selectByFairness(candidates, rules);
    }
  }

  /**
   * Select candidate by seniority (elders/ministerial servants first)
   */
  selectBySeniority(candidates) {
    // Sort by privilege level, then by experience/seniority indicators
    const sorted = candidates.sort((a, b) => {
      const aPrivileges = Array.isArray(a.privilegios) ? a.privilegios : (Array.isArray(a.privileges) ? a.privileges : []);
      const bPrivileges = Array.isArray(b.privilegios) ? b.privilegios : (Array.isArray(b.privileges) ? b.privileges : []);
      
      // Elders first
      const aIsElder = aPrivileges.some(p => ['elder', 'anciao'].includes(p));
      const bIsElder = bPrivileges.some(p => ['elder', 'anciao'].includes(p));
      if (aIsElder && !bIsElder) return -1;
      if (!aIsElder && bIsElder) return 1;
      
      // Then ministerial servants
      const aIsMS = aPrivileges.some(p => ['ministerial_servant', 'servo_ministerial'].includes(p));
      const bIsMS = bPrivileges.some(p => ['ministerial_servant', 'servo_ministerial'].includes(p));
      if (aIsMS && !bIsMS) return -1;
      if (!aIsMS && bIsMS) return 1;
      
      return 0;
    });
    
    return sorted[0];
  }

  /**
   * Select candidate by elder rotation (for congregation study)
   */
  selectByElderRotation(candidates) {
    // Filter only elders
    const elders = candidates.filter(candidate => {
      const privileges = Array.isArray(candidate.privilegios) ? candidate.privilegios : 
                        (Array.isArray(candidate.privileges) ? candidate.privileges : []);
      return privileges.some(p => ['elder', 'anciao'].includes(p));
    });
    
    if (elders.length > 0) {
      // Apply fairness logic among elders
      return this.selectByFairness(elders);
    }
    
    // Fallback to ministerial servants if no elders available
    const servants = candidates.filter(candidate => {
      const privileges = Array.isArray(candidate.privilegios) ? candidate.privilegios : 
                        (Array.isArray(candidate.privileges) ? candidate.privileges : []);
      return privileges.some(p => ['ministerial_servant', 'servo_ministerial'].includes(p));
    });
    
    return servants.length > 0 ? servants[0] : candidates[0];
  }

  /**
   * Select candidate by balanced assignment distribution
   */
  selectByBalance(candidates, rules) {
    // For now, use fairness logic - can be enhanced with load balancing
    return this.selectByFairness(candidates, rules);
  }

  /**
   * Select candidate by fairness (least recent assignments)
   */
  selectByFairness(candidates, rules = {}) {
    // For MVP, use simple round-robin
    // In production, this would check assignment history and cooldowns
    
    // Score candidates based on various fairness factors
    const scoredCandidates = candidates.map(candidate => {
      let score = 0;
      
      // Base score for availability
      score += 100;
      
      // Penalty for recent assignments (simulated)
      // In production, this would check actual assignment history
      const candidateId = candidate.id || candidate.nome;
      const hashScore = candidateId ? this.hashString(candidateId) % 50 : 0;
      score -= hashScore;
      
      // Bonus for qualified candidates
      if (this.isHighlyQualified(candidate)) {
        score += 20;
      }
      
      return { candidate, score };
    });
    
    // Sort by score (highest first for fairness)
    scoredCandidates.sort((a, b) => b.score - a.score);
    
    return scoredCandidates[0]?.candidate || candidates[0];
  }

  /**
   * Check if candidate is highly qualified
   */
  isHighlyQualified(candidate) {
    const privileges = Array.isArray(candidate.privilegios) ? candidate.privilegios : 
                      (Array.isArray(candidate.privileges) ? candidate.privileges : []);
    return privileges.some(p => ['elder', 'anciao', 'ministerial_servant', 'servo_ministerial'].includes(p));
  }

  /**
   * Simple hash function for deterministic scoring
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

module.exports = AssignmentEngine;
