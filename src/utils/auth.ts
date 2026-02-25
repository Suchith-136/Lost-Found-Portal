export interface User {
  name: string;
  email: string;
  phone: string;
}

const AUTH_KEY = 'lostfound_user';

export const auth = {
  isLoggedIn(): boolean {
    return localStorage.getItem(AUTH_KEY) !== null;
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(AUTH_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  login(user: User) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
  },
};
