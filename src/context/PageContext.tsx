import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);

  const toggleThemeMode = () => {
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside an AppThemeProvider');
  }

  return context;
}

type LogInForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  email: string;
  password: string;
  confirm: string;
  name: string;
  phone: string;
  interest: string;
};

type Owner = {
  profileImage:string;
  name:string;
  title:string;
  phone:string;
  email:string;
  balance:string;
}

type AuthContextType = {
  loading: boolean;
  logInForm: LogInForm;
  updateLogInField: (field: "email" | "password", value: string)=>void;
  registerForm: RegisterForm;
  updateRegisterField: (field: "email" | "password" | "confirm" | "name" | "phone" | "interest", value: string)=>void;
  owner: Owner;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const [logInForm, setLogInForm] = useState({
    email: "",
    password: "",
  });
  const updateLogInField = (
    field: keyof typeof logInForm,
    value: string
  ) => {
    setLogInForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "",
    phone: "",
    interest: "",
  });
  
  const updateRegisterField = (
    field: keyof typeof registerForm,
    value: string
  ) => {
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [ owner, setOwner ] = useState({
      profileImage:"https://images.unsplash.com/photo-1788801246805-284ab3eb2860?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5fHx8ZW58MHx8fHx8",
      name:"David Nwaeze",
      title:"Patient ID: CN-20418",
      phone:"(310) 555-0148",
      email:"david@carenest.app",
      balance:"26,000",
      about:"Blood type O+ • No known allergies"
  });

  const updateOwnerField = (
    field: keyof typeof owner,
    value: string
  ) => {
    setOwner((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  return (
    <AuthContext.Provider
      value={{
        loading,
        logInForm,
        updateLogInField,
        registerForm,
        updateRegisterField,
        owner
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}