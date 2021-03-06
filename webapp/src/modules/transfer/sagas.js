import { call, select, takeLatest, put } from 'redux-saga/effects'
import { eth } from 'decentraland-commons'
import {
  TRANSFER_PARCEL_REQUEST,
  transferParcelSuccess,
  transferParcelFailure
} from './actions'
import { getAddress } from 'modules/wallet/selectors'

export function* transferSaga() {
  yield takeLatest(TRANSFER_PARCEL_REQUEST, handleTransferRequest)
}

function* handleTransferRequest(action) {
  try {
    const oldOwner = yield select(getAddress)
    const { x, y } = action.parcel
    const newOwner = action.address

    if (oldOwner.toLowerCase() === newOwner.toLowerCase()) {
      throw new Error("You can't transfer parcels to yourself")
    }
    if (!eth.utils.isValidAddress(newOwner)) {
      throw new Error('Invalid Ethereum address')
    }

    const contract = eth.getContract('LANDRegistry')
    const hash = yield call(() => contract.transferTo(x, y, newOwner))

    const transfer = { hash, oldOwner, newOwner, x, y }
    yield put(transferParcelSuccess(transfer))
  } catch (error) {
    // "Recommended" way to check for rejections
    // https://github.com/MetaMask/faq/issues/6#issuecomment-264900031
    const message = error.message.includes('User denied transaction signature')
      ? 'Transaction rejected'
      : error.message

    yield put(transferParcelFailure(message))
  }
}
