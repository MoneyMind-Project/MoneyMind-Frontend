export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  plan: string;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  monthly_income: number | null;
}

export interface UserPreference {
  id?: number;
  user: number;
  color: string;
}
