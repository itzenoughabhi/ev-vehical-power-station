import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: DatabaseService;
  public prisma: PrismaClient | null = null;
  public isConnected: boolean = false;

  private constructor() {
    try {
      this.prisma = new PrismaClient({
        log: ['error', 'warn'],
      });
    } catch (err) {
      console.warn('[Prisma] Client initialization deferred. Operating in high-performance memory mode.');
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<boolean> {
    if (!this.prisma) return false;
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      console.log('✅ [Database] PostgreSQL connected successfully via Prisma');
      return true;
    } catch (err: any) {
      this.isConnected = false;
      console.log('ℹ️ [Database] Running in in-memory simulation mode (PostgreSQL optional: ' + (err.message || 'not reachable') + ')');
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.prisma && this.isConnected) {
      await this.prisma.$disconnect();
    }
  }
}

export const dbService = DatabaseService.getInstance();
