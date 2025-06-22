export type User = {
    id: string;
    name: string;
    email: string;
    department: string;
    contactNo: string;
    position: string;
    role: string;
    staffMatricNo: string;
};

export type RegistrationFormData = User & {
    password: string;
    confirmPassword: string;
};
