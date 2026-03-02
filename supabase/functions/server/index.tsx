import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for storage and auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// Initialize storage bucket for profile pictures
async function initStorage() {
  const bucketName = 'make-ea69f32e-profiles';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
  }
}
initStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ea69f32e/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default admin users
async function initAdmins() {
  const admins = await kv.get('admins');
  if (!admins) {
    await kv.set('admins', {
      president: {
        username: 'president@ssfmym',
        password: 'munim',
        name: 'তানজিল হোসেন মুণিম',
        role: 'president'
      },
      secretary: {
        username: 'gs@ssfmym',
        password: 'adi',
        name: 'চিত্রণ ভট্টাচার্য আদি',
        role: 'secretary'
      }
    });
  }
}
initAdmins();

// Login endpoint
app.post("/make-server-ea69f32e/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Check if admin
    const admins = await kv.get('admins') || {};
    const adminUser = Object.values(admins).find((admin: any) => 
      admin.username === username && admin.password === password
    );
    
    if (adminUser) {
      return c.json({ 
        success: true, 
        user: { ...adminUser, id: username },
        isAdmin: true
      });
    }
    
    // Check if regular user
    const users = await kv.get('users') || {};
    const user = Object.values(users).find((u: any) => 
      u.username === username && u.password === password
    );
    
    if (user) {
      if (user.status === 'blocked') {
        return c.json({ success: false, error: 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে' }, 403);
      }
      if (user.status === 'pending') {
        return c.json({ success: false, error: 'আপনার অ্যাকাউন্ট যাচাইয়ের অপেক্ষায় রয়েছে' }, 403);
      }
      return c.json({ 
        success: true, 
        user: { ...user, id: user.username },
        isAdmin: false
      });
    }
    
    return c.json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' }, 401);
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ success: false, error: 'লগইন করতে সমস্যা হয়েছে' }, 500);
  }
});

// Register endpoint
app.post("/make-server-ea69f32e/register", async (c) => {
  try {
    const { username, password, name } = await c.req.json();
    
    const users = await kv.get('users') || {};
    const admins = await kv.get('admins') || {};
    
    // Check if username exists
    if (users[username] || Object.values(admins).some((a: any) => a.username === username)) {
      return c.json({ success: false, error: 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হচ্ছে' }, 400);
    }
    
    // Create new user with pending status
    users[username] = {
      username,
      password,
      name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      attendance: { present: 0, total: 0 },
      understanding: []
    };
    
    await kv.set('users', users);
    
    return c.json({ success: true, message: 'অ্যাকাউন্ট তৈরি হয়েছে। যাচাইয়ের অপেক্ষায় রয়েছে।' });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ success: false, error: 'রেজিস্ট্রেশনে সমস্যা হয়েছে' }, 500);
  }
});

// Get pending users (admin only)
app.get("/make-server-ea69f32e/pending-users", async (c) => {
  try {
    const users = await kv.get('users') || {};
    const pending = Object.values(users).filter((u: any) => u.status === 'pending');
    return c.json({ success: true, users: pending });
  } catch (error) {
    console.log('Get pending users error:', error);
    return c.json({ success: false, error: 'ডেটা লোড করতে সমস্যা হয়েছে' }, 500);
  }
});

// Verify user (admin only)
app.post("/make-server-ea69f32e/verify-user", async (c) => {
  try {
    const { username } = await c.req.json();
    const users = await kv.get('users') || {};
    
    if (users[username]) {
      users[username].status = 'active';
      await kv.set('users', users);
      return c.json({ success: true });
    }
    
    return c.json({ success: false, error: 'ইউজার পাওয়া যায়নি' }, 404);
  } catch (error) {
    console.log('Verify user error:', error);
    return c.json({ success: false, error: 'যাচাইয়ে সমস্যা হয়েছে' }, 500);
  }
});

// Reject user (admin only)
app.post("/make-server-ea69f32e/reject-user", async (c) => {
  try {
    const { username } = await c.req.json();
    const users = await kv.get('users') || {};
    
    if (users[username]) {
      users[username].status = 'blocked';
      await kv.set('users', users);
      return c.json({ success: true });
    }
    
    return c.json({ success: false, error: 'ইউজার পাওয়া যায়নি' }, 404);
  } catch (error) {
    console.log('Reject user error:', error);
    return c.json({ success: false, error: 'প্রত্যাখ্যানে সমস্যা হয়েছে' }, 500);
  }
});

