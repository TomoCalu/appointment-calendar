import moment from 'moment';
import faker from 'faker';

import AppointmentStatus from '../constants/AppointmentStatus'
import { TimeFormat, TimeKey } from '../constants/TimeStrings'
import TimeCalculations from './TimeCalculations'

export default class CalendarGenerator {

	static generateCalendar(startTime, endTime, sessionLengthMinutes, numberOfDays, numberOfDailyAppointments) {
		let appointmentDay;
		let appointmentTime;
		let availableAppointmentIds = [];
		let appointmentId = 0;
		let calendar = new Array(numberOfDays);

		for (var i = 0; i < numberOfDays; i++) {
			calendar[i] = new Array(numberOfDailyAppointments)
			for (var j = 0; j < numberOfDailyAppointments; j++) {
				appointmentDay = moment().add(i + 1, TimeKey.Day)
				appointmentTime = TimeCalculations.timeWithAddition(startTime, TimeFormat.HoursMinutes, j * sessionLengthMinutes, TimeKey.Minutes, TimeFormat.HoursMinutes)

				if (appointmentDay.format(TimeFormat.DayName) === "Sunday") {
					calendar[i][j] = { status: AppointmentStatus.Unavailable, id: appointmentId }
				}
				else if (appointmentDay.format(TimeFormat.DayName) === "Saturday"
					&& appointmentDay.format(TimeFormat.DayNumber) % 2 === 1) {
					calendar[i][j] = { status: AppointmentStatus.Unavailable, id: appointmentId }
				}
				else if (appointmentDay.format(TimeFormat.DayNumber) % 2 === 0
					&& (TimeCalculations.compareIsSameOrAfter(appointmentTime, "14:00", TimeFormat.HoursMinutes, TimeKey.Hour) ||
						TimeCalculations.compareIsBetween(appointmentTime, moment("11:00", TimeFormat.HoursMinutes), TimeCalculations.timeWithAddition("11:00", TimeFormat.HoursMinutes, sessionLengthMinutes, TimeKey.Minutes), TimeFormat.HoursMinutes))) {
					calendar[i][j] = { status: AppointmentStatus.Unavailable, id: appointmentId }
				}
				else if (appointmentDay.format(TimeFormat.DayNumber) % 2 === 1
					&& (TimeCalculations.compareIsBefore(appointmentTime, "13:00", TimeFormat.HoursMinutes, TimeKey.Hour) ||
						TimeCalculations.compareIsBetween(appointmentTime, moment("16:00", TimeFormat.HoursMinutes), TimeCalculations.timeWithAddition("16:00", TimeFormat.HoursMinutes, sessionLengthMinutes, TimeKey.Minutes), TimeFormat.HoursMinutes))) {
					calendar[i][j] = { status: AppointmentStatus.Unavailable, id: appointmentId }
				}
				else {
					calendar[i][j] = {
						status: AppointmentStatus.Available, id: appointmentId,
						appointmentTimeRange: appointmentTime + " - " + TimeCalculations.timeWithAddition(appointmentTime, TimeFormat.HoursMinutes, sessionLengthMinutes, TimeKey.Minutes, TimeFormat.HoursMinutes)
					}
					availableAppointmentIds.push(appointmentId);
				}
				calendar[i][j].dayId = i;
				calendar[i][j].timeId = j;
				appointmentId++;
			}
		}
		return { calendar, availableAppointmentIds }
	}

	static generateRandomAppointments(startTime, endTime, sessionLengthMinutes, numberOfDays, numberOfRandomAppointments, calendar, availableAppointmentIds, numberOfDailyAppointments) {
		let appointmentTime;
		let currentlyPicketId;
		let randomIds = []
		faker.locale = "hr";

		for (var i = 0; i < numberOfRandomAppointments; i++) {
			currentlyPicketId = availableAppointmentIds[Math.floor(Math.random() * availableAppointmentIds.length)]
			randomIds.push(currentlyPicketId);
			availableAppointmentIds.splice(availableAppointmentIds.indexOf(currentlyPicketId), 1);
		}
		for (i = 0; i < numberOfDays; i++) {
			for (var j = 0; j < numberOfDailyAppointments; j++) {
				appointmentTime = TimeCalculations.timeWithAddition(startTime, TimeFormat.HoursMinutes, j * sessionLengthMinutes, TimeKey.Minutes, TimeFormat.HoursMinutes)
				if (calendar[i][j].status === AppointmentStatus.Available && randomIds.includes(calendar[i][j].id)) {
					calendar[i][j].status = AppointmentStatus.Reserved
					calendar[i][j].appointmentTimeRange = appointmentTime + " - " + TimeCalculations.timeWithAddition(appointmentTime, TimeFormat.HoursMinutes, sessionLengthMinutes, TimeKey.Minutes, TimeFormat.HoursMinutes)
					calendar[i][j].patientName = faker.name.firstName();
					calendar[i][j].patientLastName = faker.name.lastName();
				}
			}
		}
		return calendar
	}

	static generateEmptyCalendar(startTime, endTime, sessionLengthMinutes, numberOfDays, numberOfDailyAppointments) {
		let appointmentTime;
		let calendar = new Array(numberOfDays)
		let appointmentId = 0;

		for (var i = 0; i < numberOfDays; i++) {
			calendar[i] = new Array(numberOfDailyAppointments)
			for (var j = 0; j < numberOfDailyAppointments; j++) {
				appointmentTime = moment(startTime, TimeFormat.HoursMinutes).add(j * sessionLengthMinutes, TimeKey.Minutes).format(TimeFormat.HoursMinutes)
				calendar[i][j] = {
					status: AppointmentStatus.Available, id: appointmentId,
					appointmentTimeRange: appointmentTime + " - " + moment(appointmentTime, TimeFormat.HoursMinutes).add(sessionLengthMinutes, TimeKey.Minutes).format(TimeFormat.HoursMinutes)
				}
				calendar[i][j].dayId = i;
				calendar[i][j].timeId = j;
				appointmentId++;
			}
		}
		return calendar
	}

	static getNumberOfDailyAppointments(startTime, endTime, sessionLengthMinutes) {
		return moment(endTime, TimeFormat.HoursMinutes).diff(moment(startTime, TimeFormat.HoursMinutes), TimeKey.Minutes) / sessionLengthMinutes;

	}
}