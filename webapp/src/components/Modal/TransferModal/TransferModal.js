import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { Button } from 'semantic-ui-react'
import BaseModal from '../BaseModal'
import Loading from 'components/Loading'
import SuccessCheck from 'components/SuccessCheck'
import EtherscanLink from 'components/EtherscanLink'
import { transferType } from 'components/types'

import { preventDefault } from 'lib/utils'

import './TransferModal.css'

export default class TransferModal extends React.PureComponent {
  static propTypes = {
    ...BaseModal.propTypes,
    transfer: transferType,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    address: PropTypes.string,
    onTransfer: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  handleAddressChange = e => {
    const { error, cleanTransfer } = this.props
    const { address } = this.state
    const newAddress = e.currentTarget.value

    if (address !== newAddress) {
      if (error) cleanTransfer()
      this.setState({ address: newAddress })
    }
  }

  handleTransfer = () => {
    const parcel = this.getParcel()
    const newAddress = this.state.address.trim()

    this.props.onTransfer(parcel, newAddress)
  }

  handleClose = () => {
    const { onClose, cleanTransfer } = this.props

    onClose()
    cleanTransfer()
  }

  getParcel() {
    return this.props.data
  }

  getClassName() {
    const { error } = this.props
    return `address-input ${error ? 'address-input-error' : ''}`
  }

  isEmptyAddress() {
    return this.state.address.trim() === ''
  }

  isTransferError(error) {
    return !error.includes('Error: Error:')
  }

  render() {
    const { isLoading, transfer, error, ...props } = this.props
    const { address } = this.state
    const { x, y } = this.getParcel()
    const className = this.getClassName()

    return (
      <BaseModal
        className="TransferModal modal-lg"
        {...props}
        onClose={this.handleClose /* Override deafult onClose */}
      >
        <div className="banner">
          <h2>
            Transfer LAND {x},{y}
          </h2>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <Loading />
          ) : !error && transfer.hash ? (
            <div>
              <SuccessCheck />
              <p className="success-text">
                <h4>Transaction sent successfully!</h4>
                You can check its status on etherscan
              </p>
              <span className="close-link" onClick={this.handleClose}>
                close
              </span>
              <EtherscanLink txHash={transfer.hash}>
                <Button type="submit" primary={true} onClick={this.handleClose}>
                  Go to Etherscan
                </Button>
              </EtherscanLink>
            </div>
          ) : (
            <form
              action=""
              method="POST"
              onSubmit={preventDefault(this.handleTransfer)}
            >
              <div className="text">
                <p>
                  Remember that transfering LAND is an irreversible operation.<br />
                  Please check the address carefully.
                </p>

                <div className="address-container">
                  <label htmlFor="address-input">Recipient address</label>
                  <input
                    id="address-input"
                    className={className}
                    type="text"
                    placeholder="Ex: 0x0f5d2fb29fb7d3cfee444a200298f468908cc942"
                    value={address}
                    onChange={this.handleAddressChange}
                    autoComplete="off"
                    autoFocus={true}
                  />
                  {error && (
                    <div className="error-message">
                      {this.isTransferError(error) ? (
                        error
                      ) : (
                        <span>
                          An unknown error occurred, the details are below.<br />
                          If the problem persists, contact us at our&nbsp;
                          <Link
                            to="https://chat.decentraland.org"
                            target="_blank"
                          >
                            Community Chat
                          </Link>.<br />
                          <div className="error-stack">{error}</div>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="submit-transfer">
                <Button
                  type="submit"
                  primary={true}
                  disabled={this.isEmptyAddress()}
                >
                  TRANSFER
                </Button>
              </div>
            </form>
          )}
        </div>
      </BaseModal>
    )
  }
}
