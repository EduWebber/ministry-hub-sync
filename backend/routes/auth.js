const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Mock user data for testing
const mockUsers = [
  { id: '1', email: 'admin@example.com', role: 'admin' },
  { id: '2', email: 'instructor@example.com', role: 'instructor' },
  { id: '3', email: 'student@example.com', role: 'student' }
];

// POST /auth/login - User login
router.post('/login', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Login request body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Mock authentication for testing purposes
    const mockUser = mockUsers.find(user => user.email === email);
    if (!mockUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Mock session data
    const mockSession = {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: mockUser,
      session: mockSession
    });

  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /auth/token - Refresh token
router.post('/token', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Token refresh request body:', req.body);
    
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Mock token refresh
    const mockSession = {
      access_token: 'new-mock-access-token-' + Date.now(),
      refresh_token: 'new-mock-refresh-token-' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer'
    };

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      session: mockSession
    });

  } catch (error) {
    console.error('❌ Error in token refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /auth/v1/token - Alternative token endpoint (for compatibility)
router.post('/v1/token', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('V1 token refresh request body:', req.body);
    
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Mock token refresh
    const mockSession = {
      access_token: 'new-mock-access-token-v1-' + Date.now(),
      refresh_token: 'new-mock-refresh-token-v1-' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer'
    };

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      session: mockSession
    });

  } catch (error) {
    console.error('❌ Error in v1 token refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Logout request body:', req.body);
    
    const { access_token } = req.body;

    if (access_token) {
      // Sign out with Supabase Auth
      await supabase.auth.signOut();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('❌ Error in logout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;