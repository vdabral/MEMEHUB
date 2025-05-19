import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Transition } from "@headlessui/react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Status icon component for input validation
function StatusIcon({ status }: { status: string }) {
  if (status === "valid") {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  } else if (status === "invalid") {
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldStatus, setFieldStatus] = useState({
    identifier: "" as "" | "valid" | "invalid",
    password: "" as "" | "valid" | "invalid",
  });
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
  });

  const validateField = (field: "identifier" | "password", value: string) => {
    if (field === "identifier") {
      if (!value.trim()) {
        setFieldStatus(prev => ({ ...prev, identifier: "invalid" }));
        setErrors(prev => ({ ...prev, identifier: "Username or email is required" }));
        return false;
      } else {
        setFieldStatus(prev => ({ ...prev, identifier: "valid" }));
        setErrors(prev => ({ ...prev, identifier: "" }));
        return true;
      }
    } else if (field === "password") {
      if (!value) {
        setFieldStatus(prev => ({ ...prev, password: "invalid" }));
        setErrors(prev => ({ ...prev, password: "Password is required" }));
        return false;
      } else {
        setFieldStatus(prev => ({ ...prev, password: "valid" }));
        setErrors(prev => ({ ...prev, password: "" }));
        return true;
      }
    }
    return true;
  };

  const validateForm = () => {
    const isIdentifierValid = validateField("identifier", identifier);
    const isPasswordValid = validateField("password", password);
    return isIdentifierValid && isPasswordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      await login(identifier, password);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials");
      setFieldStatus({
        identifier: "invalid",
        password: "invalid",
      });
      setErrors({
        identifier: "",
        password: "Invalid username/email or password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="identifier">Username or Email</Label>
                  <StatusIcon status={fieldStatus.identifier} />
                </div>
                <div className="relative">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your username or email"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (e.target.value) validateField("identifier", e.target.value);
                    }}
                    onBlur={(e) => validateField("identifier", e.target.value)}
                    className={`${
                      fieldStatus.identifier === "invalid" 
                        ? "border-red-500 focus:ring-red-500" 
                        : fieldStatus.identifier === "valid"
                        ? "border-green-500 focus:ring-green-500" 
                        : ""
                    }`}
                  />
                </div>
                <Transition
                  show={!!errors.identifier}
                  enter="transition-opacity duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.identifier}
                  </p>
                </Transition>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <StatusIcon status={fieldStatus.password} />
                  <Link
                    to="/forgot-password"
                    className="text-sm text-meme-purple hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    className={`${
                      fieldStatus.password === "invalid" 
                        ? "border-red-500 focus:ring-red-500" 
                        : fieldStatus.password === "valid"
                        ? "border-green-500 focus:ring-green-500" 
                        : ""
                    }`}
                  />
                </div>
                <Transition
                  show={!!errors.password}
                  enter="transition-opacity duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                </Transition>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <motion.div 
              className="mt-2 text-center text-sm"
              variants={itemVariants}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-meme-purple hover:underline font-medium"
              >
                Register
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>  );
}
