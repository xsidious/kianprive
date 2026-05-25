import { acuityRequest } from "@/lib/acuity/client";
import { getAcuityCalendarIdForType } from "@/lib/acuity/calendars";
import { getAcuityAppointmentTypeId } from "@/lib/acuity/map";

export type AcuityAppointment = {
  id: number;
  datetime: string;
  appointmentTypeID: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
};

export async function createAcuityAppointment(input: {
  serviceSlug: string;
  datetime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  fields?: Array<{ id: number; value: string }>;
}) {
  const appointmentTypeID = getAcuityAppointmentTypeId(input.serviceSlug);
  if (!appointmentTypeID) {
    throw new Error(`No Acuity appointment type for "${input.serviceSlug}".`);
  }

  const [firstName, ...rest] = input.firstName.trim().split(/\s+/);
  const lastNameFromFirst = rest.join(" ");
  const lastName = input.lastName.trim() || lastNameFromFirst || firstName;

  const bookAsAdmin = process.env.ACUITY_BOOK_AS_ADMIN !== "false";
  const calendarID = bookAsAdmin ? await getAcuityCalendarIdForType(appointmentTypeID) : null;

  const body: Record<string, unknown> = {
    appointmentTypeID,
    datetime: input.datetime,
    firstName: firstName || input.firstName,
    lastName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
  };

  if (calendarID) body.calendarID = calendarID;
  if (input.fields?.length) body.fields = input.fields;

  return acuityRequest<AcuityAppointment>("/appointments", {
    method: "POST",
    searchParams: bookAsAdmin ? { admin: "true" } : undefined,
    body,
  });
}
