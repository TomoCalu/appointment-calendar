import React, { Component } from 'react';

export default class AppointmentCell extends Component {
    render() {
        return (
            <tr className="border-left border-right col table-row-fixed-left">
                {this.props.appointmentTimes.map(time => (
                    <td key={time} className="d-flex flex-column">
                        {time}
                    </td>
                ))}
            </tr>
        );
    }
}