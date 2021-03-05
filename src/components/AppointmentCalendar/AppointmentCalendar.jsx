import React, { Component } from 'react';
import moment from 'moment'

import AppointmentTable from '../AppointmentTable';
import Warnings from '../../constants/Warnings';
import WarningType from '../../constants/WarningType';
import AppointmentStatus from '../../constants/AppointmentStatus';
import EmptyCell from '../EmptyCell';
import NewCell from '../NewCell';
import ReservedCell from '../ReservedCell';
import UnavailableCell from '../UnavailableCell';
import AppointmentModal from '../AppointmentModal'
import CalendarGenerator from '../../services/CalendarGenerator'
import { TimeFormat, TimeKey } from '../../constants/TimeStrings';
import './AppointmentCalendar.css'

class AppointmentCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calendar: [],
      startTime: props.startTime ?? "8:00",
      endTime: props.endTime ?? "19:00",
      sessionLengthMinutes: props.sessionLengthMinutes ?? 30,
      numberOfDays: props.numberOfDays ?? 7,
      maximumDailyAppointments: props.maximumDailyAppointments ?? 1,
      maximumWeeklyAppointments: props.maximumWeeklyAppointments ?? 2,
      days: [],
      appointmentTimes: [],
      showModal: false,
      selectedAppointment: {
        patientName: "",
        patientLastName: "",
        appointmentTimeRange: "",
        dayId: 0
      },
      clientName: "",
      numberOfReservedAppointments: [],

      warningMessage: '',
      warningShown: false,
      warningType: WarningType.Danger
    }
  }

  componentDidMount() {
    let calendar;
    let numberOfDailyAppointments = CalendarGenerator.getNumberOfDailyAppointments(this.state.startTime, this.state.endTime, this.state.sessionLengthMinutes)

    if (!this.props.initialCalendarData)
      calendar = CalendarGenerator.generateEmptyCalendar(this.state.startTime, this.state.endTime, this.state.sessionLengthMinutes, this.state.numberOfDays, numberOfDailyAppointments);
    else calendar = this.props.initialCalendarData;

    this.setState({
      calendar: calendar,
      numberOfReservedAppointments: new Array(this.state.numberOfDays).fill(0)
    },
      () => {
        this.getDayHeader();
        this.getAppointmentTimes();
      })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialCalendarData !== this.props.initialCalendarData && this.props.initialCalendarData) {
      this.setState({ calendar: this.props.initialCalendarData }, () => {
        this.getDayHeader();
        this.getAppointmentTimes();
      })
    }
  }

  getHours = (time) => {
    return moment(time, TimeFormat.HoursMinutes);
  }

  getDayHeader() {
    let days = [""];
    for (var i = 0; i < this.state.numberOfDays; i++) {
      days[i + 1] = (moment().add(i + 1, TimeKey.Day).format(TimeFormat.DayMonth));
    }
    this.setState({ days: days });
  }

  getAppointmentTimes() {
    let times = [];
    let currentTime = this.state.startTime;
    for (var i = 0; this.getHours(currentTime).isBefore(this.getHours(this.state.endTime)); i++) {
      times[i] = this.getHours(currentTime).format(TimeFormat.HoursMinutes).toString()
      currentTime = this.getHours(currentTime).add(this.state.sessionLengthMinutes, TimeKey.Minutes)
    }
    this.setState({ appointmentTimes: times })
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
    this.clearWarning();
  }

  showWarning = (warningMessage, warningType) => {
    this.setState({ warningShown: true, warningMessage, warningType });
  }

  clearWarning = () => {
    this.setState({ warningShown: false });
  }

  generateNewAppointment = () => {
    let selectedAppointment = this.state.selectedAppointment;
    let calendar = this.state.calendar;
    let fullName = this.state.clientName;
    let numberOfReservedAppointments = this.state.numberOfReservedAppointments;

    this.clearWarning();

    if (numberOfReservedAppointments.reduce((a, b) => a + b, 0) === this.state.maximumWeeklyAppointments
      && calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === AppointmentStatus.Available) {
      this.showWarning(Warnings.WeeklyWarning, WarningType.Danger);
    }
    else if (numberOfReservedAppointments[selectedAppointment.dayId] === this.state.maximumDailyAppointments
      && calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === AppointmentStatus.Available) {
      this.showWarning(Warnings.DailyWarning, WarningType.Danger);
    }
    else if (!(/^([\w]{3,})+\s+([\w\s]{3,})+$/i).test(fullName)) {
      this.showWarning(Warnings.NameFormatNotification, WarningType.Warning);
    }
    else {
      fullName = fullName.split(" ", 2);
      calendar[selectedAppointment.dayId][selectedAppointment.timeId].patientName = fullName[0];
      if (fullName[1] !== "") calendar[selectedAppointment.dayId][selectedAppointment.timeId].patientLastName = fullName[1];
      if (calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === AppointmentStatus.Available) {
        numberOfReservedAppointments[selectedAppointment.dayId] += 1;
      }
      calendar[selectedAppointment.dayId][selectedAppointment.timeId].status = AppointmentStatus.New;
      this.handleCloseModal();
    }
  }

  removeAppointment = () => {
    let selectedAppointment = this.state.selectedAppointment;
    let calendar = this.state.calendar;
    let numberOfReservedAppointments = this.state.numberOfReservedAppointments;

    selectedAppointment.status = AppointmentStatus.Available;
    delete selectedAppointment.patientName;
    delete selectedAppointment.patientLastName;

    calendar[selectedAppointment.dayId][selectedAppointment.timeId] = selectedAppointment;
    numberOfReservedAppointments[selectedAppointment.dayId] -= 1;
    this.handleCloseModal();
  }

  handleEmptyCellClick = (appointment) => {
    this.setState({ selectedAppointment: appointment },
      () => { this.handleOpenModal() })
  }

  handleNewCellClick = (appointment) => {
    this.setState({
      selectedAppointment: appointment,
      clientName: appointment.patientName + " " + appointment.patientLastName
    },
      () => { this.handleOpenModal() });
  }

  handleAppointmentSelect = (appointment) => this.setState({ selectedAppointment: appointment })

  handleAppointmentClear = () => {
    let emptyAppointment = { patientName: "", patientLastName: "", appointmentTimeRange: "" }
    this.setState({ selectedAppointment: emptyAppointment })
  }

  render() {
    let days = this.state.days.map(day => {
      return (
        <th key={day} className="col">
          {day}
        </th>
      )
    });

    let columnData = this.state.calendar.map(column => (
      <tr key={column.dayId} className="border-right col">
        {column.map(appointment => {
          switch (appointment.status) {
            case AppointmentStatus.Unavailable:
              return <UnavailableCell id={appointment.id} />
            case AppointmentStatus.New:
              return <NewCell
                id={appointment.id}
                patientName={appointment.patientName}
                handleNewCellClick={() => this.handleNewCellClick(appointment)} />
            case AppointmentStatus.Reserved:
              return <ReservedCell
                appointment={appointment}
                handleAppointmentSelect={() => this.handleAppointmentSelect(appointment)}
                handleAppointmentClear={this.handleAppointmentClear}
                placement={this.state.selectedAppointment.dayId === this.state.numberOfDays - 1} />
            default:
              return <EmptyCell id={appointment.id} handleEmptyCellClick={() => this.handleEmptyCellClick(appointment)} />
          }
        })}
      </tr >
    ));

    return (
      <div className="full-width">
        <AppointmentTable
          days={days}
          appointmentTimes={this.state.appointmentTimes}>
          {columnData}
        </AppointmentTable  >

        <AppointmentModal
          show={this.state.showModal}
          onHide={this.handleCloseModal}
          modalData={this.state.selectedAppointment}
          modalFormValue={this.state.clientName}
          modalFormOnChange={(e) => { this.setState({ clientName: e.target.value }) }}
          onDelete={this.removeAppointment}
          onSave={this.generateNewAppointment}
          warningShown={this.state.warningShown}
          warningType={this.state.warningType}
          warningMessage={this.state.warningMessage}
          clearWarning={this.clearWarning} />
      </div >
    )
  }
}

export default AppointmentCalendar