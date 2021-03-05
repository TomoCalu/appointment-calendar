import React, { Component } from 'react';
import { OverlayTrigger, Popover } from "react-bootstrap";


export default class EmptyCell extends Component {
    render() {
        const popoverBottom = (
            <Popover>
                <Popover.Title as="h3">{this.props.appointment.patientName} {this.props.appointment.patientLastName}</Popover.Title>
                <Popover.Content>
                    <p>{this.props.appointment.appointmentTimeRange}</p>
                    <p>Rezervirano</p>
                </Popover.Content>
            </Popover>);

        return (
            <OverlayTrigger overlay={popoverBottom} placement={this.props.placement ? "left" : "right"}>
                <td key={this.props.appointment.id} id={this.props.appointment.id} className="table-reserved-cell d-flex flex-column"
                    onMouseEnter={this.props.handleAppointmentSelect}
                    onMouseLeave={this.props.handleAppointmentClear}
                >
                    {this.props.appointment.patientName.substr(0, 8)}
                </td>
            </OverlayTrigger>
        );
    }
}