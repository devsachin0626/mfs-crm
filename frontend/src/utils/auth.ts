const TOKEN_KEY =
  "mfs_crm_token";

const IMPERSONATION_SESSION_KEY =
  "mfs_crm_impersonation_session";

export interface StoredAuthEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string;
  email?: string;
  role: string;
  branch: string;
  profileImage?: string | null;
}

export interface ImpersonationSession {
  token: string;

  employee:
    StoredAuthEmployee;
}

export const setToken = (
  token: string
): void => {
  localStorage.setItem(
    TOKEN_KEY,
    token
  );
};

export const getToken =
  (): string | null => {
    return localStorage.getItem(
      TOKEN_KEY
    );
  };

export const removeToken =
  (): void => {
    localStorage.removeItem(
      TOKEN_KEY
    );
  };

export const saveImpersonationSession =
  (
    session:
      ImpersonationSession
  ): void => {
    sessionStorage.setItem(
      IMPERSONATION_SESSION_KEY,
      JSON.stringify(
        session
      )
    );
  };

export const getImpersonationSession =
  ():
    | ImpersonationSession
    | null => {
    const stored =
      sessionStorage.getItem(
        IMPERSONATION_SESSION_KEY
      );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(
        stored
      ) as ImpersonationSession;
    } catch {
      sessionStorage.removeItem(
        IMPERSONATION_SESSION_KEY
      );

      return null;
    }
  };

export const clearImpersonationSession =
  (): void => {
    sessionStorage.removeItem(
      IMPERSONATION_SESSION_KEY
    );
  };
