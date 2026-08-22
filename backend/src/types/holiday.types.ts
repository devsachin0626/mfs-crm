export interface CreateHolidayRequest {
  title: string;
  holidayDate: string;
  description?: string;
}

export interface UpdateHolidayRequest {
  title?: string;
  holidayDate?: string;
  description?: string;
}