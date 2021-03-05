import React, { Component } from 'react';

export default class EmptyCell extends Component {
    render() {
        return (
            <td key={this.props.id} className="table-free-cell d-flex flex-column"
                onClick={this.props.handleEmptyCellClick} >
            </td>
        );
    }
}