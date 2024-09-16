import { atom } from "jotai";
import type { VacationRequestStatus } from "../generated/client";
import type { VacationRequest } from "../generated/client";

export const vacationRequestsAtom = atom<VacationRequest[]>([]);
export const vacationRequestStatusesAtom = atom<VacationRequestStatus[]>([]);

export const allVacationRequestsAtom = atom<VacationRequest[]>([]);
export const allVacationRequestStatusesAtom = atom<VacationRequestStatus[]>([]);

// The filtered vacation requests, based on the selection (upcoming or past) to be displayed
export const displayedVacationRequestsAtom = atom<VacationRequest[]>([]);
