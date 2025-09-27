export const handleError = (error: any): string => {
  console.error("Error:", error);
  if (error?.code) {
    switch (error.code) {
      case "auth/user-not-found": return "No account found with this email";
      case "auth/wrong-password": return "Incorrect password";
      case "auth/email-already-in-use": return "Email already in use";
      case "auth/invalid-email": return "Invalid email address";
      case "auth/weak-password": return "Password is too weak";
      case "storage/object-not-found": return "File not found";
      case "storage/unauthorized": return "Unauthorized access";
      default: return error.message || "An unexpected error occurred";
    }
  }
  return "An unexpected error occurred";
};