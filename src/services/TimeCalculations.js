import moment from 'moment';

export default class TimeCalculations {

	static timeWithAddition(startingTime, timeFormat, timeToAdd, timeToAddKey, formatString = null) {
		if (formatString)
			return moment(startingTime, timeFormat).add(timeToAdd, timeToAddKey).format(formatString)
		else
			return moment(startingTime, timeFormat).add(timeToAdd, timeToAddKey)
	}

	static compareIsSameOrAfter(firstTime, secondTime, timeFormat, timeKey) {
		return moment(firstTime, timeFormat).isSameOrAfter(moment(secondTime, timeFormat), timeKey)
	}

	static compareIsBefore(firstTime, secondTime, timeFormat, timeKey) {
		return moment(firstTime, timeFormat).isBefore(moment(secondTime, timeFormat), timeKey)
	}

	static compareIsBetween(time, firstTimeToCompare, secondTimeToCompare, timeFormat) {
		return moment(time, timeFormat).isBetween(firstTimeToCompare, secondTimeToCompare, null, "[)")
	}

}