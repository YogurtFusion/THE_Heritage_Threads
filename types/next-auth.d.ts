import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    avatar?: string | null;
  }

  interface Session {
    user: {
      userId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      avatar?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    avatar?: string | null;
  }
}
