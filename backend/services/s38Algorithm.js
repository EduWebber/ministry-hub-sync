/**
 * S-38 Assignment Algorithm Implementation
 * Based on the comprehensive specification document for S-38 (Christian Life and Ministry)
 * 
 * This module implements the complete algorithm for automatic assignment generation
 * with fairness, rotation, and S-38 compliance rules.
 */

class S38Algorithm {
  
  /**
   * 3) Mapeamento de Partes → Tipos Internos
   * Convert program parts to internal types for uniform logic
   */
  static mapPartToInternalType(part) {
    const titulo = (part.titulo || part.title || '').toLowerCase();
    const tipo = (part.tipo || part.type || '').toLowerCase();
    
    // Tesouros da Palavra de Deus
    if (tipo.includes('talk') && titulo.includes('tesouro')) {
      return 'talk';
    }
    if (tipo.includes('spiritual_gems') || tipo.includes('joias') || titulo.includes('joias espirituais')) {
      return 'spiritual_gems';
    }
    if (tipo.includes('bible_reading') || tipo.includes('leitura') || titulo.includes('leitura da bíblia')) {
      return 'bible_reading';
    }
    
    // Ministério de Campo
    if (tipo.includes('starting') || titulo.includes('iniciando conversas')) {
      return 'starting';
    }
    if (tipo.includes('following') || titulo.includes('cultivando') || titulo.includes('interesse')) {
      return 'following';
    }
    if (tipo.includes('making') || titulo.includes('fazendo discípulos') || titulo.includes('estudo biblico')) {
      return 'making_disciples';
    }
    if (tipo.includes('explaining') || titulo.includes('explicando suas crenças')) {
      return 'explaining';
    }
    
    // Vivendo como Cristãos
    if (tipo.includes('congregation_study') || titulo.includes('estudo bíblico de congregação')) {
      return 'congregation_study';
    }
    if (tipo.includes('talk') || tipo.includes('discurso') || tipo.includes('consideracao')) {
      return 'talk';
    }
    
    // Fallback
    return tipo || 'unknown';
  }

  /**
   * 4) Regras por Tipo de Parte (S-38)
   * Get S-38 rules for each part type
   */
  static getS38Rules(internalType) {
    const rules = {
      // Tesouros da Palavra de Deus
      'talk': {
        gender: 'masculino',
        roleRequired: ['elder', 'ministerial_servant'],
        assistantRequired: false,
        qualification: 'talk'
      },
      'spiritual_gems': {
        gender: 'masculino',
        roleRequired: ['elder', 'ministerial_servant'],
        assistantRequired: false,
        qualification: 'gems'
      },
      'bible_reading': {
        gender: 'masculino',
        roleRequired: null,
        assistantRequired: false,
        qualification: 'reading'
      },
      
      // Ministério de Campo
      'starting': {
        gender: 'ambos',
        roleRequired: null,
        assistantRequired: true,
        assistantSameGender: true,
        assistantFamilyOk: true,
        qualification: 'starting'
      },
      'following': {
        gender: 'ambos',
        roleRequired: null,
        assistantRequired: true,
        assistantSameGender: true,
        assistantFamilyOk: false,
        qualification: 'following'
      },
      'making_disciples': {
        gender: 'ambos',
        roleRequired: null,
        assistantRequired: true,
        assistantSameGender: true,
        assistantFamilyOk: false,
        qualification: 'making'
      },
      'explaining': {
        gender: 'ambos',
        roleRequired: null,
        assistantRequired: true,
        assistantSameGender: true,
        assistantFamilyOk: true,
        qualification: 'explaining'
      },
      
      // Vivendo como Cristãos
      'congregation_study': {
        gender: 'masculino',
        roleRequired: ['elder'],
        assistantRequired: false,
        qualification: 'congregation_study'
      }
    };
    
    return rules[internalType] || {
      gender: 'ambos',
      roleRequired: null,
      assistantRequired: false,
      qualification: null
    };
  }

