import React, { Component } from 'react';

import AppointmentCalendar from './components/AppointmentCalendar/AppointmentCalendar';
import CalendarGenerator from './services/CalendarGenerator'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    // You can edit states to get different kinds of tables
    this.state = {
      numberOfDays: 7,
      startTime: "8:00",
      endTime: "19:00",
      sessionLengthMinutes: 30,
      numberOfRandomAppointments: 15,
      calendar: []
    }
  }

  componentDidMount() {
    let numberOfDailyAppointments = CalendarGenerator.getNumberOfDailyAppointments(this.state.startTime, this.state.endTime, this.state.sessionLengthMinutes);
    let { calendar, availableAppointmentIds } = CalendarGenerator.generateCalendar(this.state.startTime, this.state.endTime, this.state.sessionLengthMinutes, this.state.numberOfDays, numberOfDailyAppointments);
    calendar = CalendarGenerator.generateRandomAppointments(this.state.startTime, this.state.endTime, this.state.sessionLengthMinutes, this.state.numberOfDays, this.state.numberOfRandomAppointments, calendar, availableAppointmentIds, numberOfDailyAppointments);
    this.setState({ calendar: calendar })
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <AppointmentCalendar
            initialCalendarData={this.state.calendar}
            startTime={this.state.startTime}
            endTime={this.state.endTime}
            sessionLengthMinutes={this.state.sessionLengthMinutes}
            numberOfDays={this.state.numberOfDays}
            maximumDailyAppointments={1}
            maximumWeeklyAppointments={2}
          // All props are optional
          />
        </header>
      </div>
    )
  }
}

export default App;
