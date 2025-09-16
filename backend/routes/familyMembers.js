const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Mock family members data for testing
const mockFamilyMembers = [
  { id: '1', name: 'John Doe', relationship: 'father', created_at: new Date().toISOString() },
  { id: '2', name: 'Jane Doe', relationship: 'mother', created_at: new Date().toISOString() },
  { id: '3', name: 'Junior Doe', relationship: 'child', created_at: new Date().toISOString() }
];

// GET /family-members - List all family members
router.get('/', async (req, res) => {
  try {
    // Mock response for testing
    res.json({
      success: true,
      familyMembers: mockFamilyMembers,
      total: mockFamilyMembers.length
    });

  } catch (error) {
    console.error('❌ Error fetching family members:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /family-members/:id - Get a specific family member
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock response for testing
    const familyMember = mockFamilyMembers.find(member => member.id === id);
    
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    res.json({
      success: true,
      familyMember: familyMember
    });

  } catch (error) {
    console.error('❌ Error fetching family member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /family-members - Create a new family member
router.post('/', async (req, res) => {
  try {
    const familyMemberData = req.body;
    
    // Validate required fields
    if (!familyMemberData.name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Mock response for testing
    const newFamilyMember = {
      id: String(mockFamilyMembers.length + 1),
      ...familyMemberData,
      created_at: new Date().toISOString()
    };
    
    mockFamilyMembers.push(newFamilyMember);

    res.status(201).json({
      success: true,
      message: 'Family member created successfully',
      familyMember: newFamilyMember
    });

  } catch (error) {
    console.error('❌ Error creating family member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// PUT /family-members/:id - Update a family member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const familyMemberData = req.body;
    
    // Mock response for testing
    const familyMemberIndex = mockFamilyMembers.findIndex(member => member.id === id);
    
    if (familyMemberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    mockFamilyMembers[familyMemberIndex] = {
      ...mockFamilyMembers[familyMemberIndex],
      ...familyMemberData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Family member updated successfully',
      familyMember: mockFamilyMembers[familyMemberIndex]
    });

  } catch (error) {
    console.error('❌ Error updating family member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// DELETE /family-members/:id - Delete a family member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock response for testing
    const familyMemberIndex = mockFamilyMembers.findIndex(member => member.id === id);
    
    if (familyMemberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    mockFamilyMembers.splice(familyMemberIndex, 1);

    res.json({
      success: true,
      message: 'Family member deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting family member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;