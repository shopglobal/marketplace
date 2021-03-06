import { Model } from 'decentraland-commons'

import { coordinates } from './coordinates'

export class Parcel extends Model {
  static tableName = 'parcels'
  static columnNames = [
    'id',
    'x',
    'y',
    'name',
    'description',
    'price',
    'district_id'
  ]

  static buildId(x, y) {
    if (x == null || y == null) {
      throw new Error(
        `You need to supply both coordinates to be able to hash them. x = ${x} y = ${y}`
      )
    }

    return `${x},${y}`
  }

  static async findInIds(ids) {
    const inPlaceholders = ids.map((id, index) => `$${index + 1}`)
    if (ids.length === 0) return []

    return await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id IN (${inPlaceholders})`,
      ids
    )
  }

  static async inRange(min, max) {
    const [minx, miny] = coordinates.toArray(min)
    const [maxx, maxy] = coordinates.toArray(max)

    return await this.db.query(
      `SELECT * FROM ${this.tableName}
        WHERE x >= $1 AND y >= $2
          AND x <= $3 AND y <= $4`,
      [minx, miny, maxx, maxy]
    )
  }

  static async getPrice(x, y) {
    const result = await this.db.query(
      `SELECT price
        FROM ${this.tableName}
        WHERE x = $1 AND y = $2`,
      [x, y]
    )

    return result.length ? result[0].price : 0
  }

  static async insert(parcel) {
    const { x, y } = parcel
    parcel.id = Parcel.buildId(x, y)

    return await super.insert(parcel)
  }
}
