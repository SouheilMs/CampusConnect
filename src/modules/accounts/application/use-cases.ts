import { DomainError } from '@/domain/errors';
import type { AccountRepository, PasswordHasher } from './ports';

export class AccountService {
  constructor(
    private readonly repository: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(input: { name: string; email: string; password: string }) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || input.password.length < 6) throw new DomainError('Invalid registration');
    if (await this.repository.emailExists(email)) throw new DomainError('Email already registered');
    const passwordHash = await this.passwordHasher.hash(input.password);
    await this.repository.createAccount({ name, email, passwordHash });
  }

  async authenticate(input: { email: string; password: string }) {
    const account = await this.repository.findCredentialUser(input.email.trim().toLowerCase());
    if (!account?.active || !(await this.passwordHasher.compare(input.password, account.passwordHash))) return null;
    return { id: account.id, name: account.name, email: account.email, role: account.role, image: account.image };
  }

  getProfile(userId: string) {
    return this.repository.getProfile(userId);
  }

  saveProfile(input: Parameters<AccountRepository['saveProfile']>[0]) {
    return this.repository.saveProfile(input);
  }

  async getActiveAccount(userId: string) {
    const account = await this.repository.findSessionAccount(userId);
    return account?.status === 'ACTIVE' ? account : null;
  }
}
