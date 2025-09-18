const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /family-members - List all family members
router.get('/', async (req, res) => {
  try {
    const { data: familyMembers, error } = await supabase
      .from('family_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching family members: ${error.message}`);
    }

    res.json({
      success: true,
      familyMembers: familyMembers || [],
      total: (familyMembers || []).length
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
    
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
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

    const { data: familyMember, error } = await supabase
      .from('family_members')
      .insert(familyMemberData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating family member: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Family member created successfully',
      familyMember: familyMember
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
    
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .update(familyMemberData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    res.json({
      success: true,
      message: 'Family member updated successfully',
      familyMember: familyMember
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
    
    const { data, error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

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