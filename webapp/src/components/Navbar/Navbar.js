import React from 'react'
import { Link } from 'react-router-dom'

import { locations } from 'locations'
import Icon from 'components/Icon'

import './Navbar.css'

export default class Navbar extends React.PureComponent {
  render() {
    return (
      <div className="navbar" role="navigation">
        <div className="navbar-header">
          <Link to={locations.root} className="navbar-logo">
            <Icon name="decentraland" className="pull-left" />
            <h1 className="pull-left hidden-xs">Decentraland</h1>
          </Link>
        </div>
        <div id="navbar" className="navbar-container">
          <ul className="nav navbar-nav navbar-right">
            <li>
              <Link to={locations.root}>LAND Manager</Link>
            </li>

            <li>
              <Link to="https://blog.decentraland.org" target="_blank">
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
