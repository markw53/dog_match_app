export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (pw: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw);

export const validateDogProfile = (dogData: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!dogData.name?.trim()) errors.name = "Name is required";
  if (!dogData.breed?.trim()) errors.breed = "Breed is required";
  if (!dogData.gender) errors.gender = "Gender is required";
  if (!dogData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!dogData.weight || dogData.weight <= 0) errors.weight = "Valid weight is required";
  return errors;
};