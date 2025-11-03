import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "../features/authSlice";
import { Link } from "react-router-dom";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  // --- Validation Helpers ---
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name);
  const isStrongPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);

  // --- Handle Signup/Login ---
  const handleRegistration = async (type) => {
    if (type === "signup") {
      const { name, email, password, confirmPassword } = signupInput;

      if (!name.trim() || !email.trim() || !password || !confirmPassword)
        return toast.error("All fields are required.");

      if (!isValidName(name))
        return toast.error("Name should only contain letters and spaces.");

      if (!isValidEmail(email))
        return toast.error("Please enter a valid email address.");

      if (!isStrongPassword(password))
        return toast.error(
          "Password must include at least 6 characters, 1 uppercase letter, 1 number, and 1 special character."
        );

      if (password !== confirmPassword)
        return toast.error("Passwords do not match.");

      await registerUser({ name, email, password });
    } else {
      const { email, password } = loginInput;

      if (!email.trim() || !password.trim())
        return toast.error("Email and password are required.");

      if (!isValidEmail(email))
        return toast.error("Please enter a valid email address.");

      await loginUser({ email, password });
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData)
      toast.success(registerData.message || "Signup successful.");
    if (registerError)
      toast.error(registerError.data?.message || "Signup Failed");
    if (loginIsSuccess && loginData) {
      dispatch(userLoggedIn({ user: loginData.user }));
      toast.success(loginData.message || "Login successful.");
      const { role } = loginData.user || {};
      if (role === "real_admin") navigate("/real_admin/dashboard");
      else if (role === "admin" || role === "instructor")
        navigate("/admin/dashboard");
      else navigate("/");
    }
    if (loginError) toast.error(loginError.data?.message || "Login Failed");
  }, [
    loginIsSuccess,
    loginData,
    loginError,
    registerIsSuccess,
    registerData,
    registerError,
    dispatch,
    navigate,
  ]);

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        {/* Signup Tab */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. bibek"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. bibek@gmail.com"
                  required
                />
              </div>
              <div className="space-y-1 relative">
                <Label>Password</Label>
                <Input
                  type={showSignupPassword ? "text" : "password"}
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Minimum 6 characters Eg. Bibek@123"
                  required
                />
                <span
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
                >
                  {showSignupPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </span>
              </div>
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={signupInput.confirmPassword}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login with your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. user@nexvidya.com"
                  required
                />
              </div>
              <div className="space-y-1 relative">
                <Label>Password</Label>
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. User@123"
                  required
                />
                <span
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <div className="text-sm text-right text-blue-500 hover:underline cursor-pointer">
                <Link
                  to="/forgot-password"
                  className="text-blue-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
