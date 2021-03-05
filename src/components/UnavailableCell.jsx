import React, { Component } from 'react';

export default class UnavailableCell extends Component {
    render() {
        return (
            <td key={this.props.id} className="table-unavailable-cell d-flex flex-column" />
        );
    }
}