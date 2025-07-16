// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { signIn, createUser, getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Shield } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await signIn(email, password);
      setCurrentUser(user);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const user = await createUser(email, password);
      setCurrentUser(user);
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {currentUser ? "Account Information" : "Login to Your Account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentUser.email}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Account verified: {currentUser.emailVerified ? "Yes" : "No"}
                  </p>
                </div>

                <Button
                  onClick={toggleUserInfo}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {showUserInfo
                    ? "Hide User ID"
                    : "Show User ID for Security Rules"}
                </Button>

                {showUserInfo && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your User ID (for Firebase Security Rules):
                    </p>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-700 font-mono text-sm break-all">
                      {currentUser.uid}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Copy this ID to use in your Firebase security rules.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {!currentUser ? (
            <>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
                onClick={handleLogin}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={handleSignUp}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Return to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
