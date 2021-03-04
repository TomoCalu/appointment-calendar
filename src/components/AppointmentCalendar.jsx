import React, { Component } from 'react';
import moment from 'moment'
import { Modal, Button, Table, FormControl, Form, Popover, OverlayTrigger } from 'react-bootstrap'

import ModalAlert from './ModalAlert'
import '../components/AppointmentCalendar.css'

class AppointmentCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maximumDailyAppointments: props.maximumDailyAppointments ? this.props.maximumDailyAppointments : 1,
      maximumWeeklyAppointments: props.maximumWeeklyAppointments ? this.props.maximumWeeklyAppointments : 2,
      startTime: props.startTime ? this.props.startTime : "8:00",
      endTime: props.endTime ? this.props.endTime : "19:00",
      sessionLengthMinutes: props.sessionLengthMinutes ? this.props.sessionLengthMinutes : 30,
      numberOfDays: props.numberOfDays ? this.props.numberOfDays : 7,
      calendar: [],
      days: [],
      appointmentTimes: [],
      showModal: false,
      selectedAppointment: { patientName: "", patientLastName: "", appointmentTimeRange: "", dayId: 0 },
      clientName: "",
      numberOfReservedAppointments: [],
      showDailyWarning: false,
      showWeeklyWarning: false,
      showNameFormatNotification: false
    }
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.generateNewAppointment = this.generateNewAppointment.bind(this)
    this.removeAppointment = this.removeAppointment.bind(this)
  }

  componentDidMount() {
    if (!this.props.initialCalendarData) this.generateEmptyCalendar();
    else this.setState({
      calendar: this.props.initialCalendarData,
      numberOfReservedAppointments: new Array(this.state.numberOfDays).fill(0)
    }, () => {
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

  generateEmptyCalendar() {
    let appointmentTime;
    let numberOfAppointments = (moment(this.state.endTime, "H:mm").diff(moment(this.state.startTime, "H:mm"), 'minutes') / this.state.sessionLengthMinutes);
    let calendar = new Array(this.state.numberOfDays)
    let appointmentId = 0;

    for (var i = 0; i < this.state.numberOfDays; i++) {
      calendar[i] = new Array(numberOfAppointments)
      for (var j = 0; j < numberOfAppointments; j++) {
        appointmentTime = moment(this.state.startTime, "H:mm").add(j * this.state.sessionLengthMinutes, 'minutes').format("H:mm")
        calendar[i][j] = {
          status: "available", id: appointmentId,
          appointmentTimeRange: appointmentTime + " - " + moment(appointmentTime, "H:mm").add(this.state.sessionLengthMinutes, 'minutes').format("H:mm")
        }
        calendar[i][j].dayId = i;
        calendar[i][j].timeId = j;
        appointmentId++;
      }
    }
    this.setState({
      calendar: calendar,
      numberOfReservedAppointments: new Array(this.state.numberOfDays).fill(0)
    },
      () => {
        this.getDayHeader();
        this.getAppointmentTimes();
      })
  }

  getDayHeader() {
    let days = [""];
    for (var i = 0; i < this.state.numberOfDays; i++) {
      days[i + 1] = (moment().add(i + 1, 'day').format('DD-MM'));
    }
    this.setState({ days: days });
  }

  getAppointmentTimes() {
    let times = [];
    let currentTime = this.state.startTime;
    for (var i = 0; moment(currentTime, "H:mm").isBefore(moment(this.state.endTime, "H:mm")); i++) {
      times[i] = moment(currentTime, "H:mm").format("H:mm").toString()
      currentTime = moment(currentTime, "H:mm").add(this.state.sessionLengthMinutes, 'minutes')
    }
    this.setState({ appointmentTimes: times })
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({
      showModal: false,
      showDailyWarning: false,
      showWeeklyWarning: false
    });
  }

  generateNewAppointment() {
    let selectedAppointment = this.state.selectedAppointment;
    let calendar = this.state.calendar;
    let fullName = this.state.clientName;
    let numberOfReservedAppointments = this.state.numberOfReservedAppointments;

    this.setState({ showNameFormatNotification: false })

    if (numberOfReservedAppointments.reduce((a, b) => a + b, 0) === this.state.maximumWeeklyAppointments
      && calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === "available") {
      this.setState({ showWeeklyWarning: true })
    }
    else if (numberOfReservedAppointments[selectedAppointment.dayId] === this.state.maximumDailyAppointments
      && calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === "available") {
      this.setState({ showDailyWarning: true })
    }
    else if (!(/^([\w]{3,})+\s+([\w\s]{3,})+$/i).test(fullName)) {
      this.setState({ showNameFormatNotification: true })
    }
    else {
      fullName = fullName.split(" ", 2);
      calendar[selectedAppointment.dayId][selectedAppointment.timeId].patientName = fullName[0];
      if (fullName[1] !== "") calendar[selectedAppointment.dayId][selectedAppointment.timeId].patientLastName = fullName[1];
      if (calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === "available") {
        numberOfReservedAppointments[selectedAppointment.dayId] += 1;
      }
      calendar[selectedAppointment.dayId][selectedAppointment.timeId].status = "new"
      this.handleCloseModal();
    }
  }

  removeAppointment() {
    let selectedAppointment = this.state.selectedAppointment;
    let calendar = this.state.calendar;
    let numberOfReservedAppointments = this.state.numberOfReservedAppointments;

    selectedAppointment.status = "available"
    delete selectedAppointment.patientName;
    delete selectedAppointment.patientLastName;

    calendar[selectedAppointment.dayId][selectedAppointment.timeId] = selectedAppointment;
    numberOfReservedAppointments[selectedAppointment.dayId] -= 1;
    this.handleCloseModal();
  }

  render() {
    let days = this.state.days.map(day => {
      return (
        <th key={day} className="col">
          {day}
        </th>
      )
    });

    let appointmentTime = this.state.appointmentTimes.map(time => {
      return (
        <td key={time} className="d-flex flex-column">
          {time}
        </td>
      )
    });

    let popoverBottom = (
      <Popover >
        <Popover.Title as="h3">{this.state.selectedAppointment.patientName} {this.state.selectedAppointment.patientLastName}</Popover.Title>
        <Popover.Content>
          <p>{this.state.selectedAppointment.appointmentTimeRange}</p>
          <p>Rezervirano</p>
        </Popover.Content>
      </Popover>
    );

    let columnData = this.state.calendar.map(column => {
      return <tr key={column.dayId} className="border-right col">
        {column.map(appointment => {
          if (appointment.status === "unavailable") {
            return (
              <td key={appointment.id} id={appointment.id} className="table-unavailable-cell d-flex flex-column">
                &#8203;
              </td>
            )
          }
          else if (appointment.status === "new") {
            return (
              <td key={appointment.id} id={appointment.id} className="table-new-cell d-flex flex-column"
                onClick={() => {
                  this.setState({
                    selectedAppointment: appointment,
                    clientName: appointment.patientName + " " + appointment.patientLastName
                  },
                    () => { this.handleOpenModal() })
                }}
              >
                {appointment.patientName.substr(0, 8)}
              </td>
            )
          }
          else if (appointment.status === "reserved") {
            return (
              <OverlayTrigger overlay={popoverBottom} placement={this.state.selectedAppointment.dayId === this.state.numberOfDays - 1 ? "left" : "right"}>
                <td key={appointment.id} id={appointment.id} className="table-reserved-cell d-flex flex-column"
                  onMouseEnter={() => this.setState({ selectedAppointment: appointment })}
                  onMouseLeave={() => {
                    let emptyAppointment = { patientName: "", patientLastName: "", appointmentTimeRange: "" }
                    this.setState({ selectedAppointment: emptyAppointment })
                  }}
                >
                  {appointment.patientName.substr(0, 8)}
                </td>
              </OverlayTrigger>
            )
          }
          else {
            return (
              <td key={appointment.id} id={appointment.id} className="table-free-cell d-flex flex-column"
                onClick={() => {
                  this.setState({ selectedAppointment: appointment },
                    () => { this.handleOpenModal() })
                }}>
                &#8203;
              </td>
            )
          }
        })}
      </tr >
    });

    return (
      <div className="full-width">
        <Table className="table" >
          <thead className="thead-dark d-flex no-gutter table-fixed-header">
            <tr className="d-flex full-width">{days}</tr>
          </thead>
          <tbody className="d-flex no-gutter">
            <tr className="border-left border-right col table-row-fixed-left">
              {appointmentTime}
            </tr>
            {columnData}
          </tbody>
        </Table >

        <Modal show={this.state.showModal} onHide={this.handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Rezerviraj termin ({this.state.selectedAppointment.appointmentTimeRange})</Modal.Title>
          </Modal.Header >
          <Modal.Body>
            <Form.Label>Vaše ime:</Form.Label>
            <FormControl
              placeholder="Ivan Horvat"
              value={this.state.clientName}
              onChange={(e) => { this.setState({ clientName: e.target.value }) }}
            />
          </Modal.Body>
          <Modal.Footer>
            {this.state.selectedAppointment.status === "new" ?
              <Button variant="danger" onClick={this.removeAppointment}>
                Delete
              </Button>
              : <></>}
            <Button variant="success" onClick={this.generateNewAppointment}>
              Save Changes
            </Button>
          </Modal.Footer>

          <ModalAlert
            show={this.state.showNameFormatNotification}
            variant="warning"
            description=" Please enter your full name."
            onClick={() => this.setState({ showNameFormatNotification: false })} />

          <ModalAlert
            show={this.state.showDailyWarning}
            variant="danger"
            description="Maximum number of daily appointments reached."
            onClick={() => this.setState({ showDailyWarning: false })} />

          <ModalAlert
            show={this.state.showWeeklyWarning}
            variant="danger"
            description=" Maximum number of weekly appointments reached."
            onClick={() => this.setState({ showWeeklyWarning: false })} />

        </Modal >
      </div >
    )
  }
}

export default AppointmentCalendar