// Get all users
app.get("/make-server-ea69f32e/users", async (c) => {
  try {
    const users = await kv.get('users') || {};
    const activeUsers = Object.values(users).filter((u: any) => u.status === 'active');
    return c.json({ success: true, users: activeUsers });
  } catch (error) {
    console.log('Get users error:', error);
    return c.json({ success: false, error: 'ডেটা লোড করতে সমস্যা হয়েছে' }, 500);
  }
});

// Update user progress (admin only)
app.post("/make-server-ea69f32e/update-progress", async (c) => {
  try {
    const { username, attendance, understanding, comment } = await c.req.json();
    const users = await kv.get('users') || {};
    
    if (users[username]) {
      if (attendance) {
        users[username].attendance = attendance;
      }
      if (understanding) {
        users[username].understanding = understanding;
      }
      if (comment !== undefined) {
        users[username].comment = comment;
      }
      users[username].lastUpdated = new Date().toISOString();
      
      await kv.set('users', users);
      return c.json({ success: true });
    }
    
    return c.json({ success: false, error: 'ইউজার পাওয়া যায়নি' }, 404);
  } catch (error) {
    console.log('Update progress error:', error);
    return c.json({ success: false, error: 'আপডেট করতে সমস্যা হয়েছে' }, 500);
  }
});

// Update admin settings
app.post("/make-server-ea69f32e/update-admin", async (c) => {
  try {
    const { role, password } = await c.req.json();
    const admins = await kv.get('admins') || {};
    
    if (admins[role]) {
      admins[role].password = password;
      await kv.set('admins', admins);
      return c.json({ success: true });
    }
    
    return c.json({ success: false, error: 'অ্যাডমিন পাওয়া যায়নি' }, 404);
  } catch (error) {
    console.log('Update admin error:', error);
    return c.json({ success: false, error: 'আপডেট করতে সমস্যা হয়েছে' }, 500);
  }
});

// Upload profile picture
app.post("/make-server-ea69f32e/upload-profile", async (c) => {
  try {
    const body = await c.req.json();
    const { username, imageData } = body;
    
    const bucketName = 'make-ea69f32e-profiles';
    const fileName = `${username}-${Date.now()}.png`;
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year
    
    // Update user profile
    const users = await kv.get('users') || {};
    const admins = await kv.get('admins') || {};
    
    if (users[username]) {
      users[username].profilePicture = urlData?.signedUrl;
      await kv.set('users', users);
    } else if (admins.president?.username === username) {
      admins.president.profilePicture = urlData?.signedUrl;
      await kv.set('admins', admins);
    } else if (admins.secretary?.username === username) {
      admins.secretary.profilePicture = urlData?.signedUrl;
      await kv.set('admins', admins);
    }
    
    return c.json({ success: true, url: urlData?.signedUrl });
  } catch (error) {
    console.log('Upload profile picture error:', error);
    return c.json({ success: false, error: 'ছবি আপলোড করতে সমস্যা হয়েছে' }, 500);
  }
});

// Submit appeal (blocked users)
app.post("/make-server-ea69f32e/submit-appeal", async (c) => {
  try {
    const { username, message } = await c.req.json();
    const appeals = await kv.get('appeals') || {};
    
    appeals[username] = {
      username,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await kv.set('appeals', appeals);
    return c.json({ success: true, message: 'আপনার আবেদন পাঠানো হয়েছে' });
  } catch (error) {
    console.log('Submit appeal error:', error);
    return c.json({ success: false, error: 'আবেদন পাঠাতে সমস্যা হয়েছে' }, 500);
  }
});

// Get pending appeals (admin only)
app.get("/make-server-ea69f32e/pending-appeals", async (c) => {
  try {
    const appeals = await kv.get('appeals') || {};
    const pending = Object.values(appeals).filter((a: any) => a.status === 'pending');
    return c.json({ success: true, appeals: pending });
  } catch (error) {
    console.log('Get pending appeals error:', error);
    return c.json({ success: false, error: 'ডেটা লোড করতে সমস্যা হয়েছে' }, 500);
  }
});

// Approve appeal (admin only)
app.post("/make-server-ea69f32e/approve-appeal", async (c) => {
  try {
    const { username } = await c.req.json();
    const users = await kv.get('users') || {};
    const appeals = await kv.get('appeals') || {};
    
    if (users[username]) {
      users[username].status = 'active';
      await kv.set('users', users);
    }
    
    if (appeals[username]) {
      appeals[username].status = 'approved';
      await kv.set('appeals', appeals);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Approve appeal error:', error);
    return c.json({ success: false, error: 'অনুমোদনে সমস্যা হয়েছে' }, 500);
  }
});

Deno.serve(app.fetch);