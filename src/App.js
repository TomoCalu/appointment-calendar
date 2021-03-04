import React, { Component } from 'react';
import moment from 'moment'
import faker from 'faker'

import AppointmentCalendar from './components/AppointmentCalendar'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfDays: 7,
      startTime: "8:00",
      endTime: "19:00",
      sessionLengthMinutes: 30,
      numberOfRandomAppointments: 15,
      calendar: [],
      availableAppointmentIds: []
    }
  }

  componentDidMount() {
    let numberOfAppointments = (moment(this.state.endTime, "H:mm").diff(moment(this.state.startTime, "H:mm"), 'minutes') / this.state.sessionLengthMinutes);
    this.generateCalendar(numberOfAppointments);
  }

  generateCalendar(numberOfAppointments) {
    let calendar = new Array(this.state.numberOfDays);
    let appointmentDay;
    let appointmentTime;
    let appointmentId = 0;
    let availableAppointmentIds = [];

    for (var i = 0; i < this.state.numberOfDays; i++) {
      calendar[i] = new Array(numberOfAppointments)
      for (var j = 0; j < numberOfAppointments; j++) {
        appointmentDay = moment().add(i + 1, 'day')
        appointmentTime = moment(this.state.startTime, "H:mm").add(j * this.state.sessionLengthMinutes, 'minutes').format("H:mm")
        if (appointmentDay.format("dddd") === "Sunday") {
          calendar[i][j] = { status: "unavailable", id: appointmentId }
        }
        else if (appointmentDay.format("dddd") === "Saturday" && appointmentDay.format("D") % 2 === 1) {
          calendar[i][j] = { status: "unavailable", id: appointmentId }
        }
        else if (appointmentDay.format("D") % 2 === 0 && (moment(appointmentTime, "H:mm").isSameOrAfter(moment("14:00", "H:mm"), "hour") ||
          moment(appointmentTime, "H:mm").isBetween(moment("11:00", "H:mm"), moment("11:00", "H:mm").add(this.state.sessionLengthMinutes, 'minutes'), null, "[)"))) {
          calendar[i][j] = { status: "unavailable", id: appointmentId }
        }
        else if (appointmentDay.format("D") % 2 === 1 && (moment(appointmentTime, "H:mm").isBefore(moment("13:00", "H:mm"), "hour") ||
          moment(appointmentTime, "H:mm").isBetween(moment("16:00", "H:mm"), moment("16:00", "H:mm").add(this.state.sessionLengthMinutes, 'minutes'), null, "[)"))) {
          calendar[i][j] = { status: "unavailable", id: appointmentId }
        }
        else {
          calendar[i][j] = {
            status: "available", id: appointmentId,
            appointmentTimeRange: appointmentTime + " - " + moment(appointmentTime, "H:mm").add(this.state.sessionLengthMinutes, 'minutes').format("H:mm")
          }
          availableAppointmentIds.push(appointmentId);
        }
        calendar[i][j].dayId = i;
        calendar[i][j].timeId = j;
        appointmentId++;
      }
    }
    this.setState({
      calendar: calendar,
      availableAppointmentIds: availableAppointmentIds
    },
      () => this.generateRandomAppointments(numberOfAppointments))
  }

  generateRandomAppointments(numberOfAppointments) {
    let appointmentTime;
    let randomIds = []
    let currentlyPicketId;
    let calendar = this.state.calendar;
    let availableAppointmentIds = this.state.availableAppointmentIds;

    faker.locale = "hr";

    for (var i = 0; i < this.state.numberOfRandomAppointments; i++) {
      currentlyPicketId = availableAppointmentIds[Math.floor(Math.random() * availableAppointmentIds.length)]
      randomIds.push(currentlyPicketId);
      availableAppointmentIds.splice(availableAppointmentIds.indexOf(currentlyPicketId), 1);
    }
    for (i = 0; i < this.state.numberOfDays; i++) {
      for (var j = 0; j < numberOfAppointments; j++) {
        appointmentTime = moment(this.state.startTime, "H:mm").add(j * this.state.sessionLengthMinutes, 'minutes').format("H:mm")
        if (calendar[i][j].status === "available" && randomIds.includes(calendar[i][j].id)) {
          calendar[i][j].status = "reserved"
          calendar[i][j].appointmentTimeRange = appointmentTime + " - " + moment(appointmentTime, "H:mm").add(this.state.sessionLengthMinutes, 'minutes').format("H:mm")
          calendar[i][j].patientName = faker.name.firstName();
          calendar[i][j].patientLastName = faker.name.lastName();
        }
      }
    }
    this.setState({ calendar: calendar })
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <AppointmentCalendar
            initialCalendarData={this.state.calendar}
          // startTime={this.state.startTime}
          // endTime={this.state.endTime}
          // sessionLengthMinutes={this.state.sessionLengthMinutes}
          // numberOfDays={this.state.numberOfDays}
          // maximumDailyAppointments={1}
          // maximumWeeklyAppointments={2}
          />
        </header>
      </div>
    )
  }
}

export default App;
