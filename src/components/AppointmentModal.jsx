import React, { Component } from 'react';
import { Modal, Button, FormControl, Form } from 'react-bootstrap'

import ModalAlert from './ModalAlert'
import AppointmentStatus from '../constants/AppointmentStatus';

export default class AppointmentModal extends Component {
	render() {
		return (
			<Modal show={this.props.show} onHide={this.props.onHide}>
				<Modal.Header closeButton>
					<Modal.Title>Rezerviraj termin ({this.props.modalData.appointmentTimeRange})</Modal.Title>
				</Modal.Header >
				<Modal.Body>
					<Form.Label>Vaše ime:</Form.Label>
					<FormControl
						placeholder="Ivan Horvat"
						value={this.props.modalFormValue}
						onChange={this.props.modalFormOnChange}
					/>
				</Modal.Body>
				<Modal.Footer>
					{this.props.modalData.status === AppointmentStatus.New &&
						<Button variant="danger" onClick={this.props.onDelete}>
							Delete
              </Button>
					}
					<Button variant="success" onClick={this.props.onSave}>
						Save Changes
            </Button>
				</Modal.Footer>

				<ModalAlert
					show={this.props.warningShown}
					variant={this.props.warningType}
					description={this.props.warningMessage}
					onClick={this.props.clearWarning} />
			</Modal >
		)
	}
}