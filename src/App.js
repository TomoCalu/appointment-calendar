import React, { Component } from 'react';

import AppointmentCalendar from './components/AppointmentCalendar/AppointmentCalendar';
import CalendarGenerator from './services/CalendarGenerator'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    // You can edit states to get different kinds of tables
    this.state = {
      calendarConfiguration: {
        numberOfDays: 7,
        startTime: "8:00",
        endTime: "19:00",
        sessionLengthMinutes: 30,
        numberOfRandomAppointments: 15,
      },
      calendar: []
    }
  }

  componentDidMount() {
    let calendarConfiguration = this.state.calendarConfiguration;
    let numberOfDailyAppointments = CalendarGenerator.getNumberOfDailyAppointments(calendarConfiguration);
    let { calendar, availableAppointmentIds } = CalendarGenerator.generateCalendar(calendarConfiguration, numberOfDailyAppointments);
    calendar = CalendarGenerator.generateRandomAppointments(calendarConfiguration, calendar, availableAppointmentIds, numberOfDailyAppointments);
    this.setState({ calendar: calendar })
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <AppointmentCalendar
            initialCalendarData={this.state.calendar}
            startTime={this.state.calendarConfiguration.startTime}
            endTime={this.state.calendarConfiguration.endTime}
            sessionLengthMinutes={this.state.calendarConfiguration.sessionLengthMinutes}
            numberOfDays={this.state.calendarConfiguration.numberOfDays}
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
