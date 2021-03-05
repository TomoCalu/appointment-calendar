import React, { Component } from 'react';
import { Table } from 'react-bootstrap'

import AppointmentCell from "./AppointmentCell";

export default class AppointmentTable extends Component {
    render() {
        return (
            <Table className="table" >
                <thead className="thead-dark d-flex no-gutter table-fixed-header">
                    <tr className="d-flex full-width">{this.props.days}</tr>
                </thead>
                <tbody className="d-flex no-gutter">
                    <AppointmentCell appointmentTimes={this.props.appointmentTimes} />
                    {this.props.children}
                </tbody>
            </Table >
        );
    }
}