import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { auth, User } from "../utils/auth";
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  LogIn, 
  UserPlus,
  XCircle,
  Info,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AuthPageProps {
  onLogin: (user: { name: string; email: string; phone: string }) => void;
  onCancel?: () => void;
}

export function AuthPage({ onLogin, onCancel }: AuthPageProps) {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupErrors, setSignupErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });


  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10}$/.test(phone.replace(/\D/g, ""));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    if (password.length === 0) return { strength: "", color: "", percentage: 0 };
    if (password.length < 6) return { strength: "Weak", color: "text-red-600", percentage: 25 };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 1) return { strength: "Weak", color: "text-orange-600", percentage: 40 };
    if (score === 2) return { strength: "Fair", color: "text-yellow-600", percentage: 60 };
    if (score === 3) return { strength: "Good", color: "text-blue-600", percentage: 80 };
    return { strength: "Strong", color: "text-green-600", percentage: 100 };
  };

  const validateSignupField = (field: string, value: string) => {
    let error = "";
    
    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!isValidEmail(value)) error = "Invalid email format";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (!isValidPhone(value)) error = "Phone must be 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== signupData.password) error = "Passwords do not match";
        break;
    }
    
    setSignupErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  const getStoredUsers = () => {
    const users = localStorage.getItem("lostfound_users");
    return users ? JSON.parse(users) : {};
  };

  const storeUsers = (users: any) => {
    localStorage.setItem("lostfound_users", JSON.stringify(users));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!loginData.email || !loginData.password) {
      setLoginError("Please fill in all fields.");
      setIsLoggingIn(false);
      return;
    }

    if (!isValidEmail(loginData.email)) {
      setLoginError("Please enter a valid email address.");
      setIsLoggingIn(false);
      return;
    }

    const users = getStoredUsers();
    const user = users[loginData.email];

    if (!user) {
      setLoginError("No account found with this email address.");
      setIsLoggingIn(false);
      return;
    }

    if (user.password !== loginData.password) {
      setLoginError("Incorrect password. Please try again.");
      setIsLoggingIn(false);
      return;
    }

    const userData = {
      name: user.name,
      email: loginData.email,
      phone: user.phone,
    };
    
    localStorage.setItem("lostfound_user", JSON.stringify(userData));
    
    if (loginData.rememberMe) {
      localStorage.setItem("lostfound_remember", "true");
    }
    
    toast.success(`Welcome back, ${user.name}!`);
    setIsLoggingIn(false);
    onLogin(userData);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validate all fields
    const nameValid = validateSignupField("name", signupData.name);
    const emailValid = validateSignupField("email", signupData.email);
    const phoneValid = validateSignupField("phone", signupData.phone);
    const passwordValid = validateSignupField("password", signupData.password);
    const confirmPasswordValid = validateSignupField("confirmPassword", signupData.confirmPassword);

    if (!nameValid || !emailValid || !phoneValid || !passwordValid || !confirmPasswordValid) {
      toast.error("Please fix the errors in the form.");
      setIsSigningUp(false);
      return;
    }

    const users = getStoredUsers();
    if (users[signupData.email]) {
      setSignupErrors(prev => ({ ...prev, email: "An account with this email already exists" }));
      toast.error("An account with this email already exists.");
      setIsSigningUp(false);
      return;
    }

    users[signupData.email] = {
      name: signupData.name,
      email: signupData.email,
      phone: signupData.phone,
      password: signupData.password,
      createdAt: new Date().toISOString(),
    };

    storeUsers(users);

    const userData = { name: signupData.name, email: signupData.email, phone: signupData.phone };
    localStorage.setItem("lostfound_user", JSON.stringify(userData));

    toast.success(`Welcome to Lost & Found, ${signupData.name}!`);
    setIsSigningUp(false);
    onLogin(userData);
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login is not implemented in this demo.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      {onCancel && (
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-primary hover:text-primary-dark hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <div 
        className="bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 text-white py-16 relative"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(6, 182, 212, 0.85), rgba(20, 184, 166, 0.8)), url('https://images.unsplash.com/photo-1639503547276-90230c4a4198?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMHNoaWVsZCUyMHRydXN0fGVufDF8fHx8MTc1OTgyMTUzNnww&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Lost & Found</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90 leading-relaxed">
                Your secure platform for reporting lost items, returning found belongings, and claiming your possessions. 
                Join our community to help reunite people with their lost items.
              </p>

              <h3 className="text-xl font-semibold mb-4">Why create an account?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 mt-0.5 fill-white" />
                  <span>Track your reports and claims</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 mt-0.5 fill-white" />
                  <span>Securely upload proof of ownership</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 mt-0.5 fill-white" />
                  <span>Get notified when matching items appear</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 mt-0.5 fill-white" />
                  <span>Manage your contact information</span>
                </li>
              </ul>
            </div>

            <Card className="shadow-2xl">
              <CardContent className="p-0">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-xl">
                    <TabsTrigger value="login" className="rounded-none rounded-tl-xl">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-none rounded-tr-xl">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="p-6 space-y-4">
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-cyan-800 flex items-center gap-2">
                        <Info className="h-4 w-4 shrink-0" />
                        <span><strong>Demo Account:</strong> demo@lostfound.com / demo123</span>
                      </p>
                    </div>

                    {loginError && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loginEmail">Email Address *</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => {
                            setLoginData({ ...loginData, email: e.target.value });
                            setLoginError("");
                          }}
                          required
                          autoComplete="username"
                          disabled={isLoggingIn}
                          className="transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="loginPassword">Password *</Label>
                          <button
                            type="button"
                            className="text-sm text-primary hover:text-primary-dark transition-colors"
                            onClick={() => toast.info("Password reset is not available in demo mode")}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            id="loginPassword"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => {
                              setLoginData({ ...loginData, password: e.target.value });
                              setLoginError("");
                            }}
                            required
                            autoComplete="current-password"
                            disabled={isLoggingIn}
                            className="pr-10 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={loginData.rememberMe}
                          onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          disabled={isLoggingIn}
                        />
                        <Label htmlFor="rememberMe" className="cursor-pointer text-sm">
                          Remember me for 30 days
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
                        size="lg"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Signing In...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">or</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin("Google")}
                        >
                          <span className="mr-2">🔍</span> Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin("Facebook")}
                        >
                          <span className="mr-2">📘</span> Facebook
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup" className="p-6 space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signupName">Full Name *</Label>
                        <Input
                          id="signupName"
                          type="text"
                          placeholder="John Doe"
                          value={signupData.name}
                          onChange={(e) => {
                            setSignupData({ ...signupData, name: e.target.value });
                            if (signupErrors.name) validateSignupField("name", e.target.value);
                          }}
                          onBlur={(e) => validateSignupField("name", e.target.value)}
                          required
                          autoComplete="name"
                          disabled={isSigningUp}
                          className={signupErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {signupErrors.name && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {signupErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Email Address *</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={signupData.email}
                          onChange={(e) => {
                            setSignupData({ ...signupData, email: e.target.value });
                            if (signupErrors.email) validateSignupField("email", e.target.value);
                          }}
                          onBlur={(e) => validateSignupField("email", e.target.value)}
                          required
                          autoComplete="username"
                          disabled={isSigningUp}
                          className={signupErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {signupErrors.email && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {signupErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPhone">Contact Number *</Label>
                        <Input
                          id="signupPhone"
                          type="tel"
                          placeholder="9876543210"
                          value={signupData.phone}
                          onChange={(e) => {
                            setSignupData({ ...signupData, phone: e.target.value });
                            if (signupErrors.phone) validateSignupField("phone", e.target.value);
                          }}
                          onBlur={(e) => validateSignupField("phone", e.target.value)}
                          required
                          autoComplete="tel"
                          disabled={isSigningUp}
                          className={signupErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {signupErrors.phone && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {signupErrors.phone}
                          </p>
                        )}
                        {!signupErrors.phone && signupData.phone && (
                          <p className="text-xs text-muted-foreground">
                            Must be a valid 10-digit phone number
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">Password *</Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="Minimum 6 characters"
                            value={signupData.password}
                            onChange={(e) => {
                              setSignupData({ ...signupData, password: e.target.value });
                              if (signupErrors.password) validateSignupField("password", e.target.value);
                              if (signupData.confirmPassword) validateSignupField("confirmPassword", signupData.confirmPassword);
                            }}
                            onBlur={(e) => validateSignupField("password", e.target.value)}
                            required
                            autoComplete="new-password"
                            disabled={isSigningUp}
                            className={`pr-10 ${signupErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showSignupPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {signupErrors.password && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {signupErrors.password}
                          </p>
                        )}
                        {signupData.password && !signupErrors.password && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Password strength:</span>
                              <span className={`font-medium ${getPasswordStrength(signupData.password).color}`}>
                                {getPasswordStrength(signupData.password).strength}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  getPasswordStrength(signupData.password).strength === "Weak" ? "bg-red-500" :
                                  getPasswordStrength(signupData.password).strength === "Fair" ? "bg-yellow-500" :
                                  getPasswordStrength(signupData.password).strength === "Good" ? "bg-blue-500" :
                                  "bg-green-500"
                                }`}
                                style={{ width: `${getPasswordStrength(signupData.password).percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={signupData.confirmPassword}
                            onChange={(e) => {
                              setSignupData({ ...signupData, confirmPassword: e.target.value });
                              if (signupErrors.confirmPassword) validateSignupField("confirmPassword", e.target.value);
                            }}
                            onBlur={(e) => validateSignupField("confirmPassword", e.target.value)}
                            required
                            autoComplete="new-password"
                            disabled={isSigningUp}
                            className={`pr-10 ${signupErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {signupErrors.confirmPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {signupErrors.confirmPassword}
                          </p>
                        )}
                        {signupData.confirmPassword && !signupErrors.confirmPassword && signupData.password === signupData.confirmPassword && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Passwords match
                          </p>
                        )}
                      </div>

                      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-xs text-cyan-800">
                        <p className="font-medium mb-1">Password requirements:</p>
                        <ul className="space-y-0.5 ml-4 list-disc">
                          <li>At least 6 characters long</li>
                          <li>For better security: mix uppercase, lowercase, numbers & symbols</li>
                        </ul>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700" 
                        size="lg"
                        disabled={isSigningUp}
                      >
                        {isSigningUp ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating Account...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white text-center py-6 mt-16">
        <p>Contact: support@lostfound.com | © 2025 Lost & Found</p>
      </footer>
    </div>
  );
}