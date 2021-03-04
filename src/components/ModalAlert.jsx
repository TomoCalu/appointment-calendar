import React, { Component } from 'react';
import { Button, Alert } from 'react-bootstrap'

class ModalAlert extends Component {
	render() {
		return (
			<Alert show={this.props.show} variant={this.props.variant} >
				<p>
					{this.props.description}
				</p>
				<hr />
				<div className="d-flex justify-content-end">
					<Button onClick={this.props.onClick} variant={"outline-" + this.props.variant}>
						Close
          </Button>
				</div>
			</Alert>
		)
	}
}

export default ModalAlert;