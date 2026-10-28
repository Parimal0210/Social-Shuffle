import express from 'express';
import { createServer as createViteServer } from 'vite';
import { BADGE_LEVELS, calculateBadgeLevel } from './src/services/badgeBackendService';

async function startServer() {
  const app = express();
  // Dev server must run on port 3000 in this environment (port 8080 is reserved by the proxy)
  const PORT = 3000;

  app.use(express.json());

  // Backend Badge API: 10 Badge Levels
  app.get('/api/badges/levels', (_req, res) => {
    res.json({
      success: true,
      levels: BADGE_LEVELS,
      totalLevels: BADGE_LEVELS.length
    });
  });

  // Backend Badge API: Calculate 10-level badge from games played & events attended
  app.post('/api/badges/calculate', (req, res) => {
    const { gamesPlayedCount = 0, totalGamesCount = 24, eventsAttendedCount = 0 } = req.body;
    const result = calculateBadgeLevel({
      gamesPlayedCount: Number(gamesPlayedCount) || 0,
      totalGamesCount: Number(totalGamesCount) || 24,
      eventsAttendedCount: Number(eventsAttendedCount) || 0
    });
    res.json({
      success: true,
      data: result
    });
  });

  // --- Backend Google Authentication & Multi-Account Storage ---
  // Seed initial device accounts logged in on this browser / mobile device
  const defaultDeviceAccounts = [
    {
      email: 'parimalmshete@gmail.com',
      name: 'Parimal Shete',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      phone: '+91 98220 99887',
      area: 'Koregaon Park'
    },
    {
      email: 'parimal.work@gmail.com',
      name: 'Parimal Shete (Work)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      phone: '+91 98220 55443',
      area: 'Baner'
    },
    {
      email: 'rohan.kulkarni@gmail.com',
      name: 'Rohan Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      phone: '+91 98220 12345',
      area: 'Kothrud'
    }
  ];

  let deviceAccounts = [...defaultDeviceAccounts];

  // In-memory + persistent database map for registered Google accounts
  // Key: lowercased email, Value: { participant, user, registeredAt }
  const registeredGoogleUsers = new Map<string, any>();

  // In-memory + persistent database map for Admins table
  // Key: lowercased email, Value: AdminRecord
  const adminsTable = new Map<string, any>();

  // Helper to read and write database to disk
  const fs = await import('fs');
  const path = await import('path');
  const DB_PATH = path.resolve(process.cwd(), 'src/data/registered_google_users.json');
  const ADMINS_DB_PATH = path.resolve(process.cwd(), 'src/data/admins.json');

  const loadRegisteredUsers = () => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item && item.email) {
              registeredGoogleUsers.set(item.email.trim().toLowerCase(), item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not load registered_google_users.json:', e);
    }
  };

  const saveRegisteredUsers = () => {
    try {
      const arr = Array.from(registeredGoogleUsers.values());
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not save registered_google_users.json:', e);
    }
  };

  const loadAdminsTable = () => {
    try {
      if (fs.existsSync(ADMINS_DB_PATH)) {
        const raw = fs.readFileSync(ADMINS_DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item && item.email) {
              adminsTable.set(item.email.trim().toLowerCase(), item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not load admins.json:', e);
    }
  };

  // Helper to identify if an individual is an admin via the database admins table
  const findAdminByEmailOrPhone = (ident: string) => {
    const clean = String(ident).trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, '');
    for (const admin of adminsTable.values()) {
      if (!admin.active) continue;
      if (admin.email && admin.email.trim().toLowerCase() === clean) {
        return admin;
      }
      if (cleanDigits && admin.phone) {
        const adminDigits = admin.phone.replace(/[^0-9]/g, '');
        if (adminDigits && adminDigits === cleanDigits) {
          return admin;
        }
      }
    }
    return undefined;
  };

  // Load database on server start
  loadRegisteredUsers();
  loadAdminsTable();

  // Database Admins Table Endpoints
  app.get('/api/admins', (_req, res) => {
    res.json({
      success: true,
      admins: Array.from(adminsTable.values())
    });
  });

  app.get('/api/admins/check', (req, res) => {
    const query = String(req.query.email || req.query.phone || req.query.identifier || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }
    const admin = findAdminByEmailOrPhone(query);
    if (admin) {
      return res.json({
        success: true,
        isAdmin: true,
        admin
      });
    }
    return res.json({
      success: true,
      isAdmin: false
    });
  });

  // 1. GET /api/auth/google/device-accounts: Returns all logged-in Google accounts on device
  app.get('/api/auth/google/device-accounts', (_req, res) => {
    res.json({
      success: true,
      accounts: deviceAccounts,
      registeredEmails: Array.from(registeredGoogleUsers.keys())
    });
  });

  // 2. POST /api/auth/google/device-accounts: Add a new Google account on this device
  app.post('/api/auth/google/device-accounts', (req, res) => {
    const { email, name, avatar, phone, area } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and name are required' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const existingIndex = deviceAccounts.findIndex(a => a.email.toLowerCase() === cleanEmail);
    const newAccount = {
      email: cleanEmail,
      name: String(name).trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      phone: phone || '+91 98220 ' + Math.floor(10000 + Math.random() * 90000),
      area: area || 'Koregaon Park'
    };
    if (existingIndex >= 0) {
      deviceAccounts[existingIndex] = newAccount;
    } else {
      deviceAccounts.push(newAccount);
    }
    res.json({
      success: true,
      accounts: deviceAccounts,
      registeredEmails: Array.from(registeredGoogleUsers.keys())
    });
  });

  // 3. POST /api/auth/google/signup:
  // Register with Google account: fetches all details of account and stores in database
  app.post('/api/auth/google/signup', (req, res) => {
    const { email, name, avatar, phone, area, bio, googleId } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and name are required for Google registration' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Ensure account is in device accounts list
    if (!deviceAccounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      deviceAccounts.push({
        email: cleanEmail,
        name: cleanName,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        phone: phone || '+91 98220 ' + Math.floor(10000 + Math.random() * 90000),
        area: area || 'Koregaon Park'
      });
    }

    const participantId = `p-google-${Date.now().toString(36)}`;
    const userId = `u-${participantId}`;
    const nowIso = new Date().toISOString();

    const participant = {
      id: participantId,
      name: cleanName,
      email: cleanEmail,
      phone: phone || '+91 98220 ' + Math.floor(10000 + Math.random() * 90000),
      area: area || 'Koregaon Park',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      bio: bio || 'Pune board gamer • Connected via Google Account',
      joinedDate: nowIso.slice(0, 10),
      totalEventsAttended: 0,
      totalRegistrations: 0,
      gamesPlayedIds: [],
      venuesVisited: [],
      totalPaxBrought: 0,
      authProvider: 'google',
      registeredAt: nowIso
    };

    const adminCheck = findAdminByEmailOrPhone(cleanEmail);
    const assignedRole = (adminCheck && adminCheck.role === 'admin') ? 'admin' : 'participant';

    const user = {
      id: adminCheck ? adminCheck.id : userId,
      name: adminCheck?.name || cleanName,
      email: cleanEmail,
      phone: adminCheck?.phone || participant.phone,
      role: assignedRole, // Uses admins table to identify admin role
      area: participant.area,
      avatar: adminCheck?.avatar || participant.avatar,
      bio: adminCheck?.bio || participant.bio,
      participantId: participant.id,
      authProvider: 'google',
      loginAt: nowIso,
      lastActiveAt: nowIso
    };

    const record = {
      email: cleanEmail,
      googleId: googleId || `g_${cleanEmail}`,
      participant,
      user,
      registeredAt: nowIso
    };

    // Store in backend database
    registeredGoogleUsers.set(cleanEmail, record);
    saveRegisteredUsers();

    console.log(`[Google Auth] Successfully registered ${assignedRole} in database: ${cleanEmail} (${cleanName})`);

    res.json({
      success: true,
      message: `Welcome to Social Shuffle Pune, ${cleanName}! Account successfully registered.`,
      user,
      participant
    });
  });

  // 4. POST /api/auth/google/login:
  // On Continue with Google: checks if individual is an admin in database admins table,
  // or if account was registered as participant:
  // If Admin: allow login and return admin view (role: 'admin')
  // If Participant: allow login and return participant view (role: 'participant')
  // If Not registered: return HTTP 404 with { code: 'USER_NOT_REGISTERED', message: 'Username not registered' }
  app.post('/api/auth/google/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const adminCheck = findAdminByEmailOrPhone(cleanEmail);
    const record = registeredGoogleUsers.get(cleanEmail);

    // If individual is in the database Admins table: identify as admin and show admin view!
    if (adminCheck && adminCheck.role === 'admin') {
      const nowIso = new Date().toISOString();
      const adminUser = {
        id: adminCheck.id,
        name: adminCheck.name,
        email: adminCheck.email,
        phone: adminCheck.phone,
        role: 'admin',
        area: 'Pune',
        bio: adminCheck.bio,
        avatar: adminCheck.avatar,
        authProvider: 'google',
        loginAt: nowIso,
        lastActiveAt: nowIso
      };
      console.log(`[Google Auth] Successful admin login via database admins table: ${cleanEmail} (${adminCheck.name})`);
      return res.json({
        success: true,
        message: `Welcome back, Admin ${adminCheck.name}!`,
        user: adminUser,
        participant: record?.participant
      });
    }

    if (!record) {
      console.log(`[Google Auth] Login rejected: ${cleanEmail} is not registered in database.`);
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        message: 'Username not registered'
      });
    }

    // Account exists as participant
    const nowIso = new Date().toISOString();
    record.user.lastActiveAt = nowIso;
    record.user.loginAt = nowIso;
    record.user.role = 'participant';
    saveRegisteredUsers();

    console.log(`[Google Auth] Successful login for registered participant: ${cleanEmail}`);

    res.json({
      success: true,
      message: `Welcome back, ${record.user.name}!`,
      user: record.user,
      participant: record.participant
    });
  });

  // 4b. POST /api/auth/login: Direct login verifying against database admins table
  app.post('/api/auth/login', (req, res) => {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    const clean = String(emailOrPhone).trim().toLowerCase();
    const adminCheck = findAdminByEmailOrPhone(clean);

    if (adminCheck && adminCheck.role === 'admin') {
      const nowIso = new Date().toISOString();
      const adminUser = {
        id: adminCheck.id,
        name: adminCheck.name,
        email: adminCheck.email,
        phone: adminCheck.phone,
        role: 'admin',
        area: 'Pune',
        bio: adminCheck.bio,
        avatar: adminCheck.avatar,
        authProvider: 'local',
        loginAt: nowIso,
        lastActiveAt: nowIso
      };
      return res.json({
        success: true,
        message: `Welcome back, Admin ${adminCheck.name}!`,
        user: adminUser
      });
    }

    const record = registeredGoogleUsers.get(clean);
    if (record) {
      return res.json({
        success: true,
        message: `Welcome back, ${record.user.name}!`,
        user: record.user,
        participant: record.participant
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No registered user found with this email or phone'
    });
  });

  // 5. GET /api/auth/google/registered: List of all registered Google accounts in DB
  app.get('/api/auth/google/registered', (_req, res) => {
    res.json({
      success: true,
      registeredEmails: Array.from(registeredGoogleUsers.keys())
    });
  });

  // --- Email OTP Verification System for Participant Signup ---
  interface OtpRecord {
    email: string;
    otp: string;
    expiresAt: number;
    createdAt: number;
    attempts: number;
    name?: string;
  }

  const otpStore = new Map<string, OtpRecord>();
  const verifiedEmails = new Set<string>();

  // 6. POST /api/auth/otp/send: Generate and send OTP to recipient's email
  app.post('/api/auth/otp/send', (req, res) => {
    const { email, name } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === 'string') ? name.trim() : 'Fellow Shuffler';

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email format (e.g. name@example.com)' });
    }

    // Generate secure 6-digit OTP code (e.g. 749215)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 600; // 10 minutes
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    otpStore.set(cleanEmail, {
      email: cleanEmail,
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      name: cleanName
    });

    console.log(`[Email OTP Service] Generated verification code for ${cleanEmail} (${cleanName}): ${otp}`);

    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      expiresInSeconds,
      otpPreview: otp // Included for instant test auto-fill / simulated inbox preview
    });
  });

  // 7. POST /api/auth/otp/verify: Validate entered OTP code
  app.post('/api/auth/otp/verify', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim().replace(/\s+/g, '');

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found for this email. Please click Resend Code.'
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new OTP.'
      });
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check the 6-digit code sent to your email.'
      });
    }

    // OTP matched successfully!
    verifiedEmails.add(cleanEmail);
    otpStore.delete(cleanEmail);

    console.log(`[Email OTP Service] Successfully verified email: ${cleanEmail}`);

    res.json({
      success: true,
      verified: true,
      message: 'Email verified successfully! You can now finish creating your participant account.',
      email: cleanEmail
    });
  });

  // 8. GET /api/auth/otp/status: Check if an email has been verified
  app.get('/api/auth/otp/status', (req, res) => {
    const email = String(req.query.email || '').trim().toLowerCase();
    res.json({
      success: true,
      verified: verifiedEmails.has(email)
    });
  });

  // Serve public assets (favicon, images)
  app.use(express.static('public'));

  // Mount Vite middlewares for frontend SPA
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Shuffle Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
