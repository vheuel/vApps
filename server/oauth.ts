import { Request, Response, NextFunction, Router } from 'express';
import { storage } from './storage';
import { randomBytes } from 'crypto';
import { env } from 'process';

export const oauthRouter = Router();

// Route untuk mendapatkan semua provider OAuth yang diaktifkan
oauthRouter.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = await storage.getOAuthProviders();
    // Hanya kembalikan provider yang diaktifkan dan hanya nama dan redirectUri (tidak ada secret)
    const enabledProviders = providers
      .filter(provider => provider.enabled)
      .map(provider => ({
        provider: provider.provider,
        redirectUri: provider.redirectUri
      }));
    
    res.json(enabledProviders);
  } catch (error) {
    console.error('Error getting OAuth providers:', error);
    res.status(500).json({ message: 'Failed to get OAuth providers' });
  }
});

// Route untuk admin mendapatkan semua provider OAuth
oauthRouter.get('/admin/providers', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const providers = await storage.getOAuthProviders();
    
    // Hapus clientSecret dari response
    const sanitizedProviders = providers.map(provider => ({
      ...provider,
      clientSecret: '••••••••••••••••' // Sembunyikan clientSecret
    }));
    
    res.json(sanitizedProviders);
  } catch (error) {
    console.error('Error getting OAuth providers for admin:', error);
    res.status(500).json({ message: 'Failed to get OAuth providers' });
  }
});

// Route untuk admin menambahkan provider OAuth baru
oauthRouter.post('/admin/providers', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { provider, clientId, clientSecret, redirectUri, enabled } = req.body;
    
    // Validasi input
    if (!provider || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Periksa apakah provider sudah ada
    const existingProvider = await storage.getOAuthProviderByName(provider);
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider already exists' });
    }
    
    // Buat provider baru
    const newProvider = await storage.createOAuthProvider({
      provider,
      clientId,
      clientSecret,
      redirectUri,
      enabled: enabled !== undefined ? enabled : false
    });
    
    // Hapus clientSecret dari response
    const { clientSecret: _, ...sanitizedProvider } = newProvider;
    
    res.status(201).json(sanitizedProvider);
  } catch (error) {
    console.error('Error creating OAuth provider:', error);
    res.status(500).json({ message: 'Failed to create OAuth provider' });
  }
});

// Route untuk admin mengupdate provider OAuth
oauthRouter.patch('/admin/providers/:id', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const { provider, clientId, clientSecret, redirectUri, enabled } = req.body;
    
    // Periksa apakah provider ada
    const existingProvider = await storage.getOAuthProvider(parseInt(id));
    if (!existingProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Update provider
    const updates: any = {};
    if (provider !== undefined) updates.provider = provider;
    if (clientId !== undefined) updates.clientId = clientId;
    if (clientSecret !== undefined) updates.clientSecret = clientSecret;
    if (redirectUri !== undefined) updates.redirectUri = redirectUri;
    if (enabled !== undefined) updates.enabled = enabled;
    
    const updatedProvider = await storage.updateOAuthProvider(parseInt(id), updates);
    
    // Hapus clientSecret dari response
    const { clientSecret: _, ...sanitizedProvider } = updatedProvider!;
    
    res.json(sanitizedProvider);
  } catch (error) {
    console.error('Error updating OAuth provider:', error);
    res.status(500).json({ message: 'Failed to update OAuth provider' });
  }
});

// Route untuk admin menghapus provider OAuth
oauthRouter.delete('/admin/providers/:id', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    
    // Periksa apakah provider ada
    const existingProvider = await storage.getOAuthProvider(parseInt(id));
    if (!existingProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Hapus provider
    await storage.deleteOAuthProvider(parseInt(id));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting OAuth provider:', error);
    res.status(500).json({ message: 'Failed to delete OAuth provider' });
  }
});

// Route untuk admin mengaktifkan provider OAuth
oauthRouter.patch('/admin/providers/:id/enable', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    
    // Periksa apakah provider ada
    const existingProvider = await storage.getOAuthProvider(parseInt(id));
    if (!existingProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Aktifkan provider
    const updatedProvider = await storage.enableOAuthProvider(parseInt(id));
    
    // Hapus clientSecret dari response
    const { clientSecret: _, ...sanitizedProvider } = updatedProvider!;
    
    res.json(sanitizedProvider);
  } catch (error) {
    console.error('Error enabling OAuth provider:', error);
    res.status(500).json({ message: 'Failed to enable OAuth provider' });
  }
});

// Route untuk admin menonaktifkan provider OAuth
oauthRouter.patch('/admin/providers/:id/disable', async (req: Request, res: Response) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    
    // Periksa apakah provider ada
    const existingProvider = await storage.getOAuthProvider(parseInt(id));
    if (!existingProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Nonaktifkan provider
    const updatedProvider = await storage.disableOAuthProvider(parseInt(id));
    
    // Hapus clientSecret dari response
    const { clientSecret: _, ...sanitizedProvider } = updatedProvider!;
    
    res.json(sanitizedProvider);
  } catch (error) {
    console.error('Error disabling OAuth provider:', error);
    res.status(500).json({ message: 'Failed to disable OAuth provider' });
  }
});

