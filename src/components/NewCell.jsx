import React, { Component } from 'react';

export default class NewCell extends Component {
    render() {
        return (
            <td key={this.props.id} className="table-new-cell d-flex flex-column"
                onClick={this.props.handleNewCellClick}
            >
                {this.props.patientName.substr(0, 8)}
            </td>
        );
    }
}