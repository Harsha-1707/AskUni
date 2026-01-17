// Demo users for testing and demos (no backend required)
export const DEMO_USERS = {
  admin: {
    email: 'admin@askuni.com',
    password: 'admin123',
    user: {
      id: 'demo-admin-001',
      email: 'admin@askuni.com',
      role: 'admin',
    },
    token: 'demo-token-admin-' + btoa('admin@askuni.com'),
  },
  student: {
    email: 'student@askuni.com',
    password: 'student123',
    user: {
      id: 'demo-student-001',
      email: 'student@askuni.com',
      role: 'student',
    },
    token: 'demo-token-student-' + btoa('student@askuni.com'),
  },
};

// Enable demo mode when backend is unavailable
export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function authenticateDemoUser(email: string, password: string) {
  const user = Object.values(DEMO_USERS).find(
    (u) => u.email === email && u.password === password
  );
  
  if (user) {
    return {
      access_token: user.token,
      user: user.user,
    };
  }
  
  throw new Error('Invalid credentials');
}