  /**
   * 5) Seleção do Estudante Principal (Pipeline)
   * Main selection pipeline with fairness
   */
  static selectPrincipalStudent(students, part, assignmentHistory = [], currentDate = new Date()) {
    const internalType = this.mapPartToInternalType(part);
    const rules = this.getS38Rules(internalType);
    
    console.log(`🔍 Selecting principal student for ${internalType} with rules:`, rules);
    
    // 1) Base set: active students
    let candidates = students.filter(student => student.ativo === true);
    console.log(`📊 Base candidates: ${candidates.length}`);
    
    // 2) Filter by gender and role
    candidates = this.filterByGenderAndRole(candidates, rules);
    console.log(`👥 After gender/role filter: ${candidates.length}`);
    
    // 3) Filter by qualifications
    candidates = this.filterByQualifications(candidates, rules);
    console.log(`🎓 After qualification filter: ${candidates.length}`);
    
    // 4) Apply fairness ranking
    const rankedCandidates = this.rankByFairness(candidates, internalType, assignmentHistory, currentDate);
    console.log(`⚖️ Ranked candidates: ${rankedCandidates.length}`);
    
    // 5) Select first in ranking
    return rankedCandidates.length > 0 ? rankedCandidates[0] : null;
  }

  /**
   * 6) Seleção do Assistente (quando aplicável)
   * Assistant selection with gender/family restrictions
   */
  static selectAssistant(students, principal, part, assignmentHistory = [], currentDate = new Date()) {
    const internalType = this.mapPartToInternalType(part);
    const rules = this.getS38Rules(internalType);
    
    if (!rules.assistantRequired || !principal) {
      return null;
    }
    
    console.log(`🤝 Selecting assistant for ${internalType}`);
    
    // 1) Filter candidates (exclude principal)
    let candidates = students.filter(student => 
      student.ativo === true && 
      student.id !== principal.id
    );
    
    // 2) Apply assistant restrictions
    candidates = candidates.filter(candidate => {
      // Same gender (default rule)
      const sameGender = candidate.genero === principal.genero;
      
      // Family relationship (when allowed)
      const isFamily = rules.assistantFamilyOk && this.isFamily(candidate, principal);
      
      return sameGender || isFamily;
    });
    
    // 3) Apply fairness ranking for assistants
    const rankedCandidates = this.rankByFairness(candidates, `${internalType}_assistant`, assignmentHistory, currentDate);
    
    return rankedCandidates.length > 0 ? rankedCandidates[0] : null;
  }

