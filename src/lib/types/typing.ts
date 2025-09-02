import { RequestStatus } from "../enum/status";
import { WasteRecord } from "./wasteRecord";

export interface WasteType {
    id: string;
    name: string;
}

export interface WasteTypeWithEmissionFactor extends WasteType {
    emissionFactor: number;
}

export interface WasteTypeWithDisposalMethod extends WasteType {
    disposalMethod: DisposalMethod
}

export interface DisposalMethod {
    id: string;
    name: string;
}

export interface DisposalMethodWithWasteType extends DisposalMethod {
    wasteTypes: WasteTypeWithEmissionFactor[];
}

export interface LoginResponse {
    id: string;
    userName: string;
    email: string;
    roles: string[];
    jwToken: string;
}


export interface UserDetails {
    id: string;
    name: string;
    email: string;
    contactNumber: string;
    staffMatricNo: string;
    departmentId: string;
    department: string;
    positionId: string;
    position: string;
    roles: string[]; //id list
    status: number;
}

export interface Position {
    id: string;
    name: string;
}

export interface Role {
    id: string;
    category: string;
    name: string;
}

export interface Campus {
    id: string;
    name: string;
}

export interface Department {
    id: string;
    name: string;
}

export interface Config {
    key: string;
    value: string;
}

export interface ProfileDropdownOptions {
    departments: Department[],
    positions: Position[],
    roles: Role[],
    isLoading?: boolean
}

export interface WasteRecordDropdownOptions {
    campuses: Campus[],
    disposalMethods: DisposalMethodWithWasteType[],
    isLoading?: boolean
}

export interface ChangeRequest {
    id: string,
    wasteRecordId?: string,
    wasteRecord?: WasteRecord,
    message: string,
    status: RequestStatus,
    userId: string,
    user: string, // user name
    matricNo: string,
    createdAt: string
}

export interface Enquiry {
    id: string,
    subject: string,
    userName: string,
    status: number,
    createdAt: string,
}

export interface EnquiryDetails extends Enquiry {
    messages: EnquiryMessage[]
}

export interface EnquiryMessage {
    id: string,
    senderId: string,
    senderName: string,
    message: string,
    createdAt: string
}

export interface EnquiryInput {
    subject: string,
    message: string
}