// Placeholder untuk inisiasi OAuth login
oauthRouter.get('/login/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    
    // Periksa apakah provider ada dan aktif
    const oauthProvider = await storage.getOAuthProviderByName(provider);
    if (!oauthProvider || !oauthProvider.enabled) {
      return res.status(404).json({ message: 'Provider not found or disabled' });
    }
    
    // Simpan state untuk keamanan
    const state = randomBytes(16).toString('hex');
    (req.session as any).oauthState = state;
    
    // Buat URL redirect berdasarkan provider
    let authUrl = '';
    
    if (provider === 'google') {
      const redirectUri = oauthProvider.redirectUri;
      const clientId = oauthProvider.clientId;
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&state=${state}`;
    } 
    else if (provider === 'twitter' || provider === 'x') {
      // Implementasi untuk Twitter/X akan ditambahkan nanti
      // Memerlukan OAuth 1.0a yang lebih kompleks
      return res.status(501).json({ message: 'Twitter/X OAuth authentication not implemented yet' });
    } 
    else if (provider === 'telegram') {
      // Telegram menggunakan Telegram Login Widget dan tidak langsung melalui OAuth
      // Implementasi akan ditangani secara terpisah
      return res.status(501).json({ message: 'Telegram authentication not implemented yet' });
    } 
    else {
      return res.status(400).json({ message: 'Unsupported provider' });
    }
    
    // Redirect ke URL autentikasi
    res.redirect(authUrl);
  } catch (error) {
    console.error(`Error initiating ${req.params.provider} login:`, error);
    res.status(500).json({ message: 'Failed to initiate authentication' });
  }
});

// Callback untuk OAuth providers
oauthRouter.get('/callback/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    
    // Verifikasi state untuk keamanan
    if (!state || state !== (req.session as any).oauthState) {
      return res.status(400).json({ message: 'Invalid state parameter' });
    }
    
    // Hapus state dari session setelah verifikasi
    delete (req.session as any).oauthState;
    
    // Periksa apakah provider ada dan aktif
    const oauthProvider = await storage.getOAuthProviderByName(provider);
    if (!oauthProvider || !oauthProvider.enabled) {
      return res.status(404).json({ message: 'Provider not found or disabled' });
    }
    
    // Saat ini kita hanya mendukung Google
    if (provider === 'google') {
      // Dapatkan access token dari kode yang diterima
      // Implementasi ini menggunakan fetch API dengan node-fetch
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code as string,
          client_id: oauthProvider.clientId,
          client_secret: oauthProvider.clientSecret,
          redirect_uri: oauthProvider.redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange code for token: ${tokenResponse.statusText}`);
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Dapatkan info pengguna dengan access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!userInfoResponse.ok) {
        throw new Error(`Failed to get user info: ${userInfoResponse.statusText}`);
      }
      
      const userData = await userInfoResponse.json();
      
      // Cari pengguna berdasarkan provider dan providerid
      let user = await storage.findUserByOAuthProvider(provider, userData.id);
      
      if (!user) {
        // Cek apakah email sudah terdaftar
        const existingUser = await storage.getUserByEmail(userData.email);
        
        if (existingUser) {
          // Hubungkan akun yang ada dengan provider
          await storage.createUserOAuthConnection({
            userId: existingUser.id,
            provider,
            providerId: userData.id,
            accessToken,
            refreshToken: tokenData.refresh_token || null,
            tokenExpiry: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
          });
          
          user = existingUser;
        } else {
          // Buat pengguna baru
          const username = userData.email.split('@')[0] + '_' + randomBytes(4).toString('hex');
          
          user = await storage.createUser({
            username,
            email: userData.email,
            password: randomBytes(20).toString('hex'), // Password acak karena login via OAuth
          });
          
          // Hubungkan pengguna baru dengan provider
          await storage.createUserOAuthConnection({
            userId: user.id,
            provider,
            providerId: userData.id,
            accessToken,
            refreshToken: tokenData.refresh_token || null,
            tokenExpiry: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
          });
          
          // Update info pengguna
          await storage.updateUser(user.id, {
            avatarUrl: userData.picture || null,
          });
        }
      } else {
        // Update token untuk pengguna yang sudah ada
        const connection = await storage.getUserOAuthConnectionByProvider(user.id, provider);
        
        if (connection) {
          // Buat koneksi baru jika tidak ada
          await storage.createUserOAuthConnection({
            userId: user.id,
            provider,
            providerId: userData.id,
            accessToken,
            refreshToken: tokenData.refresh_token || null,
            tokenExpiry: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
          });
        }
      }
      
      // Login pengguna
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to login user after OAuth authentication' });
        }
        
        // Redirect ke halaman profile
        res.redirect('/profile');
      });
    } else {
      return res.status(400).json({ message: 'Unsupported provider' });
    }
  } catch (error) {
    console.error(`Error completing ${req.params.provider} authentication:`, error);
    res.status(500).json({ message: 'Failed to complete authentication' });
  }
});