import React, { Component } from 'react';
import moment from 'moment'
import { Modal, Button, Table, FormControl, Form, Popover, OverlayTrigger, Alert } from 'react-bootstrap'

import '../components/AppointmentCalendar.css'

class AppointmentCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: [],
      appointmentTimes: [],
      showModal: false,
      calendar: [],
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

  componentWillMount() {
    this.setState({
      calendar: this.props.initialCalendarData,
      numberOfReservedAppointments: new Array(this.props.numberOfDays).fill(0)
    }, () => {
      this.getDayHeader();
      this.getAppointmentTimes();
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialCalendarData !== this.props.initialCalendarData) {
      this.setState({ calendar: this.props.initialCalendarData }, () => {
        this.getDayHeader();
        this.getAppointmentTimes();
      })
    }
  }

  getDayHeader() {
    let days = [""];
    for (var i = 0; i < this.props.numberOfDays; i++) {
      days[i + 1] = (moment().add(i + 1, 'day').format('DD-MM'));
    }
    this.setState({ days: days });
  }

  getAppointmentTimes() {
    let times = [];
    let currentTime = this.props.startTime;
    for (var i = 0; moment(currentTime, "H:mm").isBefore(moment(this.props.endTime, "H:mm")); i++) {
      times[i] = moment(currentTime, "H:mm").format("H:mm").toString()// + "-" + moment(currentTime, "H:mm").add(this.props.sessionLengthMinutes, 'minutes').format("H:mm").toString();
      currentTime = moment(currentTime, "H:mm").add(this.props.sessionLengthMinutes, 'minutes')
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

    if (numberOfReservedAppointments.reduce((a, b) => a + b, 0) === this.props.maximumWeeklyAppointments
      && calendar[selectedAppointment.dayId][selectedAppointment.timeId].status === "available") {
      this.setState({ showWeeklyWarning: true })
    }
    else if (numberOfReservedAppointments[selectedAppointment.dayId] === this.props.maximumDailyAppointments
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
      //this.setState({ calendar: calendar })
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
    //this.setState({ calendar: calendar });
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
                  this.setState({ selectedAppointment: appointment },
                    () => { this.handleOpenModal() })
                }}
              >
                {appointment.patientName.substr(0, 8)}
              </td>
            )
          }
          else if (appointment.status === "reserved") {
            return (
              <OverlayTrigger overlay={popoverBottom} placement={this.state.selectedAppointment.dayId === this.props.numberOfDays - 1 ? "left" : "right"}>
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
      <div className="full-screen-width">
        <Table className="table" >
          <thead className="thead-dark d-flex no-gutter table-fixed-header">
            <tr className="d-flex full-screen-width">{days}</tr>
          </thead>
          <tbody className="d-flex no-gutter">
            <tr className="border-left border-right col table-row-fixed-left">
              {appointmentTime}
            </tr>
            {columnData}
          </tbody>
        </Table >

        <Modal show={this.state.showModal} onHide={this.handleCloseModal}>
          < Modal.Header closeButton >
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

          <Alert show={this.state.showNameFormatNotification} variant="warning">
            <p>
              Please enter your full name.
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.setState({ showNameFormatNotification: false })} variant="outline-warning">
                Close
              </Button>
            </div>
          </Alert>

          <Alert show={this.state.showDailyWarning} variant="danger">
            <p>
              Maximum number of daily appointments reached.
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.setState({ showDailyWarning: false })} variant="outline-danger">
                Close
              </Button>
            </div>
          </Alert>

          <Alert show={this.state.showWeeklyWarning} variant="danger">
            <p>
              Maximum number of weekly appointments reached.
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.setState({ showWeeklyWarning: false })} variant="outline-danger">
                Close
              </Button>
            </div>
          </Alert>
        </Modal >
      </div >
    )
  }
}

export default AppointmentCalendar