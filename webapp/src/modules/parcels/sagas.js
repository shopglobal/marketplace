import { takeEvery, select, all, call, put } from 'redux-saga/effects'
import { eth } from 'decentraland-commons'
import { LANDRegistry } from 'decentraland-commons/dist/contracts/LANDRegistry'
import {
  FETCH_PARCELS_REQUEST,
  FETCH_PARCEL_REQUEST,
  FETCH_PARCEL_DATA_REQUEST,
  EDIT_PARCEL_REQUEST,
  fetchParcelSuccess,
  fetchParcelFailure,
  fetchParcelsSuccess,
  fetchParcelsFailure,
  editParcelSuccess,
  editParcelFailure,
  fetchParcelDataSuccess,
  fetchParcelDataFailure
} from './actions'
import { getParcels } from './selectors'
import { api } from 'lib/api'
import { buildCoordinate } from 'lib/utils'
import { inBounds } from 'lib/parcelUtils'

export function* parcelsSaga() {
  yield takeEvery(FETCH_PARCELS_REQUEST, handleParcelsRequest)
  yield takeEvery(FETCH_PARCEL_REQUEST, handleParcelRequest)
  yield takeEvery(FETCH_PARCEL_DATA_REQUEST, handleParcelDataRequest)
  yield takeEvery(EDIT_PARCEL_REQUEST, handleEditParcelsRequest)
}

function* handleParcelsRequest(action) {
  try {
    const nw = buildCoordinate(action.nw.x, action.nw.y)
    const se = buildCoordinate(action.se.x, action.se.y)
    const parcels = yield call(() => api.fetchParcels(nw, se))

    yield put(fetchParcelsSuccess(parcels))
  } catch (error) {
    yield put(fetchParcelsFailure(error.message))
  }
}

function* handleParcelRequest(action) {
  const { x, y } = action
  try {
    const parcelId = buildCoordinate(x, y)
    const nw = parcelId
    const se = parcelId

    if (!inBounds(x, y)) {
      throw new Error(`Coords (${x}, ${y}) are outside of the valid bounds`)
    }

    let [parcels, data] = yield all([
      api.fetchParcels(nw, se),
      api.fetchParcelData(x, y)
    ])
    const parcel = parcels.find(p => p.id === parcelId)
    Object.assign(parcel, { data })
    yield put(fetchParcelSuccess(x, y, parcel))
  } catch (error) {
    console.warn(error)
    yield put(fetchParcelFailure(x, y, error.message))
  }
}

function* handleParcelDataRequest(action) {
  const { x, y } = action
  try {
    if (!inBounds(x, y)) {
      throw new Error(`Coords (${x}, ${y}) are outside of the valid bounds`)
    }

    const parcels = yield select(getParcels)
    const parcel = parcels[buildCoordinate(x, y)]
    if (!parcel) {
      throw new Error(
        `Parcel (${x}, ${y}) is not in the state. Valid parcels are: ${Object.keys(
          parcels
        )}`
      )
    }

    const data = yield call(() => api.fetchParcelData(x, y))
    const newParcel = { ...parcel, data }
    yield put(fetchParcelDataSuccess(x, y, newParcel))
  } catch (error) {
    yield put(fetchParcelDataFailure(x, y, error.message))
  }
}

function* handleEditParcelsRequest(action) {
  try {
    const parcel = action.parcel
    const { x, y, data } = parcel

    const contract = eth.getContract('LANDRegistry')
    const dataString = LANDRegistry.encodeLandData(data)
    yield call(() => contract.updateLandData(x, y, dataString))

    yield put(editParcelSuccess(parcel))
  } catch (error) {
    const parcels = yield select(getParcels)
    const { x, y } = action.parcel
    const parcel = parcels[buildCoordinate(x, y)]
    yield put(editParcelFailure(parcel, error.message))
  }
}
