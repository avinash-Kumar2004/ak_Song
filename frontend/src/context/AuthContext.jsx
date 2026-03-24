import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import { authAPI } from "../api";

const initialState = {
  user:    null,
  token:   localStorage.getItem("sw_token") || null,
  loading: true,
  error:   null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null };
    case "AUTH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...initialState, loading: false, token: null };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── On mount: verify existing token ──────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      if (!state.token) {
        dispatch({ type: "AUTH_FAIL", payload: null });
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        // backend returns: { status, data: { user } }
        dispatch({ type: "AUTH_SUCCESS", payload: { user: data.data.user, token: state.token } });
      } catch {
        localStorage.removeItem("sw_token");
        dispatch({ type: "LOGOUT" });
      }
    };
    verifyToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Signup ────────────────────────────────────────────────────────────
  const signup = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data } = await authAPI.signup(credentials);
      // backend returns: { status, token, data: { user } }
      localStorage.setItem("sw_token", data.token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user: data.data.user, token: data.token } });
    } catch (err) {
      dispatch({ type: "AUTH_FAIL", payload: err.message });
      throw err;
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data } = await authAPI.login(credentials);
      // backend returns: { status, token, data: { user } }
      localStorage.setItem("sw_token", data.token);
      dispatch({ type: "AUTH_SUCCESS", payload: { user: data.data.user, token: data.token } });
    } catch (err) {
      dispatch({ type: "AUTH_FAIL", payload: err.message });
      throw err;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem("sw_token");
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signup, login, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};