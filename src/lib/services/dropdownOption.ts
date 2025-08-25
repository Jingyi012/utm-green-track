import { GeneralResponse } from "../types/apiResponse";
import { Config, ProfileDropdownOptions, WasteRecordDropdownOptions } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/options';

export async function getProfileDropdownOptions(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<ProfileDropdownOptions>>(`${API_URL}/profile`, {
        ...options,
    });
}

export async function getWasteRecordDropdownOptions(
    options?: { [key: string]: any }) {

    return api.get<GeneralResponse<WasteRecordDropdownOptions>>(`${API_URL}/wasteRecord`, {
        ...options,
    });
}