  /**
   * Filter students by gender and role requirements
   */
  static filterByGenderAndRole(students, rules) {
    return students.filter(student => {
      // Gender filter
      if (rules.gender === 'masculino' && student.genero !== 'masculino') {
        return false;
      }
      
      // Role filter
      if (rules.roleRequired && Array.isArray(rules.roleRequired)) {
        const privileges = Array.isArray(student.privileges) ? student.privileges : [];
        const hasRequiredRole = rules.roleRequired.some(role => 
          privileges.includes(role) || privileges.includes(this.mapRoleName(role))
        );
        if (!hasRequiredRole) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Filter students by qualification requirements
   */
  static filterByQualifications(students, rules) {
    if (!rules.qualification) {
      return students;
    }
    
    return students.filter(student => {
      // Check if student has the required qualification
      const qualifications = student.qualificacoes || {};
      const directQualification = student[rules.qualification];
      
      return qualifications[rules.qualification] === true || directQualification === true;
    });
  }

  /**
   * 7) Rotação, Fairness e Empates
   * Rank candidates by fairness metrics
   */
  static rankByFairness(candidates, partType, assignmentHistory, currentDate) {
    const cooldowns = this.getCooldownPeriods();
    
    return candidates.map(candidate => {
      const score = this.calculateFairnessScore(candidate, partType, assignmentHistory, currentDate, cooldowns);
      return { ...candidate, fairnessScore: score };
    })
    .sort((a, b) => b.fairnessScore - a.fairnessScore); // Higher score = more fair
  }

  /**
   * Calculate fairness score for a candidate
   */
  static calculateFairnessScore(candidate, partType, assignmentHistory, currentDate, cooldowns) {
    let score = 100; // Base score
    
    // Get candidate's assignment history
    const candidateHistory = assignmentHistory.filter(assignment => 
      assignment.principal_estudante_id === candidate.id || 
      assignment.assistente_estudante_id === candidate.id
    );
    
    // Cooldown penalty
    const recentAssignments = candidateHistory.filter(assignment => {
      const assignmentDate = new Date(assignment.created_at || assignment.data);
      const daysSince = Math.floor((currentDate - assignmentDate) / (1000 * 60 * 60 * 24));
      const cooldownDays = cooldowns[partType] || cooldowns.default;
      return daysSince < cooldownDays;
    });
    
    // Heavy penalty for violating cooldown
    score -= recentAssignments.length * 50;
    
    // Frequency penalty - less recent assignments = higher score
    const totalAssignments = candidateHistory.length;
    score -= totalAssignments * 2;
    
    // Time since last assignment bonus
    if (candidateHistory.length > 0) {
      const lastAssignment = candidateHistory.sort((a, b) => 
        new Date(b.created_at || b.data) - new Date(a.created_at || a.data)
      )[0];
      const daysSince = Math.floor((currentDate - new Date(lastAssignment.created_at || lastAssignment.data)) / (1000 * 60 * 60 * 24));
      score += Math.min(daysSince, 30); // Max 30 day bonus
    } else {
      score += 30; // Bonus for never assigned
    }
    
    // Random tie-breaker (deterministic based on ID)
    score += this.getStableRandom(candidate.id) * 5;
    
    return score;
  }

  /**
   * Get cooldown periods by category
   */
  static getCooldownPeriods() {
    return {
      'bible_reading': 28, // 4 weeks
      'starting': 14, // 2 weeks
      'following': 14, // 2 weeks
      'making_disciples': 14, // 2 weeks
      'explaining': 14, // 2 weeks
      'talk': 42, // 6 weeks
      'spiritual_gems': 42, // 6 weeks
      'congregation_study': 42, // 6 weeks
      'default': 21 // 3 weeks
    };
  }

  /**
   * 8) Fallbacks e Degradação Controlada
   * Apply fallback logic when strict filtering fails
   */
  static applyFallbacks(students, part, assignmentHistory, attempts = 0) {
    const maxAttempts = 3;
    
    if (attempts >= maxAttempts) {
      return {
        principal: null,
        assistant: null,
        fallbackApplied: `Máximo de tentativas atingido (${maxAttempts})`,
        status: 'PENDING'
      };
    }
    
    const internalType = this.mapPartToInternalType(part);
    const rules = this.getS38Rules(internalType);
    
    // Try with progressively relaxed restrictions
    const fallbackStrategies = [
      // Strategy 1: Relax cooldowns
      () => {
        const relaxedHistory = assignmentHistory.filter(a => {
          const daysSince = Math.floor((new Date() - new Date(a.created_at || a.data)) / (1000 * 60 * 60 * 24));
          return daysSince < 7; // Only consider last week
        });
        return this.selectWithRelaxedRules(students, part, relaxedHistory, 'cooldown_relaxed');
      },
      
      // Strategy 2: Generic ministry qualification
      () => {
        const genericStudents = students.filter(s => s.ativo && this.hasGenericMinistrySkill(s));
        return this.selectWithRelaxedRules(genericStudents, part, assignmentHistory, 'generic_qualification');
      },
      
      // Strategy 3: Family assistant when same gender not available
      () => {
        if (rules.assistantRequired) {
          const principal = this.selectPrincipalStudent(students, part, assignmentHistory);
          if (principal) {
            const familyAssistants = students.filter(s => 
              s.ativo && s.id !== principal.id && this.isFamily(s, principal)
            );
            const assistant = familyAssistants.length > 0 ? familyAssistants[0] : null;
            return {
              principal,
              assistant,
              fallbackApplied: 'family_assistant',
              status: assistant ? 'OK' : 'PENDING'
            };
          }
        }
        return null;
      }
    ];
    
    // Try each fallback strategy
    for (let i = 0; i < fallbackStrategies.length; i++) {
      const result = fallbackStrategies[i]();
      if (result && result.principal) {
        return result;
      }
    }
    
    // Ultimate fallback: mark as pending
    return {
      principal: null,
      assistant: null,
      fallbackApplied: 'Nenhum estudante elegível encontrado após todas as tentativas',
      status: 'PENDING'
    };
  }

  /**
   * Select with relaxed rules
   */
  static selectWithRelaxedRules(students, part, relaxedHistory, fallbackType) {
    const principal = this.selectPrincipalStudent(students, part, relaxedHistory);
    let assistant = null;
    
    if (principal) {
      assistant = this.selectAssistant(students, principal, part, relaxedHistory);
    }
    
    return {
      principal,
      assistant,
      fallbackApplied: fallbackType,
      status: principal ? 'OK' : 'PENDING'
    };
  }

  /**
   * Check if student has generic ministry skills
   */
  static hasGenericMinistrySkill(student) {
    const qualifications = student.qualificacoes || {};
    return (
      qualifications.starting === true ||
      qualifications.following === true ||
      qualifications.making === true ||
      qualifications.explaining === true ||
      student.starting === true ||
      student.following === true ||
      student.making === true ||
      student.explaining === true
    );
  }

  /**
   * Check if two students are family members
   */
  static isFamily(student1, student2) {
    // Check parent-child relationships
    return (
      student1.id_pai === student2.id ||
      student1.id_mae === student2.id ||
      student2.id_pai === student1.id ||
      student2.id_mae === student1.id ||
      (student1.id_pai && student1.id_pai === student2.id_pai) ||
      (student1.id_mae && student1.id_mae === student2.id_mae)
    );
  }

  /**
   * Map role names for compatibility
   */
  static mapRoleName(role) {
    const mapping = {
      'elder': 'anciao',
      'ministerial_servant': 'servo_ministerial',
      'anciao': 'elder',
      'servo_ministerial': 'ministerial_servant'
    };
    return mapping[role] || role;
  }

  /**
   * Generate stable random number based on string input
   */
  static getStableRandom(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  /**
   * Main algorithm entry point
   */
  static generateAssignments(programItems, students, assignmentHistory = [], congregacaoId) {
    console.log(`🎯 Generating assignments for ${programItems.length} items with ${students.length} students`);
    
    const assignments = [];
    const currentDate = new Date();
    
    for (const item of programItems) {
      console.log(`\n📋 Processing item: ${item.titulo || item.title}`);
      
      // Try normal selection first
      let principal = this.selectPrincipalStudent(students, item, assignmentHistory, currentDate);
      let assistant = null;
      let fallbackApplied = null;
      let status = 'OK';
      
      if (principal) {
        assistant = this.selectAssistant(students, principal, item, assignmentHistory, currentDate);
        console.log(`✅ Selected: ${principal.nome}${assistant ? ` + ${assistant.nome}` : ''}`);
      } else {
        // Apply fallback logic
        console.log(`⚠️ No principal found, applying fallbacks...`);
        const fallbackResult = this.applyFallbacks(students, item, assignmentHistory);
        principal = fallbackResult.principal;
        assistant = fallbackResult.assistant;
        fallbackApplied = fallbackResult.fallbackApplied;
        status = fallbackResult.status;
        
        if (fallbackResult.principal) {
          console.log(`🔄 Fallback selected: ${fallbackResult.principal.nome} (${fallbackApplied})`);
        } else {
          console.log(`❌ No assignment possible for this item`);
        }
      }
      
      // Create assignment entry
      const assignment = {
        programacao_item_id: item.id,
        principal_estudante_id: principal?.id || null,
        assistente_estudante_id: assistant?.id || null,
        status: status,
        observacoes: fallbackApplied || null
      };
      
      assignments.push(assignment);
      
      // Add to history for future fairness calculations
      if (principal) {
        assignmentHistory.push({
          principal_estudante_id: principal.id,
          assistente_estudante_id: assistant?.id || null,
          created_at: currentDate.toISOString(),
          tipo: this.mapPartToInternalType(item)
        });
      }
    }
    
    console.log(`\n✅ Generated ${assignments.length} assignments`);
    console.log(`📊 Summary: ${assignments.filter(a => a.status === 'OK').length} OK, ${assignments.filter(a => a.status === 'PENDING').length} PENDING`);
    
    return assignments;
  }
}

module.exports = S38Algorithm;