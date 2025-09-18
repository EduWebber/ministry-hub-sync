const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// POST /auth/login - User login with real Supabase authentication
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

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          user_id: data.user.id,
          nome_completo: data.user.email.split('@')[0],
          role: 'instrutor' // Default role
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'instrutor'
      },
      session: data.session
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

    // Refresh session with Supabase Auth
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      session: data.session
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

    // Refresh session with Supabase Auth
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      console.error('V1 token refresh error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      session: data.session
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
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