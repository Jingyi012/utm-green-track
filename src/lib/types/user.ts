export type User = {
    id: number;
    name: string;
    email: string;
    department: string;
    contactNo: string | null;
    position: string;
    role: string;
    staffMatricNo: string;
};

export type RegistrationFormData = User & {
    password: string;
    confirmPassword: string;
};

export type UserIdResponse = {
    id: number;
}