export interface SessionAccount {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'STUDENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface ProfileRecord {
  name: string;
  profile: {
    specialty: string | null;
    level: string | null;
    biography: string | null;
    skills: Array<{ name: string }>;
    availabilities: Array<{ day: string; startTime: string; endTime: string }>;
  } | null;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface AccountRepository {
  findCredentialUser(email: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    image: string | null;
    passwordHash: string;
    active: boolean;
  } | null>;
  emailExists(email: string): Promise<boolean>;
  createAccount(input: { name: string; email: string; passwordHash: string }): Promise<void>;
  findSessionAccount(userId: string): Promise<SessionAccount | null>;
  getProfile(userId: string): Promise<{ user: ProfileRecord | null; skills: Array<{ id: string; name: string }> }>;
  saveProfile(input: {
    userId: string;
    name: string;
    specialty: string;
    level: string;
    biography: string;
    skills: string[];
  }): Promise<void>;
}
